import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.APPROVED,
    description: 'New status of the order',
  })
  @IsEnum(OrderStatus, {
    message: 'Status must be one of PENDING, APPROVED, REJECTED, RETURNED',
  })
  status: OrderStatus;
}
