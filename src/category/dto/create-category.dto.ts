import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Science Fiction', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Fictional books about future science',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
