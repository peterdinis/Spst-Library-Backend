import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { MessagesService } from 'libs/messages/messages.service'; 

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private messagesService: MessagesService,
  ) {}

  async create(userId: string, message: string, type = 'info') {
    if (!userId || !message) {
      throw new BadRequestException('userId and message are required');
    }

    try {
      const notification = new this.notificationModel({
        userId,
        message,
        type,
      });
      const saved = await notification.save();

      // 🔹 po uložení pošli Kafka event
      await this.messagesService.sendKafkaMessage('notification.created', {
        id: saved._id.toString(),
        userId,
        message,
        type,
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
