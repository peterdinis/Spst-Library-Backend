import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID of the book'})
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ description: 'Quantity of the book', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
