import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from '../authors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { UpdateAuthorDto } from '../dto/update-author.dto';
import { QueryAuthorDto } from '../dto/query-author.dto';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prisma: any;
  let cache: { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

  const mockAuthor = {
    id: 1,
    name: 'John Doe',
    bornDate: '1990-01-01',
    litPeriod: '20th Century',
    bio: null,
    deathDate: null,
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
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

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  describe('create', () => {
    it('should create a new author', async () => {
      prisma.author.findFirst.mockResolvedValue(null);
      prisma.author.create.mockResolvedValue(mockAuthor);

      const dto: CreateAuthorDto = {
        name: 'John Doe',
        bornDate: '1990-01-01',
        litPeriod: '20th Century',
        bio: 'null',
        deathDate: '1990-01-02',
      };
      const result = await service.create(dto);

      expect(prisma.author.findFirst).toHaveBeenCalledWith({
        where: { name: dto.name, bornDate: dto.bornDate },
      });
      expect(prisma.author.create).toHaveBeenCalledWith({ data: dto });
      expect(cache.clear).toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });

    it('should throw ConflictException if author exists', async () => {
      prisma.author.findFirst.mockResolvedValue(mockAuthor);

      const dto: CreateAuthorDto = {
        name: 'John Doe',
        bornDate: '1990-01-01',
        litPeriod: '20th Century',
        bio: 'null',
        deathDate: '1990-01-02',
      };
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const query: QueryAuthorDto = { page: 1, limit: 10, search: 'John' };

    it('should return cached data if available', async () => {
      cache.get.mockResolvedValue('cached-authors');
      const result = await service.findAll(query);
      expect(result).toBe('cached-authors');
    });

    it('should throw NotFoundException if no authors found', async () => {
      cache.get.mockResolvedValue(null);
      prisma.author.findMany.mockResolvedValue([]);
      prisma.author.count.mockResolvedValue(0);

      await expect(service.findAll(query)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid page/limit', async () => {
      await expect(service.findAll({ page: 0, limit: 10 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached author if exists', async () => {
      cache.get.mockResolvedValue(mockAuthor);
      const result = await service.findOne(1);
      expect(result).toEqual(mockAuthor);
    });

    it('should fetch author if not cached', async () => {
      cache.get.mockResolvedValue(null);
      prisma.author.findUnique.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);

      expect(prisma.author.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { books: true },
      });
      expect(cache.set).toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });

    it('should throw NotFoundException if author does not exist', async () => {
      cache.get.mockResolvedValue(null);
      prisma.author.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const dto: UpdateAuthorDto = { name: 'Jane Doe' };

    it('should update an author', async () => {
      prisma.author.findUnique.mockResolvedValue(mockAuthor);
      prisma.author.findFirst.mockResolvedValue(null);
      prisma.author.update.mockResolvedValue({ ...mockAuthor, ...dto });

      const result = await service.update(1, dto);

      expect(result).toEqual({ ...mockAuthor, ...dto });
      expect(cache.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      prisma.author.findUnique.mockResolvedValue(null);
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if duplicate exists', async () => {
      prisma.author.findUnique.mockResolvedValue(mockAuthor);
      prisma.author.findFirst.mockResolvedValue({ id: 2 });
      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.update(0, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      prisma.author.findUnique.mockResolvedValue(mockAuthor);
      prisma.author.delete.mockResolvedValue(mockAuthor);

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Author 1 deleted successfully.' });
      expect(cache.clear).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      prisma.author.findUnique.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.remove(0)).rejects.toThrow(BadRequestException);
    });
  });
});
