import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop()
  userEmail: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'info' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
