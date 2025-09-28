import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

describe('RatingsController', () => {
  let ratingsController: RatingsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [RatingsService],
    }).compile();

    ratingsController = app.get<RatingsController>(RatingsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ratingsController.getHello()).toBe('Hello World!');
    });
  });
});
