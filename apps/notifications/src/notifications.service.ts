import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { MessagesService } from 'libs/messages/messages.service';
import { Notification } from './model/notification.model';
import { NotificationDocument } from './types/NotificationTypes';
import {
  CreateNotificationDto,
  CreateOrderNotificationDto,
  ReturnOrderNotificationDto,
} from '@app/dtos';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private messagesService: MessagesService,
  ) {}

  async createOrderNotification(notificationDto: CreateOrderNotificationDto) {
    if (!notificationDto.userEmail || !notificationDto.message) {
      throw new BadRequestException('Email and message are required');
    }

    try {
      const notification = new this.notificationModel({
        userEmail: notificationDto.userEmail,
        message: notificationDto.message,
        type: notificationDto.type,
      });
      const saved = await notification.save();

      await this.messagesService.sendKafkaMessage('notification.created', {
        id: saved._id.toString(),
        userEmail: notificationDto.userEmail,
        message: notificationDto.message,
        type: notificationDto.type,
      });

      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async createReturnOrderNotification(
    createReturnDto: ReturnOrderNotificationDto,
  ) {
    if (!createReturnDto.userEmail || !createReturnDto.message) {
      throw new BadRequestException('userEmail and message are required');
    }

    try {
      const notification = new this.notificationModel({
        userEmail: createReturnDto.userEmail,
        message: createReturnDto.message,
        type: createReturnDto.type,
      });
      const saved = await notification.save();

      await this.messagesService.sendKafkaMessage('notification.created', {
        id: saved._id.toString(),
        userEmail: createReturnDto.userEmail,
        message: createReturnDto.message,
        type: createReturnDto.type,
      });

      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async create(notificationDto: CreateNotificationDto) {
    if (!notificationDto.userId || !notificationDto.message) {
      throw new BadRequestException('userId and message are required');
    }

    try {
      const notification = new this.notificationModel({
        userId: notificationDto.userId,
        message: notificationDto.message,
        type: notificationDto.type,
      });
      const saved = await notification.save();

      await this.messagesService.sendKafkaMessage('notification.created', {
        id: saved._id.toString(),
        userId: notificationDto.userId,
        message: notificationDto.message,
        type: notificationDto.type,
      });

      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async findByUser(userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      const notifications = await this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 });

      return notifications;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch notifications');
    }
  }

  async markAsRead(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid notification ID');
    }

    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true },
      );

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.messagesService.sendKafkaMessage('notification.read', {
        id: notification._id.toString(),
        isRead: true,
        updatedAt: new Date().toISOString(),
      });

      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update notification');
    }
  }
}
