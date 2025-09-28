import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Full name of the author' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Biography of the author' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Literary period (e.g., Romanticism)' })
  @IsNotEmpty()
  @IsString()
  litPeriod: string;

  @ApiProperty({ description: 'Author Image' })
  @IsNotEmpty()
  @IsString()
  authorImage: string;

  @ApiProperty({ description: 'Birth date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  bornDate: string;

  @ApiPropertyOptional({ description: 'Death date (YYYY-MM-DD if applicable)' })
  @IsOptional()
  @IsString()
  deathDate?: string;
}
