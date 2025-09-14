import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BooksService } from '../books.service';

// Mock constants
jest.mock('src/shared/constants/applicationConstants', () => ({
  DEFAULT_CACHE_TTL: 300000
}));

// Type definitions for tests
interface PaginatedResult<T> {
  data: T[];
  meta?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  total?: number; // For filter method
}

interface Book {
  id: number;
  name: string;
  authorId: number;
  categoryId?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface Author {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

describe('BooksService', () => {
  let service: BooksService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const mockBook: Book = {
    id: 1,
    name: 'Test Book',
    authorId: 1,
    categoryId: 1,
    isAvailable: true,
    createdAt: new Date(),
  };

  const mockAuthor: Author = { id: 1, name: 'Author' };
  const mockCategory: Category = { id: 1, name: 'Category' };

  const mockPrismaService = {
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
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book and clear cache', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.book.findFirst.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue(mockBook);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.create({ name: 'Test Book', authorId: 1, categoryId: 1 });
      
      expect(result).toEqual(mockBook);
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw if book already exists', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.book.findFirst.mockResolvedValue(mockBook);

      await expect(service.create({ name: 'Test Book', authorId: 1 })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw if author not found', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(null);
      
      await expect(service.create({ name: 'Book', authorId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return cached books if cache exists', async () => {
      const cachedResult: PaginatedResult<Book> = {
        data: [mockBook],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
      };
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll({ page: 1, limit: 10 }) as PaginatedResult<Book>;
      
      expect(result).toEqual(cachedResult);
    });

    it('should fetch from DB if no cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([[mockBook], 1]);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 10 }) as PaginatedResult<Book>;
      
      expect(result.data).toEqual([mockBook]);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no books found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);
      
      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached book if exists', async () => {
      mockCacheManager.get.mockResolvedValue(mockBook);
      
      const result = await service.findOne(1);
      
      expect(result).toEqual(mockBook);
    });

    it('should fetch from DB if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockBook);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw if book not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book and clear cache', async () => {
      const updatedBook = { ...mockBook, name: 'Updated' };
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.book.update.mockResolvedValue(updatedBook);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.update(1, { name: 'Updated' });
      
      expect(result.name).toBe('Updated');
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a book and clear cache', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.book.delete.mockResolvedValue(mockBook);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.remove(1);
      
      expect(result).toEqual(mockBook);
      expect(cacheManager.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if book not found', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('filter', () => {
    it('should return filtered books', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);

      const result = await service.filter({ authorId: 1 }) as PaginatedResult<Book>;
      
      expect(result.data).toEqual([mockBook]);
      expect(result.total).toBe(1);
    });

    it('should throw if no books match', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);
      
      await expect(service.filter({ authorId: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailable / findUnavailable', () => {
    it('should return available books', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAvailable() as PaginatedResult<Book>;
      
      expect(result.data).toEqual([mockBook]);
    });

    it('should return unavailable books', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findUnavailable() as PaginatedResult<Book>;
      
      expect(result.data).toEqual([mockBook]);
    });

    it('should return cached available books if exists', async () => {
      const cachedResult: PaginatedResult<Book> = {
        data: [mockBook],
        total: 1
      };
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAvailable() as PaginatedResult<Book>;
      
      expect(result).toEqual(cachedResult);
    });
  });

  describe('findTopRated / findRecentlyAdded', () => {
    it('should return top rated books', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);

      const result = await service.findTopRated(5);
      
      expect(result).toEqual([mockBook]);
    });

    it('should return recently added books', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([mockBook]);

      const result = await service.findRecentlyAdded(7);
      
      expect(result).toEqual([mockBook]);
    });

    it('should handle empty results for top rated', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);

      const result = await service.findTopRated(5);
      
      expect(result).toEqual([]);
    });

    it('should handle empty results for recently added', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);

      const result = await service.findRecentlyAdded(7);
      
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in create', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.book.findFirst.mockResolvedValue(null);
      mockPrismaService.book.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create({ name: 'Test Book', authorId: 1 })).rejects.toThrow();
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));
      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockBook);
    });
  });
});