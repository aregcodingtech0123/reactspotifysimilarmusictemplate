/**
 * Auth controller: POST register, POST login, GET me.
 */
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService, AuthResponse, MeResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ success: true; data: AuthResponse }> {
    const data = await this.auth.register(dto.username, dto.email, dto.password);
    return { success: true, data };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ success: true; data: AuthResponse }> {
    const data = await this.auth.login(dto.email, dto.password);
    return { success: true, data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: UserPayload): Promise<{ success: true; data: MeResponse }> {
    const data = await this.auth.getMe(user.id);
    return { success: true, data };
  }
}
