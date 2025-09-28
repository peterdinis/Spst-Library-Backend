import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  year?: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isNew: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  categoryId?: Types.ObjectId;

  // Author reference (required)
  @Prop({ type: Types.ObjectId, ref: 'Author', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'BookTag' }] })
  bookTags: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Rating' }] })
  ratings: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }] })
  orderItems: Types.ObjectId[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
