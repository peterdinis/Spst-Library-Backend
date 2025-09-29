import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../types/order-status.enum';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'OrderItem' }],
    default: [],
  })
  items: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
