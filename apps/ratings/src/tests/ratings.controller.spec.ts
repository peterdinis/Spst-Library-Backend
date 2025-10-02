import { Test, TestingModule } from '@nestjs/testing';
import { CreateRatingDto } from '@app/dtos/ratings/create-rating.dto';
import { UpdateRatingDto } from '@app/dtos/ratings/update-rating.dto';
import { PaginationDto } from '@app/dtos/ratings/rating-pagination.dto';
import { faker } from '@faker-js/faker';
import { RatingController } from '../ratings.controller';
import { RatingService } from '../ratings.service';

describe('RatingController', () => {
  let controller: RatingController;
  let service: RatingService;

  const mockRatingService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingController],
      providers: [
        {
          provide: RatingService,
          useValue: mockRatingService,
        },
      ],
    }).compile();

    controller = module.get<RatingController>(RatingController);
    service = module.get<RatingService>(RatingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----------------- Positive Tests -----------------

  describe('findAll', () => {
    it('should return paginated ratings', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const result = {
        data: Array.from({ length: 3 }).map(() => ({
          id: faker.string.uuid(),
          value: faker.number.int({ min: 1, max: 5 }),
          bookId: faker.number.int({ min: 1, max: 1000 }),
          comment: faker.lorem.sentence(),
        })),
        total: 3,
      };
      mockRatingService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(pagination)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
    });
  });

  describe('findOne', () => {
    it('should return a single rating by ID', async () => {
      const id = faker.string.uuid();
      const result = {
        id,
        value: faker.number.int({ min: 1, max: 5 }),
        bookId: faker.number.int({ min: 1, max: 1000 }),
        comment: faker.lorem.sentence(),
      };
      mockRatingService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should create a new rating', async () => {
      const dto: CreateRatingDto = {
        bookId: faker.number.int({ min: 1, max: 1000 }),
        value: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      };
      const result = { id: faker.string.uuid(), ...dto };
      mockRatingService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a rating', async () => {
      const id = faker.string.uuid();
      const dto: UpdateRatingDto = {
        value: faker.number.int({ min: 1, max: 5 }),
      };
      const result = { id, ...dto };
      mockRatingService.update.mockResolvedValue(result);

      expect(await controller.update(id, dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a rating', async () => {
      const id = faker.string.uuid();
      const result = { deleted: true };
      mockRatingService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  // ----------------- Negative / Error Tests -----------------

  describe('findOne - error', () => {
    it('should return null if rating not found', async () => {
      const id = faker.string.uuid();
      mockRatingService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update - error', () => {
    it('should throw an error if rating does not exist', async () => {
      const id = faker.string.uuid();
      const dto: UpdateRatingDto = { value: 3 };
      mockRatingService.update.mockImplementation(() => {
        throw new Error('Rating not found');
      });

      await expect(controller.update(id, dto)).rejects.toThrow(
        'Rating not found',
      );
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove - error', () => {
    it('should throw an error if deletion fails', async () => {
      const id = faker.string.uuid();
      mockRatingService.remove.mockImplementation(() => {
        throw new Error('Rating cannot be deleted');
      });

      await expect(controller.remove(id)).rejects.toThrow(
        'Rating cannot be deleted',
      );
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('create - error', () => {
    it('should throw an error if invalid data provided', async () => {
      const dto: CreateRatingDto = {
        bookId: -1, // invalid bookId
        value: 10, // invalid value
      };
      mockRatingService.create.mockImplementation(() => {
        throw new Error('Invalid rating data');
      });

      await expect(controller.create(dto)).rejects.toThrow(
        'Invalid rating data',
      );
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
