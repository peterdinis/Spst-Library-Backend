import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A novel set in the Jazz Age.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1925 })
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;
}
