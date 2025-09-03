import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: 1, description: 'The ID of the book being rated' })
  @IsInt()
  bookId: number;

  @ApiProperty({ example: 4, description: 'The rating value (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @ApiProperty({ example: 'Great book!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
