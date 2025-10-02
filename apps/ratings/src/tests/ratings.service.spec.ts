import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types, Model, Document, QueryWithHelpers } from 'mongoose';
import { faker } from '@faker-js/faker';
import { RatingService } from '../ratings.service';
import { Rating, RatingDocument } from '../model/rating.model';
import { CreateRatingDto } from '@app/dtos/ratings/create-rating.dto';
import { UpdateRatingDto } from '@app/dtos/ratings/update-rating.dto';
import { PaginationDto } from '@app/dtos/ratings/rating-pagination.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

type MockQuery<T> = Partial<
  Pick<QueryWithHelpers<T, Document>, 'sort' | 'skip' | 'limit' | 'populate'>
> & {
  exec: jest.Mock<Promise<T>>;
};

describe('RatingService', () => {
  let service: RatingService;
  let ratingModel: Model<RatingDocument>;

  const mockRatingModel: Partial<Model<RatingDocument>> = {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getModelToken(Rating.name), useValue: mockRatingModel },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingModel = module.get<Model<RatingDocument>>(getModelToken(Rating.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------- findAll -------------------
  describe('findAll', () => {
    it('should return paginated ratings', async () => {
      const pagination: PaginationDto = { page: 1, limit: 2 };
      const fakeRatings: RatingDocument[] = [
        {
          _id: new Types.ObjectId(),
          value: 5,
          bookId: new Types.ObjectId(),
          comment: faker.lorem.sentence(),
        } as RatingDocument,
        {
          _id: new Types.ObjectId(),
          value: 4,
          bookId: new Types.ObjectId(),
          comment: faker.lorem.sentence(),
        } as RatingDocument,
      ];

      const mockQuery: MockQuery<RatingDocument[]> = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeRatings),
      };

      (ratingModel.find as jest.Mock).mockReturnValue(mockQuery);
      (ratingModel.countDocuments as jest.Mock).mockResolvedValue(10);

      const result = await service.findAll(pagination);

      expect(result).toEqual({
        data: fakeRatings,
        meta: { total: 10, page: 1, limit: 2, totalPages: 5 },
      });
    });

    it('should throw BadRequestException for invalid page or limit', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ------------------- findOne -------------------
  describe('findOne', () => {
    it('should return a rating if found', async () => {
      const id = new Types.ObjectId().toHexString();
      const fakeRating: RatingDocument = {
        _id: new Types.ObjectId(),
        value: 5,
        bookId: new Types.ObjectId(),
        comment: faker.lorem.sentence(),
      } as RatingDocument;

      // Mock findById().populate() chain
      const mockFindById = {
        populate: jest.fn().mockResolvedValue(fakeRating),
      };

      (ratingModel.findById as jest.Mock).mockReturnValue(mockFindById);

      const result = await service.findOne(id);
      expect(result).toEqual(fakeRating);
      expect(mockFindById.populate).toHaveBeenCalledWith('bookId');
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if rating not found', async () => {
      const id = new Types.ObjectId().toHexString();

      const mockFindById = {
        populate: jest.fn().mockResolvedValue(null),
      };

      (ratingModel.findById as jest.Mock).mockReturnValue(mockFindById);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockFindById.populate).toHaveBeenCalledWith('bookId');
    });
  });

  // ------------------- create -------------------
  describe('create', () => {
    it('should create and return a rating', async () => {
      const dto: CreateRatingDto = {
        bookId: faker.number.int({ min: 1, max: 1000 }),
        value: 4,
        comment: faker.lorem.sentence(),
      };

      const fakeRating: RatingDocument = {
        _id: new Types.ObjectId(),
        value: dto.value,
        bookId: dto.bookId,
        comment: dto.comment,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...dto,
        }),
      } as unknown as RatingDocument;

      jest
        .spyOn(ratingModel.prototype, 'save')
        .mockImplementation(fakeRating.save);

      const result = await service.create(dto);
      expect(result).toHaveProperty('value', dto.value);
      expect(result).toHaveProperty('comment', dto.comment);
    });

    it('should throw BadRequestException for invalid bookId', async () => {
      const dto: CreateRatingDto = {
        bookId: faker.number.int({ min: 1, max: 1000 }),
        value: 5,
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------- update -------------------
  describe('update', () => {
    it('should update and return the rating', async () => {
      const id = new Types.ObjectId().toHexString();
      const dto: UpdateRatingDto = { value: 3 };
      const fakeRating: RatingDocument = {
        value: 5,
        comment: 'old',
        save: jest.fn().mockResolvedValue({ value: 3 }),
      } as unknown as RatingDocument;

      (ratingModel.findById as jest.Mock).mockResolvedValue(fakeRating);

      const result = await service.update(id, dto);
      expect(result).toEqual({ value: 3 });
      expect(fakeRating.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.update('invalid', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if rating not found', async () => {
      const id = new Types.ObjectId().toHexString();
      (ratingModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.update(id, { value: 3 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ------------------- remove -------------------
  describe('remove', () => {
    it('should delete a rating', async () => {
      const id = new Types.ObjectId().toHexString();
      const fakeRating: RatingDocument = {
        deleteOne: jest.fn().mockResolvedValue(undefined),
      } as unknown as RatingDocument;

      (ratingModel.findById as jest.Mock).mockResolvedValue(fakeRating);

      const result = await service.remove(id);
      expect(result).toEqual({ message: `Rating ${id} deleted successfully` });
      expect(fakeRating.deleteOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if rating not found', async () => {
      const id = new Types.ObjectId().toHexString();
      (ratingModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
