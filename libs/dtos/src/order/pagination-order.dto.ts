import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'apps/orders/src/types/order-status.enum';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class OrderPaginationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'pending', enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: 'user_**********', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ example: 'keyword', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
