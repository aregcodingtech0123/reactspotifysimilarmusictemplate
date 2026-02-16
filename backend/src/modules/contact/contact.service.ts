/**
 * Contact service: persist contact messages (optional user link or email).
 */
import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/error.middleware';

const SPAM_WINDOW_MS = 60 * 1000; // 1 minute

export interface SubmitContactInput {
  message: string;
  userId?: string;
  email?: string;
}

export interface SubmitContactResult {
  id: string;
  createdAt: Date;
}

export async function submitContact(input: SubmitContactInput): Promise<SubmitContactResult> {
  const message = input.message?.trim();
  if (!message) {
    throw new AppError(400, 'Message cannot be empty');
  }

  const userId = input.userId || null;
  const email = input.email?.trim() || null;

  if (!userId && !email) {
    throw new AppError(400, 'Email is required when not logged in');
  }

  // Spam: max 1 message per minute per user or per email
  const since = new Date(Date.now() - SPAM_WINDOW_MS);
  if (userId) {
    const recent = await prisma.contactMessage.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (recent > 0) {
      throw new AppError(429, 'Please wait at least one minute before sending another message.');
    }
  } else if (email) {
    const recent = await prisma.contactMessage.count({
      where: { email, userId: null, createdAt: { gte: since } },
    });
    if (recent > 0) {
      throw new AppError(429, 'Please wait at least one minute before sending another message.');
    }
  }

  const contact = await prisma.contactMessage.create({
    data: {
      message,
      userId: userId ?? undefined,
      email: email ?? undefined,
    },
  });

  return { id: contact.id, createdAt: contact.createdAt };
}
