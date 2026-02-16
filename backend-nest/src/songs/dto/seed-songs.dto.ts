import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';

export enum SeedSource {
  SEARCH = 'search',
  TRENDING = 'trending',
  GENRE = 'genre',
}

export class SeedSongsDto {
  @IsEnum(SeedSource)
  source: 'search' | 'trending' | 'genre';

  @IsOptional()
  @IsString()
  query?: string; // Required for 'search'

  @IsOptional()
  @IsInt()
  @Min(1)
  genreId?: number; // Required for 'genre'
}
