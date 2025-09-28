import { Test, TestingModule } from '@nestjs/testing';
import { AuthorSuggestionController } from './author-suggestion.controller';
import { AuthorSuggestionService } from './author-suggestion.service';

describe('AuthorSuggestionController', () => {
  let authorSuggestionController: AuthorSuggestionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthorSuggestionController],
      providers: [AuthorSuggestionService],
    }).compile();

    authorSuggestionController = app.get<AuthorSuggestionController>(AuthorSuggestionController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authorSuggestionController.getHello()).toBe('Hello World!');
    });
  });
});
