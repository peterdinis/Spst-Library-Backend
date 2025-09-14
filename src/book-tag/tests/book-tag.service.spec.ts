import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookTagService } from '../book-tag.service';

describe('BookTagService', () => {
  let service: BookTagService;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const mockTag = { id: 1, name: 'Fiction' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookTagService,
        {
          provide: PrismaService,
          useValue: {
            bookTag: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get<BookTagService>(BookTagService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('create', () => {
    it('should create a new tag and clear cache', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.bookTag.create as jest.Mock).mockResolvedValue(mockTag);

      const result = await service.create('Fiction');
      expect(result).toEqual(mockTag);
      expect(cacheManager.del).toHaveBeenCalledWith('bookTags');
    });

    it('should throw if tag already exists', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      await expect(service.create('Fiction')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return cached tags if present', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue([mockTag]);
      const result = await service.findAll();
      expect(result).toEqual([mockTag]);
      expect(prisma.bookTag.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if no cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.bookTag.findMany as jest.Mock).mockResolvedValue([mockTag]);

      const result = await service.findAll();
      expect(result).toEqual([mockTag]);
      expect(cacheManager.set).toHaveBeenCalledWith('bookTags', [mockTag]);
    });
  });

  describe('findOne', () => {
    it('should return tag if found', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      const result = await service.findOne(1);
      expect(result).toEqual(mockTag);
    });

    it('should throw if tag not found', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tag and clear cache', async () => {
      (prisma.bookTag.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce(null);
      (prisma.bookTag.update as jest.Mock).mockResolvedValue({
        ...mockTag,
        name: 'Sci-Fi',
      });

      const result = await service.update(1, 'Sci-Fi');
      expect(result).toEqual({ ...mockTag, name: 'Sci-Fi' });
      expect(cacheManager.del).toHaveBeenCalledWith('bookTags');
    });

    it('should throw if tag not found', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.update(1, 'Sci-Fi')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if duplicate tag name exists', async () => {
      (prisma.bookTag.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce({ id: 2, name: 'Sci-Fi' });
      await expect(service.update(1, 'Sci-Fi')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete tag and clear cache', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (prisma.bookTag.delete as jest.Mock).mockResolvedValue(mockTag);

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Tag 1 deleted' });
      expect(cacheManager.del).toHaveBeenCalledWith('bookTags');
    });

    it('should throw if tag not found', async () => {
      (prisma.bookTag.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should throw if query is empty', async () => {
      await expect(service.search('')).rejects.toThrow(BadRequestException);
    });

    it('should return cached results if present', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue([mockTag]);
      const result = await service.search('Fic');
      expect(result).toEqual([mockTag]);
    });

    it('should search DB and cache results if not cached', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prisma.bookTag.findMany as jest.Mock).mockResolvedValue([mockTag]);

      const result = await service.search('Fic');
      expect(result).toEqual([mockTag]);
      expect(cacheManager.set).toHaveBeenCalledWith('bookTags_search_Fic', [
        mockTag,
      ]);
    });
  });
});
