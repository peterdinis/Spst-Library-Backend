import { Module } from '@nestjs/common';
import { AuthorSuggestionController } from './author-suggestion.controller';
import { AuthorSuggestionService } from './author-suggestion.service';

@Module({
  imports: [],
  controllers: [AuthorSuggestionController],
  providers: [AuthorSuggestionService],
})
export class AuthorSuggestionModule {}
