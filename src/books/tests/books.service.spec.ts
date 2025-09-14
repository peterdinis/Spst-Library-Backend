import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BooksService } from '../books.service';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const mockBook = {
    id: 1,
    name: 'Test Book',
    authorId: 1,
    categoryId: 1,
    isAvailable: true,
    createdAt: new Date(),
  };

  const mockAuthor = { id: 1, name: 'Author' };
  const mockCategory = { id: 1, name: 'Category' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            author: { findUnique: jest.fn() },
            category: { findUnique: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), clear: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('create', () => {
    it('should create a book and clear cache', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.book.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.book.create as jest.Mock).mockResolvedValue(mockBook);

      const result = await service.create({ name: 'Test Book', authorId: 1, categoryId: 1 });
      expect(result).toEqual(mockBook);
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw if book already exists', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.book.findFirst as jest.Mock).mockResolvedValue(mockBook);

      await expect(service.create({ name: 'Test Book', authorId: 1 })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw if author not found', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create({ name: 'Book', authorId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return cached books if cache exists', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual([mockBook]);
    });

    it('should fetch from DB if no cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[mockBook], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockBook]);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no books found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);
      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached book if exists', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockBook);
      const result = await service.findOne(1);
      expect(result).toEqual(mockBook);
    });

    it('should fetch from DB if not cached', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);

      const result = await service.findOne(1);
      expect(result).toEqual(mockBook);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw if book not found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book and clear cache', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthor);
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.book.update as jest.Mock).mockResolvedValue({ ...mockBook, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(cacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a book and clear cache', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.book.delete as jest.Mock).mockResolvedValue(mockBook);

      const result = await service.remove(1);
      expect(result).toEqual(mockBook);
      expect(cacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('should return filtered books', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.filter({ authorId: 1 });
      expect(result.data).toEqual([mockBook]);
      expect(result.total).toBe(1);
    });

    it('should throw if no books match', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue([]);
      await expect(service.filter({ authorId: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailable / findUnavailable', () => {
    it('should return available books', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.findAvailable();
      expect(result.data).toEqual([mockBook]);
    });

    it('should return unavailable books', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.findUnavailable();
      expect(result.data).toEqual([mockBook]);
    });
  });

  describe('findTopRated / findRecentlyAdded', () => {
    it('should return top rated books', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.findTopRated(5);
      expect(result).toEqual([mockBook]);
    });

    it('should return recently added books', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);
      const result = await service.findRecentlyAdded(7);
      expect(result).toEqual([mockBook]);
    });
  });
});
