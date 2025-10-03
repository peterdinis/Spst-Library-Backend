import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  userEmail: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, default: 'info' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
