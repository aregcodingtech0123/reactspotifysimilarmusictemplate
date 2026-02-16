/**
 * Root module: imports Prisma, Auth, Users, Playlists.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { ContactModule } from './contact/contact.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PlaylistsModule, ContactModule, SongsModule],
})
export class AppModule {}
