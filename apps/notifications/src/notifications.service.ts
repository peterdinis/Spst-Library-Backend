import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async create(userId: string, message: string, type = 'info') {
    if (!userId || !message) {
      throw new BadRequestException('userId and message are required');
    }

    try {
      const notification = new this.notificationModel({ userId, message, type });
      return await notification.save();
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

      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update notification');
    }
  }
}
