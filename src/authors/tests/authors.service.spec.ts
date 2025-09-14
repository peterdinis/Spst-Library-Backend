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

// Mock constants
jest.mock('src/shared/constants/applicationConstants', () => ({
  DEFAULT_CACHE_TTL: 300000
}));

// Type definitions for tests
interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Author {
  id: number;
  name: string;
  bornDate: Date;
  books: any[];
  createdAt: Date;
  updatedAt?: Date;
}

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const mockAuthor: Author = {
    id: 1,
    name: 'John Doe',
    bornDate: new Date('1980-01-01'),
    books: [],
    createdAt: new Date(),
  };

  const mockPrismaService = {
    author: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
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

    service = module.get<AuthorsService>(AuthorsService);
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
  it('should create a new author and clear cache', async () => {
    mockPrismaService.author.findFirst.mockResolvedValue(null);
    mockPrismaService.author.create.mockResolvedValue(mockAuthor);
    mockCacheManager.clear.mockResolvedValue(undefined);

    const result = await service.create({
      name: 'John Doe',
      bornDate: new Date('1980-01-01').toISOString(),
      litPeriod: 'Modern Era'
    });

    expect(result).toEqual(mockAuthor);
    expect(cacheManager.clear).toHaveBeenCalled();
  });

  it('should throw ConflictException if author exists', async () => {
    mockPrismaService.author.findFirst.mockResolvedValue(mockAuthor);

    await expect(
      service.create({
        name: 'John Doe',
        bornDate: new Date('1980-01-01').toISOString(),
        litPeriod: 'Modern Era'
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should handle validation errors', async () => {
    mockPrismaService.author.findFirst.mockResolvedValue(null);

    // Test empty name
    await expect(
      service.create({
        name: '',
        bornDate: new Date('1980-01-01').toISOString(),
        litPeriod: 'Modern Era'
      }),
    ).rejects.toThrow(BadRequestException);

    // Test future birth date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await expect(
      service.create({
        name: 'John Doe',
        bornDate: futureDate.toISOString(),
        litPeriod: 'Modern Era'
      }),
    ).rejects.toThrow(BadRequestException);
  });
});


  describe('findAll', () => {
    const paginationDto = { page: 1, limit: 10 };

    it('should return authors with pagination and cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findMany.mockResolvedValue([mockAuthor]);
      mockPrismaService.author.count.mockResolvedValue(1);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll(paginationDto) as PaginatedResult<Author>;

      expect(result.data).toEqual([mockAuthor]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return cached data if exists', async () => {
      const cachedResult: PaginatedResult<Author> = {
        data: [mockAuthor],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll(paginationDto) as PaginatedResult<Author>;

      expect(result.data).toEqual([mockAuthor]);
      expect(prisma.author.findMany).not.toHaveBeenCalled();
    });

    it('should handle search functionality', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findMany.mockResolvedValue([mockAuthor]);
      mockPrismaService.author.count.mockResolvedValue(1);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll({ 
        page: 1, 
        limit: 10, 
        search: 'John' 
      }) as PaginatedResult<Author>;

      expect(result.data).toEqual([mockAuthor]);
      expect(prisma.author.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({
              contains: 'John',
              mode: 'insensitive'
            })
          })
        })
      );
    });

    it('should throw BadRequestException for invalid page/limit', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll({ page: -1, limit: 10 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll({ page: 1, limit: 101 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if no authors found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findMany.mockResolvedValue([]);
      mockPrismaService.author.count.mockResolvedValue(0);

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached author if exists', async () => {
      mockCacheManager.get.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockAuthor);
      expect(prisma.author.findUnique).not.toHaveBeenCalled();
    });

    it('should return author from db and cache it', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockAuthor);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `author:1`,
        mockAuthor,
        expect.any(Number)
      );
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(-1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if author does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update author and clear cache', async () => {
      const updatedAuthor = { ...mockAuthor, name: 'Updated Name' };
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.author.findFirst.mockResolvedValue(null);
      mockPrismaService.author.update.mockResolvedValue(updatedAuthor);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.update(1, { name: 'Updated Name' });

      expect(result).toEqual(updatedAuthor);
      expect(cacheManager.clear).toHaveBeenCalled();
      expect(prisma.author.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name' },
      });
    });

    it('should throw NotFoundException if author does not exist', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if duplicate author exists', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.author.findFirst.mockResolvedValue({
        ...mockAuthor,
        id: 2,
      });

      await expect(service.update(1, { name: 'John Doe' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle validation errors during update', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);

      // Test empty name
      await expect(service.update(1, { name: '' })).rejects.toThrow(
        BadRequestException,
      );

      // Test name too long
      const longName = 'a'.repeat(101);
      await expect(service.update(1, { name: longName })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow partial updates', async () => {
      const updatedAuthor = { ...mockAuthor, name: 'Partial Update' };
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.author.findFirst.mockResolvedValue(null);
      mockPrismaService.author.update.mockResolvedValue(updatedAuthor);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.update(1, { name: 'Partial Update' });

      expect(result).toEqual(updatedAuthor);
      expect(prisma.author.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Partial Update' },
      });
    });
  });

  describe('remove', () => {
    it('should delete author and clear cache', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.author.delete.mockResolvedValue(mockAuthor);
      mockCacheManager.clear.mockResolvedValue(undefined);

      const result = await service.remove(1);
      
      expect(result).toEqual({ message: `Author 1 deleted successfully.` });
      expect(cacheManager.clear).toHaveBeenCalled();
      expect(prisma.author.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if author does not exist', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove(0)).rejects.toThrow(BadRequestException);
      await expect(service.remove(-1)).rejects.toThrow(BadRequestException);
    });

    it('should handle foreign key constraint errors', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);
      mockPrismaService.author.delete.mockRejectedValue(
        new Error('Foreign key constraint failed')
      );

      await expect(service.remove(1)).rejects.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle cache errors gracefully in findAll', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));
      mockPrismaService.author.findMany.mockResolvedValue([mockAuthor]);
      mockPrismaService.author.count.mockResolvedValue(1);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 10 }) as PaginatedResult<Author>;

      expect(result.data).toEqual([mockAuthor]);
    });

    it('should handle cache errors gracefully in findOne', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));
      mockPrismaService.author.findUnique.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAuthor);
    });

    it('should handle database connection errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow();
    });
  });

  describe('private method validation', () => {
    it('should validate author existence correctly', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Author with ID 999 not found'
      );
    });

    it('should handle invalid pagination parameters', async () => {
      const invalidParams = [
        { page: 0, limit: 10 },
        { page: -1, limit: 10 },
        { page: 1, limit: 0 },
        { page: 1, limit: -1 },
        { page: 1, limit: 101 },
      ];

      for (const params of invalidParams) {
        await expect(service.findAll(params)).rejects.toThrow(BadRequestException);
      }
    });
  });
});