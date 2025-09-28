import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Book } from 'apps/books/src/model/book.model';
import { Document, Types } from 'mongoose';

export type AuthorDocument = Author & Document;

@Schema({ timestamps: true })
export class Author {
  @Prop({ required: true })
  name: string;

  @Prop()
  bio?: string;

  @Prop({ required: true })
  litPeriod: string;

  @Prop({ default: '' })
  authorImage: string;

  @Prop({ required: true })
  bornDate: string;

  @Prop()
  deathDate?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.Array<Book>;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
