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

  @ApiPropertyOptional({ example: '64fa1c2b3f1e2a6b8d123456' })
  @IsString()
  @IsOptional()
  categoryId?: string; 

  @ApiProperty({ example: '64fa1c2b3f1e2a6b8d123457' })
  @IsString()
  authorId: string;
}
