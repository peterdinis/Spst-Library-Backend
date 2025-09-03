import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

@Injectable()
export class BooksService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async create(createBookDto: CreateBookDto) {
        // ✅ Validate that author exists
        const author = await this.prisma.author.findUnique({ where: { id: createBookDto.authorId } });
        if (!author) {
            throw new BadRequestException(`Author with ID ${createBookDto.authorId} does not exist`);
        }

        // ✅ Validate category if provided
        if (createBookDto.categoryId) {
            const category = await this.prisma.category.findUnique({ where: { id: createBookDto.categoryId } });
            if (!category) {
                throw new BadRequestException(`Category with ID ${createBookDto.categoryId} does not exist`);
            }
        }

        const newBook = await this.prisma.book.create({ data: createBookDto });
        await this.cacheManager.clear(); // clear cache on create
        return newBook;
    }

    async findAll(query: QueryBooksDto) {
        const { search, page = 1, limit = 10 } = query;

        if (page < 1) throw new BadRequestException('Page must be >= 1');
        if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

        const skip = (page - 1) * limit;
        const cacheKey = `books:${search || 'all'}:${page}:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const [books, total] = await this.prisma.$transaction([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                include: { author: true, ratings: true, category: true, bookTags: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.book.count({ where }),
        ]);

        if (books.length === 0) {
            throw new NotFoundException('No books found for the given query');
        }

        const result = {
            data: books,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };

        await this.cacheManager.set(cacheKey, result, 30_000);
        return result;
    }

    async findOne(id: number) {
        if (!id || id < 1) throw new BadRequestException('Invalid book ID');

        const cacheKey = `book:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const book = await this.prisma.book.findUnique({
            where: { id },
            include: { author: true, category: true, bookTags: true },
        });
        if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

        await this.cacheManager.set(cacheKey, book, 60_000);
        return book;
    }

    async update(id: number, updateBookDto: UpdateBookDto) {
        await this.findOne(id); // ensure book exists

        if (updateBookDto.authorId) {
            const author = await this.prisma.author.findUnique({ where: { id: updateBookDto.authorId } });
            if (!author) {
                throw new BadRequestException(`Author with ID ${updateBookDto.authorId} does not exist`);
            }
        }

        if (updateBookDto.categoryId) {
            const category = await this.prisma.category.findUnique({ where: { id: updateBookDto.categoryId } });
            if (!category) {
                throw new BadRequestException(`Category with ID ${updateBookDto.categoryId} does not exist`);
            }
        }

        const updated = await this.prisma.book.update({
            where: { id },
            data: updateBookDto,
        });

        await this.cacheManager.clear(); // clear cache
        return updated;
    }

    async remove(id: number) {
        await this.findOne(id);
        const deleted = await this.prisma.book.delete({ where: { id } });
        await this.cacheManager.clear();
        return deleted;
    }

    async filter(query: FilterBooksDto) {
        const { authorId, categoryId, isAvailable, isNew, yearMin, yearMax } = query;

        const where: any = {};

        if (authorId) where.authorId = authorId;
        if (categoryId) where.categoryId = categoryId;
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

        if (books.length === 0) {
            throw new NotFoundException('No books match the provided filters');
        }

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

        if (books.length === 0) {
            throw new NotFoundException('No available books found');
        }

        const result = { data: books, total: books.length };
        await this.cacheManager.set(cacheKey, result, 30_000);
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

        if (books.length === 0) {
            throw new NotFoundException('No unavailable books found');
        }

        const result = { data: books, total: books.length };
        await this.cacheManager.set(cacheKey, result, 30_000);
        return result;
    }

}
