import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../books.controller';
import { BooksService } from '../books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { FilterBooksDto } from '../dto/filter-books.dto';
import { QueryBooksDto } from '../dto/query-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBook = { id: 1, name: 'Test Book' };
  const mockBooksList = [mockBook];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockBook),
            findAll: jest.fn().mockResolvedValue({ data: mockBooksList }),
            findOne: jest.fn().mockResolvedValue(mockBook),
            update: jest.fn().mockResolvedValue({ ...mockBook, name: 'Updated' }),
            remove: jest.fn().mockResolvedValue(mockBook),
            filter: jest.fn().mockResolvedValue({ data: mockBooksList, total: 1 }),
            findAvailable: jest.fn().mockResolvedValue({ data: mockBooksList, total: 1 }),
            findUnavailable: jest.fn().mockResolvedValue({ data: mockBooksList, total: 1 }),
            findTopRated: jest.fn().mockResolvedValue(mockBooksList),
            findRecentlyAdded: jest.fn().mockResolvedValue(mockBooksList),
          },
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return a book', async () => {
      const dto: CreateBookDto = { name: 'Test Book', authorId: 1 };
      await expect(controller.create(dto)).resolves.toEqual(mockBook);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return books', async () => {
      const query: QueryBooksDto = { page: 1, limit: 10 };
      await expect(controller.findAll(query)).resolves.toEqual({ data: mockBooksList });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return a book', async () => {
      await expect(controller.findOne(1)).resolves.toEqual(mockBook);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call service.update and return updated book', async () => {
      const dto: UpdateBookDto = { name: 'Updated' };
      await expect(controller.update(1, dto)).resolves.toEqual({ ...mockBook, name: 'Updated' });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return deleted book', async () => {
      await expect(controller.remove(1)).resolves.toEqual(mockBook);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('filter', () => {
    it('should call service.filter and return filtered books', async () => {
      const query: FilterBooksDto = { authorId: 1 };
      await expect(controller.filter(query)).resolves.toEqual({ data: mockBooksList, total: 1 });
      expect(service.filter).toHaveBeenCalledWith(query);
    });
  });

  describe('findAvailable', () => {
    it('should call service.findAvailable and return available books', async () => {
      await expect(controller.findAvailable()).resolves.toEqual({ data: mockBooksList, total: 1 });
      expect(service.findAvailable).toHaveBeenCalled();
    });
  });

  describe('findUnavailable', () => {
    it('should call service.findUnavailable and return unavailable books', async () => {
      await expect(controller.findUnavailable()).resolves.toEqual({ data: mockBooksList, total: 1 });
      expect(service.findUnavailable).toHaveBeenCalled();
    });
  });

  describe('findTopRated', () => {
    it('should call service.findTopRated with limit', async () => {
      await expect(controller.findTopRated(5)).resolves.toEqual(mockBooksList);
      expect(service.findTopRated).toHaveBeenCalledWith(5);
    });

    it('should call service.findTopRated without limit', async () => {
      await expect(controller.findTopRated()).resolves.toEqual(mockBooksList);
      expect(service.findTopRated).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findRecentlyAdded', () => {
    it('should call service.findRecentlyAdded with days', async () => {
      await expect(controller.findRecentlyAdded(7)).resolves.toEqual(mockBooksList);
      expect(service.findRecentlyAdded).toHaveBeenCalledWith(7);
    });

    it('should call service.findRecentlyAdded without days', async () => {
      await expect(controller.findRecentlyAdded()).resolves.toEqual(mockBooksList);
      expect(service.findRecentlyAdded).toHaveBeenCalledWith(undefined);
    });
  });
});
