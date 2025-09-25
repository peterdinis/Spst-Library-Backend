import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ArcjetGuard } from '@arcjet/nest';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':id')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(Number(id));
  }

  @Get('user/:userId')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Get all orders by user' })
  @ApiParam({ name: 'userId', type: Number })
  async getOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.getOrdersByUser(Number(userId));
  }

  @Patch('status')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(dto);
  }

  @Get('user/:userId/filter')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Get all orders by user' })
  @ApiParam({ name: 'userId', type: Number })
  async getOrdersByUserWithFilter(@Param('userId') userId: string) {
    const numericUserId = Number(userId);
    return this.ordersService.getOrdersByUser(numericUserId);
  }

  @Patch(':id/return')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Return a completed order' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the order to return',
  })
  async returnOrder(@Param('id') id: string) {
    return this.ordersService.returnOrder(Number(id));
  }

  @Patch(':id/cancel')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the order to cancel',
  })
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(Number(id));
  }
}
