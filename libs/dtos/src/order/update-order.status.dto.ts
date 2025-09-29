import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'apps/orders/src/types/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'ID of the order' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
