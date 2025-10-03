import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Book } from 'apps/books/src/model/book.model';
import { Document, Types } from 'mongoose';

export type AuthorDocument = Author & Document;

@Schema({ timestamps: true })
export class Author {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: String, required: true })
  litPeriod: string;

  @Prop({ type: String, default: '' })
  authorImage: string;

  @Prop({ type: String, required: true })
  bornDate: string;

  @Prop({ type: String })
  deathDate?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.Array<Book>;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
