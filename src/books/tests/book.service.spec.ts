import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { Book, Author, Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BooksService } from '../books.service';

describe('BooksService', () => {
  let service: any; // TODO: Remove any
  let prisma: jest.Mocked<any>; // TODO: Remove any

  // Fake entities
  const mockAuthor: Author = {
    id: 1,
    name: faker.person.fullName(),
    litPeriod: faker.lorem.word(),
    dateBorn: faker.date.past(),
    dateDeath: faker.date.past(),
    nationality: faker.location.country(),
    bio: faker.lorem.paragraph(),
  };

  const mockCategory: Category = {
    id: 1,
    name: faker.commerce.department(),
  };

  const mockBook: Book = {
    id: 1,
    title: faker.lorem.words(3),
    quantity: faker.number.int({ min: 1, max: 5 }),
    authorId: mockAuthor.id,
    categoryId: mockCategory.id,
    publisherName: faker.company.name(),
    isbn: faker.string.uuid(),
    isAviable: true,
    dateCreated: faker.date.past(),
    isBorrowed: false,
    publishedYear: faker.number.int({ min: 1900, max: 2024 }),
    description: faker.lorem.sentences(2),
    coverImageUrl: faker.image.url(),
    language: 'English',
  };

  beforeEach(async () => {
    const prismaMock = {
      book: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      author: {
        findUnique: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(BooksService);
    prisma = module.get(PrismaService);
  });

  it('should return all books', async () => {
    prisma.book.findMany.mockResolvedValueOnce([mockBook]);
    prisma.book.count.mockResolvedValueOnce(1);

    const result = await service.findAll({ page: 1, pageSize: 10 });

    expect(prisma.book.findMany).toHaveBeenCalled();
    expect(result.data).toEqual([mockBook]);
    expect(result.total).toBe(1);
  });

  it('should return a single book by id', async () => {
    prisma.book.findUnique.mockResolvedValueOnce(mockBook);

    const result = await service.findOne(1);

    expect(prisma.book.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(mockBook);
  });

  it('should create a new book', async () => {
    prisma.author.findUnique.mockResolvedValueOnce(mockAuthor);
    prisma.category.findUnique.mockResolvedValueOnce(mockCategory);
    prisma.book.create.mockResolvedValueOnce(mockBook);

    const dto = {
      title: mockBook.title,
      authorId: mockBook.authorId,
      categoryId: mockBook.categoryId,
      publisherName: mockBook.publisherName,
      isbn: mockBook.isbn,
      quantity: mockBook.quantity,
      description: mockBook.description,
      language: mockBook.language,
      publishedYear: mockBook.publishedYear,
    };

    const result = await service.create(dto);

    expect(prisma.book.create).toHaveBeenCalledWith({
      data: expect.objectContaining(dto),
    });
    expect(result).toEqual(mockBook);
  });

  it('should update a book', async () => {
    prisma.book.update.mockResolvedValueOnce({
      ...mockBook,
      title: 'Updated Title',
    });

    const result = await service.update(1, { title: 'Updated Title' });

    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'Updated Title' },
    });
    expect(result.title).toBe('Updated Title');
  });

  it('should delete a book', async () => {
    prisma.book.delete.mockResolvedValueOnce(mockBook);

    const result = await service.remove(1);

    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(mockBook);
  });
});
