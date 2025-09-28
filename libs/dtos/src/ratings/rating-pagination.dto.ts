import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  limit?: number = 10;
}
