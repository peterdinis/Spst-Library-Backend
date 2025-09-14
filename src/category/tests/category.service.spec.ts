import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CategoryService } from '../category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;
  let cache: Cache;

  const mockCategory = { id: 1, name: 'Fiction', description: 'Fiction books', books: [] };
  const mockCategories = [mockCategory];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
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

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCached', () => {
    it('should return cached categories if present', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(mockCategories);
      await expect(service.findAllCached()).resolves.toEqual(mockCategories);
    });

    it('should fetch categories and cache if not cached', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);
      const setSpy = jest.spyOn(cache, 'set').mockResolvedValue(undefined);

      const result = await service.findAllCached();
      expect(result).toEqual(mockCategories);
      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should throw BadRequestException for invalid page/limit', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(BadRequestException);
      await expect(service.findAll({ page: 1, limit: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should return paginated categories', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(prisma.category, 'findMany').mockResolvedValue(mockCategories);
      jest.spyOn(prisma.category, 'count').mockResolvedValue(mockCategories.length);
      const setSpy = jest.spyOn(cache, 'set').mockResolvedValue(undefined);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual(mockCategories);
      expect(result.meta.total).toEqual(mockCategories.length);
      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached category if exists', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(mockCategory);
      await expect(service.findOne(1)).resolves.toEqual(mockCategory);
    });

    it('should fetch category and cache if not cached', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(service as any, 'validateCategoryExists').mockResolvedValue(mockCategory);
      const setSpy = jest.spyOn(cache, 'set').mockResolvedValue(undefined);

      await expect(service.findOne(1)).resolves.toEqual(mockCategory);
      expect(setSpy).toHaveBeenCalledWith(expect.any(String), mockCategory, expect.any(Number));
    });
  });

  describe('create', () => {
    it('should throw ConflictException if category exists', async () => {
      jest.spyOn(prisma.category, 'findFirst').mockResolvedValue(mockCategory);
      await expect(service.create({ name: 'Fiction' })).rejects.toThrow(ConflictException);
    });

    it('should create a new category', async () => {
      jest.spyOn(prisma.category, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.category, 'create').mockResolvedValue(mockCategory);
      const clearSpy = jest.spyOn(cache, 'clear').mockResolvedValue(undefined);

      await expect(service.create({ name: 'Fiction', description: 'Desc' })).resolves.toEqual(mockCategory);
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      jest.spyOn(service as any, 'validateCategoryExists').mockResolvedValue(mockCategory);
      jest.spyOn(prisma.category, 'update').mockResolvedValue({ ...mockCategory, name: 'Updated' });
      const delSpy = jest.spyOn(cache, 'del').mockResolvedValue(undefined);
      const clearSpy = jest.spyOn(cache, 'clear').mockResolvedValue(undefined);

      const result = await service.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(delSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete category', async () => {
      jest.spyOn(service as any, 'validateCategoryExists').mockResolvedValue(mockCategory);
      jest.spyOn(prisma.category, 'delete').mockResolvedValue(mockCategory);
      const delSpy = jest.spyOn(cache, 'del').mockResolvedValue(undefined);
      const clearSpy = jest.spyOn(cache, 'clear').mockResolvedValue(undefined);

      const result = await service.remove(1);
      expect(result).toEqual({ message: `Category 1 deleted successfully` });
      expect(delSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
