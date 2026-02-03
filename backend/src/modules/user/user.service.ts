/**
 * User service: business logic using user repository.
 */
import { userRepository } from './user.repository';
import { AppError } from '../../middlewares/error.middleware';
import type { UserPublic } from './user.types';

export const userService = {
  async getMe(userId: string): Promise<UserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  },
};
