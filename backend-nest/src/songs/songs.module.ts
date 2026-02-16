import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { DeezerService } from './deezer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SongsController],
  providers: [SongsService, DeezerService],
  exports: [SongsService],
})
export class SongsModule {}
