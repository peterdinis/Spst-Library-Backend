import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './model/notification.model';
import { MessagesModule } from 'libs/messages/messages.module';
import { MailService } from 'libs/mails/mails.service';

@Module({
  imports: [
    DatabaseModule,
    MessagesModule,
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, MailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
