import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  title: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'Scribner' })
  @IsString()
  publisherName: string;

  @ApiPropertyOptional({ example: '9780743273565' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({ example: 1925 })
  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @ApiPropertyOptional({ example: 'A classic novel set in the Jazz Age.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/gatsby.jpg' })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  categoryId: number;
}
