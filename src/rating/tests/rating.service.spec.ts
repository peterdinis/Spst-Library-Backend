import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from '../rating.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';

interface FindAllResult {
  data: { id: number }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type CacheMock = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  clear: jest.Mock;
};

describe('RatingService', () => {
  let service: RatingService;
  let prisma: {
    rating: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let cache: CacheMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: PrismaService,
          useValue: {
            rating: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            clear: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    prisma = module.get(PrismaService)
    cache = module.get(CACHE_MANAGER) as CacheMock;
  });

  describe('findAll', () => {
    it('returns cached value if exists', async () => {
      const cached = { data: ['cached'], meta: {} };
      cache.get.mockResolvedValue(cached);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(cached);
      expect(cache.get).toHaveBeenCalledWith('ratings:all:1:10');
      expect(prisma.rating.findMany).not.toHaveBeenCalled();
    });

    it('fetches from DB and caches result', async () => {
      cache.get.mockResolvedValue(null);
      prisma.rating.findMany.mockResolvedValue([{ id: 1 }] as { id: number }[]);
      prisma.rating.count.mockResolvedValue(1);

      const result = (await service.findAll({
        page: 1,
        limit: 10,
      })) as FindAllResult;

      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.meta.total).toBe(1);
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns cached rating', async () => {
      const cached = { id: 5 };
      cache.get.mockResolvedValue(cached);

      const result = await service.findOne(5);
      expect(result).toEqual(cached);
      expect(cache.get).toHaveBeenCalledWith('rating:5');
      expect(prisma.rating.findUnique).not.toHaveBeenCalled();
    });

    it('throws if rating not found', async () => {
      cache.get.mockResolvedValue(null);
      prisma.rating.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('fetches and caches if not cached', async () => {
      cache.get.mockResolvedValue(null);
      prisma.rating.findUnique.mockResolvedValue({ id: 10 });

      const result = await service.findOne(10);
      expect(result).toEqual({ id: 10 });
      expect(cache.set).toHaveBeenCalledWith('rating:10', { id: 10 }, 60);
    });
  });

  describe('create', () => {
    it('creates rating and clears cache', async () => {
      const dto: CreateRatingDto = { bookId: 1, value: 5 }
      const created = { id: 1, ...dto };
      prisma.rating.create.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result).toEqual(created);
      expect(prisma.rating.create).toHaveBeenCalledWith({ data: dto });
      expect(cache.clear).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates rating and clears caches', async () => {
      const dto: UpdateRatingDto = { value: 4 }
      const updated = { id: 2, ...dto };
      prisma.rating.update.mockResolvedValue(updated);

      const result = await service.update(2, dto);
      expect(result).toEqual(updated);
      expect(prisma.rating.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: dto,
      });
      expect(cache.del).toHaveBeenCalledWith('rating:2');
      expect(cache.clear).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes rating and clears caches', async () => {
      prisma.rating.delete.mockResolvedValue({ id: 3 });

      const result = await service.remove(3);
      expect(result).toEqual({ message: 'Rating 3 deleted' });
      expect(prisma.rating.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(cache.del).toHaveBeenCalledWith('rating:3');
      expect(cache.clear).toHaveBeenCalled();
    });
  });
});
