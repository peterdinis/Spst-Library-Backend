import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderStatusDto } from '@app/dtos';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all orders by user' })
  @ApiParam({ name: 'userId', type: String })
  async getOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.getOrdersForUser(userId);
  }

  @Patch('status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(dto);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return a completed order' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the order to return',
  })
  async returnOrder(@Param('id') id: string) {
    return this.ordersService.returnOrder(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the order to cancel',
  })
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve an order (set status to APPROVED)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the order to approve',
  })
  async approveOrder(@Param('id') id: string) {
    return this.ordersService.approveOrder(id);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline an order (set status to DECLINED)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the order to decline',
  })
  async declineOrder(@Param('id') id: string) {
    return this.ordersService.declineOrder(id);
  }
}
