import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { CreateBookDto, UpdateBookDto, FilterBooksDto, QueryBooksDto } from '@app/dtos';
import { BooksService } from '../books.service';
import { Book, BookDocument } from '../model/book.model';

// Mock query interface
interface MockQuery<T> {
  populate: jest.Mock<MockQuery<T>, [string]>;
  sort: jest.Mock<MockQuery<T>, [Record<string, 1 | -1>]>;
  skip: jest.Mock<MockQuery<T>, [number]>;
  limit: jest.Mock<MockQuery<T>, [number]>;
  exec: jest.Mock<Promise<T>, []>;
}

// Mock collection interface
interface MockCollection {
  findOne: jest.Mock<Promise<Record<string, unknown> | null>, [Record<string, unknown>]>;
}

// Mock database interface
interface MockDatabase {
  collection: jest.Mock<MockCollection, [string]>;
}

// Mock book model interface
interface MockBookModel extends Partial<Model<BookDocument>> {
  db: MockDatabase;
  create: jest.Mock<Promise<BookDocument>, [Partial<BookDocument>]>;
  findOne: jest.Mock<Promise<BookDocument | null>, [Record<string, unknown>]>;
  findById: jest.Mock<MockQuery<BookDocument | null> | Promise<BookDocument | null>, [string]>;
  find: jest.Mock<MockQuery<BookDocument[]>, [Record<string, unknown>?]>;
  findByIdAndUpdate: jest.Mock<Promise<BookDocument | null>, [string, Partial<BookDocument>, Record<string, unknown>]>;
  findByIdAndDelete: jest.Mock<Promise<BookDocument | null>, [string]>;
  countDocuments: jest.Mock<Promise<number>, [Record<string, unknown>]>;
}

