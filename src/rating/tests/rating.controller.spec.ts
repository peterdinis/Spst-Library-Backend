import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingController } from '../rating.controller';
import { RatingService } from '../rating.service';

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

  describe('findAll', () => {
    it('should return paginated ratings', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const result = { data: [], total: 0 };
      mockRatingService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(paginationDto)).toEqual(result);
      expect(mockRatingService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('findOne', () => {
    it('should return a rating by id', async () => {
      const result = { id: 1, value: 5 };
      mockRatingService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockRatingService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if rating not found', async () => {
      mockRatingService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRatingService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a new rating', async () => {
      const dto: CreateRatingDto = { bookId: 1, value: 5, comment: 'Great!' };
      const result = { id: 1, ...dto };
      mockRatingService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockRatingService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a rating', async () => {
      const dto: UpdateRatingDto = { value: 4 };
      const result = { id: 1, value: 4 };
      mockRatingService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toEqual(result);
      expect(mockRatingService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a rating', async () => {
      const result = { id: 1 };
      mockRatingService.remove.mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(mockRatingService.remove).toHaveBeenCalledWith(1);
    });
  });
});
