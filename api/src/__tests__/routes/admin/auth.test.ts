import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../../app';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    beat: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;
let passwordHash: string;

// Counter for unique IPs — isolates rate limiter state between tests
let ipCounter = 1;
function uniqueIp() { return `10.1.${Math.floor(ipCounter / 255)}.${ipCounter++ % 255}`; }

beforeAll(async () => {
  passwordHash = await bcrypt.hash('correct-password', 12);
});

function mockAdmin(override?: object) {
  return {
    id: 'admin-uuid',
    email: 'admin@cba.com',
    passwordHash,
    createdAt: new Date(),
    ...override,
  };
}

describe('POST /admin/login', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('input validation', () => {
    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'not-an-email', password: 'somepassword' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('authentication logic', () => {
    it('returns 401 when admin user does not exist', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'nobody@cba.com', password: 'correct-password' });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: 'Invalid credentials' });
    });

    it('returns 401 when password is wrong', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockAdmin() as any);

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: 'Invalid credentials' });
    });

    it('returns 200 with JWT token on correct credentials', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockAdmin() as any);

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com', password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('returns a valid, verifiable JWT with correct payload', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockAdmin() as any);

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com', password: 'correct-password' });

      const payload = jwt.verify(res.body.token, JWT_SECRET) as jwt.JwtPayload;
      expect(payload.sub).toBe('admin-uuid');
      expect(payload.email).toBe('admin@cba.com');
    });

    it('does not expose passwordHash in the response', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockAdmin() as any);

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com', password: 'correct-password' });

      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain('$2b$');
    });

    it('returns same 401 error whether user exists or not (timing attack prevention)', async () => {
      // Both missing-user and wrong-password must return identical error response,
      // preventing enumeration of valid admin emails.
      const { prisma } = await import('../../../lib/prisma');

      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(null);
      const missingUserRes = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'ghost@cba.com', password: 'any-password' });

      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockAdmin() as any);
      const wrongPassRes = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', uniqueIp())
        .send({ email: 'admin@cba.com', password: 'wrong-password' });

      expect(missingUserRes.status).toBe(401);
      expect(wrongPassRes.status).toBe(401);
      expect(missingUserRes.body.error).toBe(wrongPassRes.body.error);
    });
  });

  describe('rate limiting', () => {
    it('returns 429 after 5 failed login attempts from same IP', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(null);

      // Use a dedicated IP for this test so it doesn't bleed into other tests
      const rateLimitIp = '10.99.99.99';

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/admin/login')
          .set('X-Forwarded-For', rateLimitIp)
          .send({ email: 'ratelimit@cba.com', password: 'bad' });
      }

      const res = await request(app)
        .post('/admin/login')
        .set('X-Forwarded-For', rateLimitIp)
        .send({ email: 'ratelimit@cba.com', password: 'bad' });

      expect(res.status).toBe(429);
    });
  });
});