describe('BooksService', () => {
  let service: BooksService;
  let mockBookModel: MockBookModel;
  let mockDb: MockDatabase;
  let mockAuthorsCollection: MockCollection;
  let mockCategoriesCollection: MockCollection;

  const mockObjectId = new Types.ObjectId();
  const mockAuthorId = new Types.ObjectId();
  const mockCategoryId = new Types.ObjectId();

  const mockBook: BookDocument = {
    _id: mockObjectId,
    name: 'Test Book',
    description: 'Test Description',
    authorId: mockAuthorId,
    categoryId: mockCategoryId,
    isAvailable: true,
    isNew: false,
    year: 2023,
    createdAt: new Date(),
  } as BookDocument;

  const mockAuthor = {
    _id: mockAuthorId,
    name: 'Test Author',
  };

  const mockCategory = {
    _id: mockCategoryId,
    name: 'Test Category',
  };

  beforeEach(async () => {
    // Mock collections
    mockAuthorsCollection = {
      findOne: jest.fn(),
    };

    mockCategoriesCollection = {
      findOne: jest.fn(),
    };

    // Mock database
    mockDb = {
      collection: jest.fn().mockImplementation((name: string): MockCollection => {
        if (name === 'authors') return mockAuthorsCollection;
        if (name === 'categories') return mockCategoriesCollection;
        throw new Error(`Unknown collection: ${name}`);
      }),
    };

    // Mock Mongoose model
    mockBookModel = {
      db: mockDb,
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    // Mock query builder methods
    const createMockQuery = <T>(): MockQuery<T> => ({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    });

    mockBookModel.find.mockReturnValue(createMockQuery<BookDocument[]>());
    mockBookModel.findById.mockReturnValue(createMockQuery<BookDocument | null>());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAuthorExists', () => {
    it('should throw BadRequestException for invalid author ID', async () => {
      await expect(service['validateAuthorExists']('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for empty author ID', async () => {
      await expect(service['validateAuthorExists']('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when author does not exist', async () => {
      mockAuthorsCollection.findOne.mockResolvedValue(null);

      await expect(
        service['validateAuthorExists'](mockAuthorId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not throw when author exists', async () => {
      mockAuthorsCollection.findOne.mockResolvedValue(mockAuthor);

      await expect(
        service['validateAuthorExists'](mockAuthorId.toString()),
      ).resolves.not.toThrow();
    });
  });

  describe('validateCategoryExists', () => {
    it('should throw BadRequestException for invalid category ID', async () => {
      await expect(service['validateCategoryExists']('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoriesCollection.findOne.mockResolvedValue(null);

      await expect(
        service['validateCategoryExists'](mockCategoryId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not throw when category exists', async () => {
      mockCategoriesCollection.findOne.mockResolvedValue(mockCategory);

      await expect(
        service['validateCategoryExists'](mockCategoryId.toString()),
      ).resolves.not.toThrow();
    });
  });

  describe('validateBookExists', () => {
    it('should throw BadRequestException for invalid book ID', async () => {
      await expect(service['validateBookExists']('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when book does not exist', async () => {
      const mockQuery: MockQuery<BookDocument | null> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockBookModel.findById = jest.fn().mockReturnValue(mockQuery);

      await expect(
        service['validateBookExists'](mockObjectId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return book when it exists', async () => {
      mockBookModel.findById = jest.fn().mockResolvedValue(mockBook);

      const result = await service['validateBookExists'](mockObjectId.toString());
      expect(result).toEqual(mockBook);
    });
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      name: 'New Book',
      description: 'New Description',
      authorId: mockAuthorId.toString(),
      categoryId: mockCategoryId.toString(),
      isAvailable: true,
      isNew: true,
      year: 2023,
    };

    it('should create a book successfully', async () => {
      mockAuthorsCollection.findOne.mockResolvedValue(mockAuthor);
      mockCategoriesCollection.findOne.mockResolvedValue(mockCategory);
      mockBookModel.findOne.mockResolvedValue(null);
      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockBookModel.create).toHaveBeenCalledWith({
        ...createBookDto,
        authorId: new Types.ObjectId(createBookDto.authorId),
        categoryId: new Types.ObjectId(createBookDto.categoryId),
      });
      expect(result).toEqual(mockBook);
    });

    it('should create a book without categoryId', async () => {
      const dtoWithoutCategory: CreateBookDto = { ...createBookDto, categoryId: undefined };
      mockAuthorsCollection.findOne.mockResolvedValue(mockAuthor);
      mockBookModel.findOne.mockResolvedValue(null);
      mockBookModel.create.mockResolvedValue(mockBook);

      await service.create(dtoWithoutCategory);

      expect(mockBookModel.create).toHaveBeenCalledWith({
        ...dtoWithoutCategory,
        authorId: new Types.ObjectId(createBookDto.authorId),
        categoryId: undefined,
      });
    });

    it('should throw ConflictException when book already exists', async () => {
      mockAuthorsCollection.findOne.mockResolvedValue(mockAuthor);
      mockBookModel.findOne.mockResolvedValue(mockBook);

      await expect(service.create(createBookDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for invalid author', async () => {
      mockAuthorsCollection.findOne.mockResolvedValue(null);

      await expect(service.create(createBookDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto: QueryBooksDto = {
      search: 'test',
      page: 1,
      limit: 10,
    };

    it('should return paginated books', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);
      mockBookModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: [mockBook],
        total: 1,
        page: 1,
        lastPage: 1,
      });
    });

    it('should throw NotFoundException when no books found', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);
      mockBookModel.countDocuments.mockResolvedValue(0);

      await expect(service.findAll(queryDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid page', async () => {
      const invalidQuery: QueryBooksDto = { ...queryDto, page: 0 };

      await expect(service.findAll(invalidQuery)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      const invalidQuery: QueryBooksDto = { ...queryDto, limit: 0 };

      await expect(service.findAll(invalidQuery)).rejects.toThrow(BadRequestException);
    });

    it('should handle search without results', async () => {
      const searchQuery: QueryBooksDto = { ...queryDto, search: 'nonexistent' };
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);
      mockBookModel.countDocuments.mockResolvedValue(0);

      await expect(service.findAll(searchQuery)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a book by ID', async () => {
      const mockQuery: MockQuery<BookDocument | null> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBook),
      };

      mockBookModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne(mockObjectId.toString());

      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      const mockQuery: MockQuery<BookDocument | null> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockBookModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne(mockObjectId.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateBookDto: UpdateBookDto = {
      name: 'Updated Book',
      description: 'Updated Description',
    };

    it('should update a book successfully', async () => {
      const updatedBook: BookDocument = { ...mockBook, ...updateBookDto };
      mockBookModel.findById = jest.fn().mockResolvedValue(mockBook);
      mockBookModel.findByIdAndUpdate.mockResolvedValue(updatedBook);

      const result = await service.update(mockObjectId.toString(), updateBookDto);

      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockObjectId.toString(),
        {
          ...updateBookDto,
          authorId: undefined,
          categoryId: undefined,
        },
        { new: true },
      );
      expect(result).toEqual(updatedBook);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockBookModel.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.update(mockObjectId.toString(), updateBookDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a book successfully', async () => {
      mockBookModel.findById = jest.fn().mockResolvedValue(mockBook);
      mockBookModel.findByIdAndDelete.mockResolvedValue(mockBook);

      const result = await service.remove(mockObjectId.toString());

      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockObjectId.toString(),
      );
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockBookModel.findById = jest.fn().mockResolvedValue(null);

      await expect(service.remove(mockObjectId.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('filter', () => {
    const filterDto: FilterBooksDto = {
      authorId: mockAuthorId.toString(),
      categoryId: mockCategoryId.toString(),
      isAvailable: true,
      isNew: false,
      yearMin: 2020,
      yearMax: 2023,
    };

    it('should filter books successfully', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.filter(filterDto);

      expect(result).toEqual({
        data: [mockBook],
        total: 1,
      });
    });

    it('should throw NotFoundException when no books match filters', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      await expect(service.filter(filterDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailable', () => {
    it('should return available books', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.findAvailable();

      expect(mockBookModel.find).toHaveBeenCalledWith({ isAvailable: true });
      expect(result).toEqual({
        data: [mockBook],
        total: 1,
      });
    });

    it('should throw NotFoundException when no available books found', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      await expect(service.findAvailable()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUnavailable', () => {
    it('should return unavailable books', async () => {
      const unavailableBook: BookDocument = { ...mockBook, isAvailable: false };
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([unavailableBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.findUnavailable();

      expect(mockBookModel.find).toHaveBeenCalledWith({ isAvailable: false });
      expect(result).toEqual({
        data: [unavailableBook],
        total: 1,
      });
    });

    it('should throw NotFoundException when no unavailable books found', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      await expect(service.findUnavailable()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTopRated', () => {
    it('should return top rated books with default limit', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.findTopRated();

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockBook]);
    });

    it('should return top rated books with custom limit', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      await service.findTopRated(5);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(service.findTopRated(0)).rejects.toThrow(BadRequestException);
      await expect(service.findTopRated(51)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findRecentlyAdded', () => {
    it('should return recently added books with default days', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.findRecentlyAdded();

      expect(result).toEqual([mockBook]);
    });

    it('should return recently added books with custom days', async () => {
      const mockQuery: MockQuery<BookDocument[]> = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.findRecentlyAdded(30);

      expect(result).toEqual([mockBook]);
    });

    it('should throw BadRequestException for invalid days', async () => {
      await expect(service.findRecentlyAdded(0)).rejects.toThrow(BadRequestException);
      await expect(service.findRecentlyAdded(366)).rejects.toThrow(BadRequestException);
    });
  });
});