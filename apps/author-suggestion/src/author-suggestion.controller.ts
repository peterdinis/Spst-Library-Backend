import { Controller, Get } from '@nestjs/common';
import { AuthorSuggestionService } from './author-suggestion.service';

@Controller()
export class AuthorSuggestionController {
  constructor(private readonly authorSuggestionService: AuthorSuggestionService) {}

  @Get()
  getHello(): string {
    return this.authorSuggestionService.getHello();
  }
}
