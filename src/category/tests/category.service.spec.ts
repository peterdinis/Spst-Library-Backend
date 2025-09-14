import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CategoryService } from '../category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PaginationDto } from '../dto/category-pagination.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;
  let cache: Cache;

  const mockCategory = { 
    id: 1, 
    name: 'Fiction', 
    description: 'Fiction books', 
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCategoryWithBooks = {
    ...mockCategory,
    books: [{ id: 1, name: 'Test Book', categoryId: 1 }]
  };

  const mockCategories = [mockCategoryWithBooks];

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
        CategoryService,
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

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCached', () => {
    it('should return cached categories if present', async () => {
      mockCacheManager.get.mockResolvedValue(mockCategories);

      const result = await service.findAllCached();

      expect(result).toEqual(mockCategories);
      expect(cache.get).toHaveBeenCalledWith('categories:all:full');
    });

    it('should fetch categories and cache if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAllCached();

      expect(result).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: {
          books: { select: { id: true, name: true, categoryId: true } },
        },
      });
      expect(cache.set).toHaveBeenCalledWith('categories:all:full', mockCategories, expect.any(Number));
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };

    it('should throw BadRequestException for invalid page', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(BadRequestException);
      await expect(service.findAll({ page: -1, limit: 10 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow(BadRequestException);
      await expect(service.findAll({ page: 1, limit: 101 })).rejects.toThrow(BadRequestException);
    });

    it('should return cached paginated categories if present', async () => {
      const mockResult = {
        data: mockCategories,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
      };
      mockCacheManager.get.mockResolvedValue(mockResult);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual(mockResult);
      expect(cache.get).toHaveBeenCalledWith('categories:all:page=1:limit=10:search=');
    });

    it('should handle search functionality', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
      mockPrismaService.category.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10, search: 'Fiction' });

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Fiction', mode: 'insensitive' } },
            { description: { contains: 'Fiction', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        include: { books: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return cached category if exists', async () => {
      mockCacheManager.get.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(cache.get).toHaveBeenCalledWith('category:1');
    });

    it('should fetch category and cache if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(cache.set).toHaveBeenCalledWith('category:1', mockCategory, expect.any(Number));
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(-1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateCategoryDto = { name: 'Science Fiction', description: 'Sci-fi books' };

    it('should throw BadRequestException for invalid data', async () => {
      await expect(service.create({ name: '' })).rejects.toThrow(BadRequestException);
      await expect(service.create({ name: '   ' })).rejects.toThrow(BadRequestException);
      await expect(service.create({ name: 'a'.repeat(101) })).rejects.toThrow(BadRequestException);
      await expect(service.create({ name: 'Test', description: 'a'.repeat(501) })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if category exists', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.category.findFirst).toHaveBeenCalledWith({ where: { name: createDto.name } });
    });

    it('should create a new category successfully', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({ data: createDto });
      expect(cache.clear).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = { name: 'Updated Fiction' };

    it('should throw BadRequestException for invalid data', async () => {
      await expect(service.update(1, { name: '' })).rejects.toThrow(BadRequestException);
      await expect(service.update(1, { name: '   ' })).rejects.toThrow(BadRequestException);
      await expect(service.update(1, { name: 'a'.repeat(101) })).rejects.toThrow(BadRequestException);
      await expect(service.update(1, { description: 'a'.repeat(501) })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should update category successfully', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Fiction' };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(cache.del).toHaveBeenCalledWith('category:1');
      expect(cache.clear).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockRejectedValue(new Error('DB Error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Category 1 deleted successfully' });
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(cache.del).toHaveBeenCalledWith('category:1');
      expect(cache.clear).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('private methods validation', () => {
    it('should validate category existence correctly', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });
});