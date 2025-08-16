import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';
import { FilterBooksDto } from './dto/filtering-books.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Paginate books with optional search by title.
   */
  async paginate(page = 1, limit = 10, search?: string) {
    const cacheKey = `books:paginate:${page}:${limit}:${search || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const where = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({ where, skip, take: limit, orderBy: { dateCreated: 'desc' } }),
      this.prisma.book.count({ where }),
    ]);

    const result = {
      data: books,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  /**
   * Create a new book.
   */
  async create(data: CreateBookDto): Promise<Book> {
    const author = await this.prisma.author.findUnique({ where: { id: data.authorId } });
    if (!author) throw new NotFoundException(`Author with ID ${data.authorId} not found`);

    const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundException(`Category with ID ${data.categoryId} not found`);

    if (data.isbn) {
      const existing = await this.prisma.book.findUnique({ where: { isbn: data.isbn } });
      if (existing) throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    if (data.quantity < 0) throw new BadRequestException(`Quantity cannot be negative`);

    const book = await this.prisma.book.create({
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

    await (this.cacheManager as any).reset();
    return book;
  }

  /**
   * Find all books.
   */
  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany();
  }

  /**
   * Find one book by ID (cached).
   */
  async findOne(id: number): Promise<Book> {
    const cacheKey = `books:one:${id}`;
    const cached = await this.cacheManager.get<Book>(cacheKey);
    if (cached) return cached;

    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

    await this.cacheManager.set(cacheKey, book, 60);
    return book;
  }

  /**
   * Update a book by ID.
   */
  async update(id: number, data: UpdateBookDto): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    if (data.authorId) {
      const author = await this.prisma.author.findUnique({ where: { id: data.authorId } });
      if (!author) throw new NotFoundException(`Author with ID ${data.authorId} not found`);
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundException(`Category with ID ${data.categoryId} not found`);
    }

    if (data.isbn && data.isbn !== existing.isbn) {
      const isbnExists = await this.prisma.book.findUnique({ where: { isbn: data.isbn } });
      if (isbnExists) throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new BadRequestException(`Quantity cannot be negative`);
    }

    const book = await this.prisma.book.update({ where: { id }, data });
    await (this.cacheManager as any).reset();
    return book;
  }

  /**
   * Remove a book by ID.
   */
  async remove(id: number): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    const book = await this.prisma.book.delete({ where: { id } });
    await (this.cacheManager as any).reset();
    return book;
  }

  /**
   * Search books (cached).
   */
  async search(query: string, page = 1, limit = 10) {
    const cacheKey = `books:search:${query}:${page}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { isbn: { contains: query } },
        { authorId: Number(query) || undefined },
        { categoryId: Number(query) || undefined },
      ].filter(Boolean),
    };

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({ where, skip, take: limit, orderBy: { dateCreated: 'desc' } }),
      this.prisma.book.count({ where }),
    ]);

    const result = {
      data: books,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  /**
   * Filter books (cached).
   */
  async filterBooks(filterDto: FilterBooksDto) {
    const cacheKey = `books:filter:${JSON.stringify(filterDto)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const { title, authorId, categoryId, publishedYear, language, dateFrom, dateTo, page = 1, limit = 10 } = filterDto;
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

    const result = {
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  /**
   * Find available books.
   */
  async findAvailable() {
    return this.prisma.book.findMany({ where: { isAviable: true } });
  }

  /**
   * Find unavailable books.
   */
  async findUnavailable() {
    return this.prisma.book.findMany({ where: { isAviable: false } });
  }

  /**
   * Update availability.
   */
  async updateAvailability(id: number, isAvailable: boolean) {
    const book = await this.prisma.book.update({ where: { id }, data: { isAviable: isAvailable } });
    await (this.cacheManager as any).reset();
    return book;
  }
}
