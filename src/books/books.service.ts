import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBookDto): Promise<Book> {
    // Validate author
    const author = await this.prisma.author.findUnique({
      where: { id: data.authorId },
    });
    if (!author)
      throw new NotFoundException(`Author with ID ${data.authorId} not found`);

    // Validate category
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category)
      throw new NotFoundException(
        `Category with ID ${data.categoryId} not found`,
      );

    // Validate ISBN uniqueness if provided
    if (data.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: data.isbn },
      });
      if (existing)
        throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    // Validate quantity
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

  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany({
      include: { author: true, category: true },
    });
  }

  // READ ONE
  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: number, data: UpdateBookDto): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    // Validate author/category if provided
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

    // Validate ISBN uniqueness
    if (data.isbn && data.isbn !== existing.isbn) {
      const isbnExists = await this.prisma.book.findUnique({
        where: { isbn: data.isbn },
      });
      if (isbnExists)
        throw new BadRequestException(`ISBN ${data.isbn} already exists`);
    }

    // Validate quantity
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new BadRequestException(`Quantity cannot be negative`);
    }

    return this.prisma.book.update({
      where: { id },
      data,
      include: { author: true, category: true },
    });
  }

  async remove(id: number): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book with ID ${id} not found`);

    return this.prisma.book.delete({ where: { id } });
  }
}
