import { IsOptional, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBooksDto {
  @ApiPropertyOptional({ example: '64fa1c2b3f1e2a6b8d123457', description: 'Filter by Author ID' })
  @IsOptional()
  @IsString()        
  authorId?: string;

  @ApiPropertyOptional({ example: '64fa1c2b3f1e2a6b8d123456', description: 'Filter by Category ID' })
  @IsOptional()
  @IsString()        
  categoryId?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by availability' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Filter by new books' })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Filter by published year (min)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearMin?: number;

  @ApiPropertyOptional({
    example: 2020,
    description: 'Filter by published year (max)',
  })
  @IsOptional()
  @IsInt()
  @Max(new Date().getFullYear())
  yearMax?: number;
}
