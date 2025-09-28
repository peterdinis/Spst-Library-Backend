import { Test, TestingModule } from '@nestjs/testing';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';

describe('BookTagController', () => {
  let bookTagController: BookTagController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookTagController],
      providers: [BookTagService],
    }).compile();

    bookTagController = app.get<BookTagController>(BookTagController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bookTagController.getHello()).toBe('Hello World!');
    });
  });
});
