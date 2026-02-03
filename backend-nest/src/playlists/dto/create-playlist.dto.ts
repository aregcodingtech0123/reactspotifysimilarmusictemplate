import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @MinLength(1, { message: 'Playlist name is required' })
  @MaxLength(128)
  name: string;
}
