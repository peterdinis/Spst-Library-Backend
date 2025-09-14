import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AuthorsService } from '../authors.service';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const mockAuthor = {
    id: 1,
    name: 'John Doe',
    bornDate: new Date('1980-01-01'),
    books: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: PrismaService,
          useValue: {
            author: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
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
            clear: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('create', () => {
    it('should create a new author and clear cache', async () => {
      (prisma.author.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.author.create as jest.Mock).mockResolvedValue(mockAuthor);

      const result = await service.create({
        name: 'John Doe',
        bornDate: new Date('1980-01-01'),
      });

      expect(result).toEqual(mockAuthor);
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw ConflictException if author exists', async () => {
      (prisma.author.findFirst as jest.Mock).mockResolvedValue(mockAuthor);

      await expect(
        service.create({ name: 'John Doe', bornDate: new Date('1980-01-01') }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return authors with pagination and cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.author.findMany as jest.Mock).mockResolvedValue([mockAuthor]);
      (prisma.author.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockAuthor]);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return cached data if exists', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue({
        data: [mockAuthor],
        meta: {},
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockAuthor]);
      expect(prisma.author.findMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid page/limit', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if no authors found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.author.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.author.count as jest.Mock).mockResolvedValue(0);

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached author if exists', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);
      expect(result).toEqual(mockAuthor);
    });

    it('should return author from db and cache it', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);
      expect(result).toEqual(mockAuthor);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if author does not exist', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update author and clear cache', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.author.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.author.update as jest.Mock).mockResolvedValue(mockAuthor);

      const result = await service.update(1, { name: 'Updated' });

      expect(result).toEqual(mockAuthor);
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author does not exist', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if duplicate author exists', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.author.findFirst as jest.Mock).mockResolvedValue({
        ...mockAuthor,
        id: 2,
      });

      await expect(service.update(1, { name: 'John Doe' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete author and clear cache', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.author.delete as jest.Mock).mockResolvedValue(mockAuthor);

      const result = await service.remove(1);
      expect(result).toEqual({ message: `Author 1 deleted successfully.` });
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author does not exist', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove(0)).rejects.toThrow(BadRequestException);
    });
  });
});
