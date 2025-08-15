import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBooksDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by book title',
    example: 'Harry Potter',
  })
  title?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Filter by author ID', example: 1 })
  authorId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Filter by category ID', example: 2 })
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Filter by published year',
    example: 2020,
  })
  publishedYear?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by language',
    example: 'English',
  })
  language?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Filter books created from this date',
    example: '2025-01-01',
  })
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Filter books created until this date',
    example: '2025-08-01',
  })
  dateTo?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number;
}
