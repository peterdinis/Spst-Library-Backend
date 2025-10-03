import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ type: String, required: true }) 
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number })
  year?: number;

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean;

  @Prop({ type: Boolean, default: false })
  isNew: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  categoryId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Author', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'BookTag' }], default: [] })
  bookTags: Types.Array<Types.ObjectId>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Rating' }], default: [] })
  ratings: Types.Array<Types.ObjectId>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }], default: [] })
  orderItems: Types.Array<Types.ObjectId>;
}

export const BookSchema = SchemaFactory.createForClass(Book);
