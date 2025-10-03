import { Controller, Get, Param, Patch, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  CreateOrderNotificationDto,
  ReturnOrderNotificationDto,
} from '@app/dtos';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a generic notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Post('order')
  @ApiOperation({ summary: 'Create an order notification' })
  @ApiResponse({ status: 201, description: 'Order notification created' })
  async createOrder(
    @Body() createOrderNotificationDto: CreateOrderNotificationDto,
  ) {
    return this.notificationService.createOrderNotification(
      createOrderNotificationDto,
    );
  }

  @Post('return-order')
  @ApiOperation({ summary: 'Create a return order notification' })
  @ApiResponse({
    status: 201,
    description: 'Return order notification created',
  })
  async createReturnOrder(
    @Body() returnOrderNotificationDto: ReturnOrderNotificationDto,
  ) {
    return this.notificationService.createReturnOrderNotification(
      returnOrderNotificationDto,
    );
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async findByUser(@Param('userId') userId: string) {
    return this.notificationService.findByUser(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
