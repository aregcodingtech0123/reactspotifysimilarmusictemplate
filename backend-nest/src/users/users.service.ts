/**
 * Users service: same logic as Express user service.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserPublic {
  id: string;
  username: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
