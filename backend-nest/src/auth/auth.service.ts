/**
 * Auth service: same business logic as Express backend.
 */
import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const SALT_ROUNDS = 12;

export interface AuthResponse {
  user: { id: string; username: string; email: string };
  accessToken: string;
  expiresIn: string;
}

export interface MeResponse {
  id: string;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email) throw new ConflictException('Email already registered');
      throw new ConflictException('Username already taken');
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { username, email, password: hashed },
    });
    const accessToken = this.jwt.sign(
      { sub: user.id, username: user.username },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
    return {
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    const accessToken = this.jwt.sign(
      { sub: user.id, username: user.username },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
    return {
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
  }

  async getMe(userId: string): Promise<MeResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
