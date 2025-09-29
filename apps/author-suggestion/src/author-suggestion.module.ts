import { Module } from '@nestjs/common';
import { AuthorSuggestionController } from './author-suggestion.controller';
import { AuthorSuggestionService } from './author-suggestion.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from 'apps/authors/src/models/author.model';
import {
  AuthorSuggestion,
  AuthorSuggestionSchema,
} from './model/author-suggestion.model';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Author.name, schema: AuthorSchema },
      { name: AuthorSuggestion.name, schema: AuthorSuggestionSchema },
    ]),
  ],
  controllers: [AuthorSuggestionController],
  providers: [AuthorSuggestionService],
})
export class AuthorSuggestionModule {}
