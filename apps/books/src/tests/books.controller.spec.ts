import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, FilterBooksDto } from '@app/dtos';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    filter: jest.fn(),
    findAvailable: jest.fn(),
    findUnavailable: jest.fn(),
    findTopRated: jest.fn(),
    findRecentlyAdded: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: mockBooksService },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const dto: CreateBookDto = { title: 'Book 1', author: 'Author 1', publishedYear: 2023, genre: 'Fiction' };
      mockBooksService.create.mockReturnValue(dto);

      const result = await controller.create(dto);
      expect(result).toEqual(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const books = [{ title: 'Book 1', author: 'Author 1', publishedYear: 2023, genre: 'Fiction' }];
      mockBooksService.findAll.mockReturnValue(books);

      const result = await controller.findAll('Book', 1, 10);
      expect(result).toEqual(books);
      expect(service.findAll).toHaveBeenCalledWith({ search: 'Book', page: 1, limit: 10 });
    });
  });

  describe('filter', () => {
    it('should return filtered books', async () => {
      const query: FilterBooksDto = { author: 'Author 1' };
      const books = [{ title: 'Book 1', author: 'Author 1', publishedYear: 2023, genre: 'Fiction' }];
      mockBooksService.filter.mockReturnValue(books);

      const result = await controller.filter(query);
      expect(result).toEqual(books);
      expect(service.filter).toHaveBeenCalledWith(query);
    });
  });

  describe('findAvailable', () => {
    it('should return available books', async () => {
      const books = [{ title: 'Book 1', author: 'Author 1', publishedYear: 2023, genre: 'Fiction', available: true }];
      mockBooksService.findAvailable.mockReturnValue(books);

      const result = await controller.findAvailable();
      expect(result).toEqual(books);
      expect(service.findAvailable).toHaveBeenCalled();
    });
  });

  describe('findUnavailable', () => {
    it('should return unavailable books', async () => {
      const books = [{ title: 'Book 2', author: 'Author 2', publishedYear: 2022, genre: 'Non-fiction', available: false }];
      mockBooksService.findUnavailable.mockReturnValue(books);

      const result = await controller.findUnavailable();
      expect(result).toEqual(books);
      expect(service.findUnavailable).toHaveBeenCalled();
    });
  });

  describe('findTopRated', () => {
    it('should return top rated books', async () => {
      const books = [{ title: 'Book 3', author: 'Author 3', publishedYear: 2021, genre: 'Fiction', rating: 5 }];
      mockBooksService.findTopRated.mockReturnValue(books);

      const result = await controller.findTopRated(5);
      expect(result).toEqual(books);
      expect(service.findTopRated).toHaveBeenCalledWith(5);
    });
  });

  describe('findRecentlyAdded', () => {
    it('should return recently added books', async () => {
      const books = [{ title: 'Book 4', author: 'Author 4', publishedYear: 2023, genre: 'Fiction', addedAt: new Date() }];
      mockBooksService.findRecentlyAdded.mockReturnValue(books);

      const result = await controller.findRecentlyAdded(7);
      expect(result).toEqual(books);
      expect(service.findRecentlyAdded).toHaveBeenCalledWith(7);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const book = { title: 'Book 1', author: 'Author 1', publishedYear: 2023, genre: 'Fiction' };
      mockBooksService.findOne.mockReturnValue(book);

      const result = await controller.findOne('1');
      expect(result).toEqual(book);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a book by id', async () => {
      const dto: UpdateBookDto = { title: 'Updated Book' };
      const book = { title: 'Updated Book', author: 'Author 1', publishedYear: 2023, genre: 'Fiction' };
      mockBooksService.update.mockReturnValue(book);

      const result = await controller.update('1', dto);
      expect(result).toEqual(book);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a book by id', async () => {
      mockBooksService.remove.mockReturnValue({ deleted: true });

      const result = await controller.remove('1');
      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
