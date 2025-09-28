import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthorSuggestionDocument = AuthorSuggestion & Document;


export enum SuggestionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class AuthorSuggestion {
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

  @Prop()
  suggestedByName?: string;

  @Prop({ enum: SuggestionStatus, default: SuggestionStatus.PENDING })
  status: SuggestionStatus;
}

export const AuthorSuggestionSchema =
  SchemaFactory.createForClass(AuthorSuggestion);
