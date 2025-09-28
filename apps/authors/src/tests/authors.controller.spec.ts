import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

describe('AuthorsController', () => {
  let authorsController: AuthorsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [AuthorsService],
    }).compile();

    authorsController = app.get<AuthorsController>(AuthorsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authorsController.getHello()).toBe('Hello World!');
    });
  });
});
