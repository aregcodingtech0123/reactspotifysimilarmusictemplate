/**
 * Users controller: GET /users/me (protected).
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService, UserPublic } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: UserPayload): Promise<{ success: true; data: UserPublic }> {
    const data = await this.users.getMe(user.id);
    return { success: true, data };
  }
}
