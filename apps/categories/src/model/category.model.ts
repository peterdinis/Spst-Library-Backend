import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }], default: [] })
  books: Types.Array<Types.ObjectId>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
