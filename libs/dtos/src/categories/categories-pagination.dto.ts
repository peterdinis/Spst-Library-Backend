import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class CategoriesPaginationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  limit?: number = 10;

  @ApiProperty({ example: 'fiction', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
