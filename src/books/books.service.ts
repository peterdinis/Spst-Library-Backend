import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma, Book } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { DEFAULT_CACHE_TTL } from 'src/shared/constants/applicationConstants';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async validateAuthorExists(authorId: number) {
    if (!authorId || authorId < 1)
      throw new BadRequestException('Author ID must be a positive number');
    const author = await this.prisma.author.findUnique({
      where: { id: authorId },
    });
    if (!author)
      throw new NotFoundException(`Author with ID ${authorId} does not exist`);
  }

  private async validateCategoryExists(categoryId: number) {
    if (!categoryId || categoryId < 1)
      throw new BadRequestException('Category ID must be a positive number');
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Category with ID ${categoryId} does not exist`,
      );
  }

  private async validateBookExists(bookId: number): Promise<Book> {
    if (!bookId || bookId < 1)
      throw new BadRequestException('Book ID must be a positive number');
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Book with ID ${bookId} not found`);
    return book;
  }

  private async clearCache() {
    try {
      await this.cacheManager.clear();
    } catch {
      throw new InternalServerErrorException('Failed to clear cache');
    }
  }

  async create(dto: CreateBookDto): Promise<Book> {
    await this.validateAuthorExists(dto.authorId);
    if (dto.categoryId) await this.validateCategoryExists(dto.categoryId);

    const existing = await this.prisma.book.findFirst({
      where: { name: dto.name, authorId: dto.authorId },
    });
    if (existing) {
      throw new ConflictException(
        `Book "${dto.name}" by this author already exists`,
      );
    }

    const newBook = await this.prisma.book.create({ data: dto });
    await this.clearCache();
    return newBook;
  }

  async findAll(query: QueryBooksDto) {
    const { search, page = 1, limit = 10 } = query;
    if (!Number.isInteger(page) || page < 1)
      throw new BadRequestException('Page must be a positive integer');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    const cacheKey = `books:list:${search || 'all'}:${page}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where: Prisma.BookWhereInput = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
          ratings: true,
          category: true,
          bookTags: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    if (total === 0) throw new NotFoundException('No books found');

    const result = {
      data: books,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
    await this.cacheManager.set(cacheKey, result, DEFAULT_CACHE_TTL);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `book:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true, category: true, bookTags: true, ratings: true },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

    await this.cacheManager.set(cacheKey, book, DEFAULT_CACHE_TTL);
    return book;
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    await this.validateBookExists(id);
    if (dto.authorId) await this.validateAuthorExists(dto.authorId);
    if (dto.categoryId) await this.validateCategoryExists(dto.categoryId);

    const updated = await this.prisma.book.update({
      where: { id },
      data: dto,
    });
    await this.clearCache();
    return updated;
  }

  async remove(id: number): Promise<Book> {
    await this.validateBookExists(id);
    const deleted = await this.prisma.book.delete({ where: { id } });
    await this.clearCache();
    return deleted;
  }

  async filter(query: FilterBooksDto) {
    const { authorId, categoryId, isAvailable, isNew, yearMin, yearMax } =
      query;

    const where: Prisma.BookWhereInput = {};
    if (authorId) {
      if (authorId < 1) throw new BadRequestException('Invalid author ID');
      where.authorId = authorId;
    }
    if (categoryId) {
      if (categoryId < 1) throw new BadRequestException('Invalid category ID');
      where.categoryId = categoryId;
    }
    if (typeof isAvailable === 'boolean') where.isAvailable = isAvailable;
    if (typeof isNew === 'boolean') where.isNew = isNew;
    if (yearMin || yearMax) {
      where.year = {};
      if (yearMin) where.year.gte = yearMin;
      if (yearMax) where.year.lte = yearMax;
    }

    const books = await this.prisma.book.findMany({
      where,
      include: { author: true, category: true, bookTags: true },
      orderBy: { createdAt: 'desc' },
    });

    if (books.length === 0)
      throw new NotFoundException('No books match the provided filters');
    return { data: books, total: books.length };
  }

  async findAvailable() {
    const cacheKey = `books:available`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const books = await this.prisma.book.findMany({
      where: { isAvailable: true },
      include: { author: true, category: true, bookTags: true },
      orderBy: { createdAt: 'desc' },
    });

    if (books.length === 0)
      throw new NotFoundException('No available books found');
    const result = { data: books, total: books.length };
    await this.cacheManager.set(cacheKey, result, DEFAULT_CACHE_TTL);
    return result;
  }

  async findUnavailable() {
    const cacheKey = `books:unavailable`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const books = await this.prisma.book.findMany({
      where: { isAvailable: false },
      include: { author: true, category: true, bookTags: true },
      orderBy: { createdAt: 'desc' },
    });

    if (books.length === 0)
      throw new NotFoundException('No unavailable books found');
    const result = { data: books, total: books.length };
    await this.cacheManager.set(cacheKey, result, DEFAULT_CACHE_TTL);
    return result;
  }

  async findTopRated(limit = 10) {
    if (limit < 1 || limit > 50)
      throw new BadRequestException('Limit must be between 1 and 50');

    return this.prisma.book.findMany({
      take: limit,
      include: { author: true, ratings: true },
    });
  }

  async findRecentlyAdded(days = 7) {
    if (days < 1 || days > 365)
      throw new BadRequestException('Days must be between 1 and 365');

    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.book.findMany({
      where: { createdAt: { gte: since } },
      include: { author: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
