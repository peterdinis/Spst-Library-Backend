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

  @Prop({ type: String })
  suggestedByName?: string;

  @Prop({
    type: String,
    enum: SuggestionStatus,
    default: SuggestionStatus.PENDING,
  })
  status: SuggestionStatus;
}

export const AuthorSuggestionSchema =
  SchemaFactory.createForClass(AuthorSuggestion);
