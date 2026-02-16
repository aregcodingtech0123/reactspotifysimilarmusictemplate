import { IsString, MinLength, MaxLength } from 'class-validator';

export class AddTrackDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(256)
  title: string;

  @IsString()
  @MinLength(1, { message: 'Artist is required' })
  @MaxLength(256)
  artist: string;
}
