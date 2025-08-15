import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';
import { FilterBooksDto } from './dto/filtering-books.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginate books with optional search by title.
   * @param page Page number (default 1)
   * @param limit Items per page (default 10)
   * @param search Optional search string to filter by title
   * @returns Paginated books with metadata
   */
  async paginate(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateCreated: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data: books,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new book.
   * @param data Book data
   * @returns The created Book
   */
  async create(data: CreateBookDto): Promise<Book> {
    const author = await this.prisma.author.findUnique({
      where: { id: data.authorId },
    });
    if (!author)
      throw new NotFoundException(`Author with ID ${data.authorId} not found`);

    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Category with ID ${data.categoryId} not found`,
      );

    if (data.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: data.isbn },
      });
      if (existing)
        throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    if (data.quantity < 0)
      throw new BadRequestException(`Quantity cannot be negative`);

    return this.prisma.book.create({
      data: {
        title: data.title,
        quantity: data.quantity,
        publisherName: data.publisherName,
        isbn: data.isbn,
        publishedYear: data.publishedYear,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        language: data.language,
        author: { connect: { id: data.authorId } },
        category: { connect: { id: data.categoryId } },
      },
    });
  }

  /**
   * Find all books (fast, without relations).
   * @returns List of all books
   */
  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany();
  }

  /**
   * Find one book by ID.
   * @param id Book ID
   * @returns Book if found
   */
  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  /**
   * Update a book by ID.
   * @param id Book ID
   * @param data Updated book data
   * @returns Updated book
   */
  async update(id: number, data: UpdateBookDto): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    if (data.authorId) {
      const author = await this.prisma.author.findUnique({
        where: { id: data.authorId },
      });
      if (!author)
        throw new NotFoundException(
          `Author with ID ${data.authorId} not found`,
        );
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category)
        throw new NotFoundException(
          `Category with ID ${data.categoryId} not found`,
        );
    }

    if (data.isbn && data.isbn !== existing.isbn) {
      const isbnExists = await this.prisma.book.findUnique({
        where: { isbn: data.isbn },
      });
      if (isbnExists)
        throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new BadRequestException(`Quantity cannot be negative`);
    }

    return this.prisma.book.update({ where: { id }, data });
  }

  /**
   * Remove a book by ID.
   * @param id Book ID
   * @returns Deleted book
   */
  async remove(id: number): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    return this.prisma.book.delete({ where: { id } });
  }

  /**
   * Search books by query in multiple fields.
   * @param query Search string
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated search results
   */
  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { isbn: { contains: query } },
        { authorId: Number(query) || undefined },
        { categoryId: Number(query) || undefined },
      ].filter(Boolean),
    };

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateCreated: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data: books,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Filter books with multiple criteria.
   * @param filterDto Filtering parameters
   * @returns Filtered books with pagination
   */
  async filterBooks(filterDto: FilterBooksDto) {
    const {
      title,
      authorId,
      categoryId,
      publishedYear,
      language,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = filterDto;

    const where: any = {};

    if (title) where.title = { contains: title, mode: 'insensitive' };
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;
    if (publishedYear) where.publishedYear = publishedYear;
    if (language) where.language = { contains: language, mode: 'insensitive' };

    if (dateFrom || dateTo) {
      where.dateCreated = {};
      if (dateFrom) where.dateCreated.gte = new Date(dateFrom);
      if (dateTo) where.dateCreated.lte = new Date(dateTo);
    }

    const books = await this.prisma.book.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dateCreated: 'desc' },
    });

    const total = await this.prisma.book.count({ where });

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find all available books.
   * @returns List of available books
   */
  async findAvailable() {
    return this.prisma.book.findMany({ where: { isAviable: true } });
  }

  /**
   * Find all unavailable books.
   * @returns List of unavailable books
   */
  async findUnavailable() {
    return this.prisma.book.findMany({ where: { isAviable: false } });
  }

  /**
   * Update availability of a book.
   * @param id Book ID
   * @param isAvailable Availability flag
   * @returns Updated book
   */
  async updateAvailability(id: number, isAvailable: boolean) {
    return this.prisma.book.update({ where: { id }, data: { isAviable: isAvailable } });
  }
}
