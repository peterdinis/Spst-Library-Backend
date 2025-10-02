import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Book } from 'apps/books/src/model/book.model';
import { Author } from 'apps/authors/src/models/author.model';
import { Category } from 'apps/categories/src/model/category.model';
import { Order } from 'apps/orders/src/model/orders.model';
import { OrderItem } from 'apps/orders/src/model/order-item.model';
import { PdfService } from '../pdf.service';

describe('PdfService', () => {
  let service: PdfService;

  const mockBookModel = {
    find: jest.fn(),
  };
  const mockAuthorModel = {
    find: jest.fn(),
  };
  const mockCategoryModel = {
    find: jest.fn(),
  };
  const mockOrderModel = {
    find: jest.fn(),
  };
  const mockOrderItemModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        { provide: getModelToken(Book.name), useValue: mockBookModel },
        { provide: getModelToken(Author.name), useValue: mockAuthorModel },
        { provide: getModelToken(Category.name), useValue: mockCategoryModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(OrderItem.name), useValue: mockOrderItemModel },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate Books PDF', async () => {
    const books = [
      { _id: new Types.ObjectId(), name: 'Book 1', year: 2020, isAvailable: true },
    ];

    const mockExec = jest.fn().mockResolvedValue(books);
    const mockPopulate = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: mockExec }) });
    mockBookModel.find.mockReturnValue({ populate: mockPopulate });

    const result = await service.generateBooksPdf();

    expect(mockBookModel.find).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate Authors PDF', async () => {
    const authors = [
      { _id: new Types.ObjectId(), name: 'Author 1', bio: 'Bio 1' },
    ];

    const mockExec = jest.fn().mockResolvedValue(authors);
    mockAuthorModel.find.mockReturnValue({ exec: mockExec });

    const result = await service.generateAuthorsPdf();

    expect(mockAuthorModel.find).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate Categories PDF', async () => {
    const categories = [
      { _id: new Types.ObjectId(), name: 'Category 1', description: 'Description' },
    ];

    const mockExec = jest.fn().mockResolvedValue(categories);
    mockCategoryModel.find.mockReturnValue({ exec: mockExec });

    const result = await service.generateCategoriesPdf();

    expect(mockCategoryModel.find).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate Orders PDF', async () => {
    const orders = [
      {
        _id: new Types.ObjectId(),
        status: 'pending',
        items: [
          { bookId: { name: 'Book X' }, quantity: 2 },
        ],
      },
    ];

    const mockExec = jest.fn().mockResolvedValue(orders);
    const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
    mockOrderModel.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: mockPopulate }) });

    const result = await service.generateOrdersPdf();

    expect(mockOrderModel.find).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
