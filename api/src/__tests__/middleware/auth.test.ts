import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';

// Mock prisma — auth middleware doesn't call prisma but the app import does
vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    beat: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;

function makeToken(payload: object = { sub: 'admin-id', email: 'admin@cba.com' }, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
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
      const token = makeToken();
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${token}`);
      // 200 means auth passed (prisma returns [] so body is { beats: [] })
      expect(res.status).toBe(200);
    });

    it('rejects token signed with wrong secret', async () => {
      const badToken = jwt.sign({ sub: 'admin-id', email: 'admin@cba.com' }, 'wrong-secret');
      const res = await request(app)
        .get('/admin/beats')
        .set('Authorization', `Bearer ${badToken}`);
      expect(res.status).toBe(401);
    });
  });
});
