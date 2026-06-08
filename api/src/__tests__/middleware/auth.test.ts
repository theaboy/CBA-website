import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { signAdminToken } from '../../lib/adminJwt';

// Mock prisma — auth middleware doesn't call prisma but the app import does
vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    beat: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'cba-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? 'cba-admin';

function makeToken(payload: object = { sub: 'admin-id', email: 'admin@cba.com' }, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, {
    audience: JWT_AUDIENCE,
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    issuer: JWT_ISSUER,
  });
}

describe('requireAuth middleware', () => {
  describe('missing / malformed Authorization header', () => {
    it('returns 401 when Authorization header is absent', async () => {
      const res = await request(app).get('/admin/beats');
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: 'Unauthorized' });
    });

    it('returns 401 when Authorization header does not start with Bearer', async () => {
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', 'Basic sometoken');
      expect(res.status).toBe(401);
    });

    it('returns 401 when token is malformed', async () => {
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', 'Bearer not.a.valid.jwt');
      expect(res.status).toBe(401);
    });
  });

  describe('expired token', () => {
    it('returns 401 with "Token expired" message', async () => {
      const expiredToken = jwt.sign(
        { sub: 'admin-id', email: 'admin@cba.com' },
        JWT_SECRET,
        { expiresIn: -1 } // already expired
      );
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token expired/i);
    });
  });

  describe('valid token', () => {
    beforeEach(async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);
    });

    it('allows request through with a valid JWT', async () => {
      const token = signAdminToken({ sub: 'admin-id', email: 'admin@cba.com' });
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${token}`);
      // 200 means auth passed (prisma returns [] so body is { beats: [] })
      expect(res.status).toBe(200);
    });

    it('rejects token signed with wrong secret', async () => {
      const badToken = jwt.sign(
        { sub: 'admin-id', email: 'admin@cba.com' },
        'wrong-secret',
        { audience: JWT_AUDIENCE, issuer: JWT_ISSUER }
      );
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${badToken}`);
      expect(res.status).toBe(401);
    });

    it('rejects token missing required admin claims', async () => {
      const badToken = makeToken({ sub: 'admin-id' });
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${badToken}`);
      expect(res.status).toBe(401);
    });

    it('rejects token with the wrong audience', async () => {
      const badToken = jwt.sign(
        { sub: 'admin-id', email: 'admin@cba.com' },
        JWT_SECRET,
        { audience: 'wrong-audience', issuer: JWT_ISSUER }
      );
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${badToken}`);
      expect(res.status).toBe(401);
    });
  });
});
