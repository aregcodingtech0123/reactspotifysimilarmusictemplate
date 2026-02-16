/**
 * Optional JWT guard: does not throw when token is missing or invalid.
 * Attaches user to request when token is valid; otherwise request.user is undefined.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err || !user) return null;
    return user;
  }
}
