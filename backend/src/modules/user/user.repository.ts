/**
 * User repository: data access only. No business logic.
 */
import { prisma } from '../../config/db';
import type { UserPublic } from './user.types';

export const userRepository = {
  async findById(id: string): Promise<UserPublic | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true },
    });
    return user as UserPublic | null;
  },
};
