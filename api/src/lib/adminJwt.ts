import jwt from 'jsonwebtoken';
import { z } from 'zod';

const adminPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
});

export type AdminPayload = z.infer<typeof adminPayloadSchema>;

const JWT_ISSUER = process.env.JWT_ISSUER ?? 'cba-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? 'cba-admin';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  return secret;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    audience: JWT_AUDIENCE,
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
    issuer: JWT_ISSUER,
  });
}

export function verifyAdminToken(token: string): AdminPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
  });

  return adminPayloadSchema.parse(decoded);
}
