import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Book } from 'apps/books/src/model/book.model';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.Array<Book>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
