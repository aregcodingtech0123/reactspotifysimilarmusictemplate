/**
 * JWT utilities: sign and verify access tokens.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(
    { sub: payload.sub, username: payload.username },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
  return decoded;
}
