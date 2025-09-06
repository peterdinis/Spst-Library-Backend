import { ApiProperty } from "@nestjs/swagger";
import { CreateOrderItemDto } from "./create-order-item.dto";
import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class CreateOrderDto {
  @ApiProperty({ description: 'ID of the user placing the order', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Items in the order',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}