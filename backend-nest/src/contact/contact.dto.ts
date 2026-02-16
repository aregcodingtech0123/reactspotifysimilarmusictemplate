import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for POST /api/contact.
 * - message: required.
 * - email: optional when authenticated (from JWT); required when not authenticated.
 * Validation in controller/service enforces email when user is missing.
 */
export class ContactDto {
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(10000, { message: 'Message is too long' })
  message: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255)
  email?: string;
}
