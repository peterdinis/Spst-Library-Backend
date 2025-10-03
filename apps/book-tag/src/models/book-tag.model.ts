import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookTagDocument = BookTag & Document;

@Schema({ timestamps: true })
export class BookTag {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }], default: [] })
  books: Types.Array<Types.ObjectId>;
}

export const BookTagSchema = SchemaFactory.createForClass(BookTag);
