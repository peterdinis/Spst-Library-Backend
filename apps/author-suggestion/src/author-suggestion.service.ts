import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthorSuggestionService {
  getHello(): string {
    return 'Hello World!';
  }
}
