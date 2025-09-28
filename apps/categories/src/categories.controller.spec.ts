import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let categoriesController: CategoriesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoriesService],
    }).compile();

    categoriesController = app.get<CategoriesController>(CategoriesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(categoriesController.getHello()).toBe('Hello World!');
    });
  });
});
