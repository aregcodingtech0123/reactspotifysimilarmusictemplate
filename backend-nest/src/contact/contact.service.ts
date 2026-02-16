import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactDto } from './contact.dto';

const SPAM_WINDOW_MS = 60 * 1000; // 1 minute

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit a contact message. Caller must ensure:
   * - If user is null: dto.email is required and valid.
   * - message is non-empty (DTO + trim check).
   */
  async submit(
    user: { id: string; email: string } | null,
    dto: ContactDto,
  ): Promise<{ id: string; createdAt: Date }> {
    const message = dto.message?.trim();
    if (!message) {
      throw new BadRequestException('Message cannot be empty');
    }

    let userId: string | null = null;
    let email: string | null = null;

    if (user) {
      userId = user.id;
      email = dto.email?.trim() || user.email;
    } else {
      const emailVal = dto.email?.trim();
      if (!emailVal) {
        throw new BadRequestException('Email is required when not logged in');
      }
      email = emailVal;
    }

    await this.checkSpamLimit(userId, email);

    const contact = await this.prisma.contactMessage.create({
      data: {
        message,
        userId: userId ?? undefined,
        email: email ?? undefined,
      },
    });

    return { id: contact.id, createdAt: contact.createdAt };
  }

  /**
   * At most one message per minute per user (if authenticated) or per email (if not).
   */
  private async checkSpamLimit(userId: string | null, email: string | null): Promise<void> {
    const since = new Date(Date.now() - SPAM_WINDOW_MS);

    if (userId) {
      const recent = await this.prisma.contactMessage.count({
        where: { userId, createdAt: { gte: since } },
      });
      if (recent > 0) {
        throw new HttpException(
          'Please wait at least one minute before sending another message.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      return;
    }

    if (email) {
      const recent = await this.prisma.contactMessage.count({
        where: { email, userId: null, createdAt: { gte: since } },
      });
      if (recent > 0) {
        throw new HttpException(
          'Please wait at least one minute before sending another message.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
  }
}
