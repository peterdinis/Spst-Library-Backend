import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorSuggestionDto {
  @ApiProperty({ description: 'Author’s first and last name' })
  @IsNotEmpty({ message: 'Author name is required' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Short biography of the author' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Literary period of the author' })
  @IsNotEmpty({ message: 'Literary period is required' })
  @IsString()
  litPeriod: string;

  @ApiPropertyOptional({ description: 'URL of the author’s image' })
  @IsOptional()
  @IsString()
  authorImage?: string;

  @ApiProperty({ description: 'Date of birth of the author' })
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsString()
  bornDate: string;

  @ApiPropertyOptional({ description: 'Date of death of the author' })
  @IsOptional()
  @IsString()
  deathDate?: string;

  @ApiPropertyOptional({
    description:
      'Name of the person who suggested the author (for non-logged-in users)',
  })
  @IsOptional()
  @IsString()
  suggestedByName?: string;
}

export class UpdateAuthorSuggestionStatusDto {
  @ApiProperty({
    enum: ['APPROVED', 'REJECTED'],
    description: 'New status of the suggestion',
  })
  @IsNotEmpty()
  @IsString()
  status: 'APPROVED' | 'REJECTED';
}
