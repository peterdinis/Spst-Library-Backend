import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the account placing the order',
  })
  @IsInt()
  @Min(1)
  accountId: number;

  @ApiProperty({ example: 5, description: 'ID of the book being ordered' })
  @IsInt()
  @Min(1)
  bookId: number;
}
