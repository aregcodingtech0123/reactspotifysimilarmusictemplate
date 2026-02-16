import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './contact.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  async submit(
    @CurrentUser() user: UserPayload | null,
    @Body() dto: ContactDto,
  ): Promise<{ success: true; data: { id: string; createdAt: string } }> {
    if (!user && !dto.email?.trim()) {
      throw new BadRequestException('Email is required when not logged in');
    }
    const data = await this.contact.submit(user, dto);
    return {
      success: true,
      data: {
        id: data.id,
        createdAt: data.createdAt.toISOString(),
      },
    };
  }
}
