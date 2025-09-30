import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Book, BookDocument } from './model/book.model';
import {
  CreateBookDto,
  UpdateBookDto,
  FilterBooksDto,
  QueryBooksDto,
} from '@app/dtos';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {}

  private async validateAuthorExists(authorId: string) {
    if (!authorId || !Types.ObjectId.isValid(authorId))
      throw new BadRequestException('Invalid Author ID');
    const authorExists = await this.bookModel.db
      .collection('authors')
      .findOne({ _id: new Types.ObjectId(authorId) });
    if (!authorExists)
      throw new NotFoundException(`Author with ID ${authorId} does not exist`);
  }

  private async validateCategoryExists(categoryId: string) {
    if (!categoryId || !Types.ObjectId.isValid(categoryId))
      throw new BadRequestException('Invalid Category ID');
    const categoryExists = await this.bookModel.db
      .collection('categories')
      .findOne({ _id: new Types.ObjectId(categoryId) });
    if (!categoryExists)
      throw new NotFoundException(
        `Category with ID ${categoryId} does not exist`,
      );
  }

  private async validateBookExists(bookId: string): Promise<BookDocument> {
    if (!bookId || !Types.ObjectId.isValid(bookId))
      throw new BadRequestException('Invalid Book ID');
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException(`Book with ID ${bookId} not found`);
    return book;
  }

  async create(dto: CreateBookDto): Promise<BookDocument> {
    await this.validateAuthorExists(dto.authorId);
    if (dto.categoryId) await this.validateCategoryExists(dto.categoryId);

    const existing = await this.bookModel.findOne({
      name: dto.name,
      authorId: new Types.ObjectId(dto.authorId),
    });
    if (existing) {
      throw new ConflictException(
        `Book "${dto.name}" by this author already exists`,
      );
    }

    return this.bookModel.create({
      ...dto,
      authorId: new Types.ObjectId(dto.authorId),
      categoryId: dto.categoryId
        ? new Types.ObjectId(dto.categoryId)
        : undefined,
    });
  }

  async findAll(query: QueryBooksDto) {
    const { search, page = 1, limit = 10 } = query;
    if (!Number.isInteger(page) || page < 1)
      throw new BadRequestException('Page must be a positive integer');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;

    const filter: FilterQuery<BookDocument> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [books, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .populate('authorId')
        .populate('categoryId')
        .populate('bookTags')
        .populate('ratings')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookModel.countDocuments(filter),
    ]);

    if (total === 0) throw new NotFoundException('No books found');

    return {
      data: books,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const book = await this.bookModel
      .findById(id)
      .populate('authorId')
      .populate('categoryId')
      .populate('bookTags')
      .exec();

    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.validateBookExists(id);
    if (dto.authorId) await this.validateAuthorExists(dto.authorId);
    if (dto.categoryId) await this.validateCategoryExists(dto.categoryId);

    return this.bookModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        authorId: dto.authorId ? new Types.ObjectId(dto.authorId) : undefined,
        categoryId: dto.categoryId
          ? new Types.ObjectId(dto.categoryId)
          : undefined,
      },
      { new: true },
    );
  }

  async remove(id: string) {
    await this.validateBookExists(id);
    return this.bookModel.findByIdAndDelete(id);
  }

  async updateAvailability(
    bookId: string,
    isAvailable: boolean,
  ): Promise<BookDocument> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid Book ID');
    }

    const book = await this.bookModel.findByIdAndUpdate(
      bookId,
      { isAvailable },
      { new: true },
    );

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    return book;
  }

  async filter(query: FilterBooksDto) {
    const filter: FilterQuery<BookDocument> = {};

    if (query.authorId) filter.authorId = new Types.ObjectId(query.authorId);
    if (query.categoryId)
      filter.categoryId = new Types.ObjectId(query.categoryId);
    if (typeof query.isAvailable === 'boolean')
      filter.isAvailable = query.isAvailable;
    if (typeof query.isNew === 'boolean') filter.isNew = query.isNew;
    if (query.yearMin || query.yearMax) {
      filter.year = {};
      if (query.yearMin) filter.year.$gte = query.yearMin;
      if (query.yearMax) filter.year.$lte = query.yearMax;
    }

    const books = await this.bookModel
      .find(filter)
      .populate('authorId')
      .populate('categoryId')
      .populate('bookTags')
      .sort({ createdAt: -1 })
      .exec();

    if (!books.length)
      throw new NotFoundException('No books match the provided filters');

    return { data: books, total: books.length };
  }

  async findAvailable() {
    const books = await this.bookModel
      .find({ isAvailable: true })
      .populate('authorId')
      .populate('categoryId')
      .populate('bookTags')
      .sort({ createdAt: -1 })
      .exec();

    if (!books.length) throw new NotFoundException('No available books found');
    return { data: books, total: books.length };
  }

  async findUnavailable() {
    const books = await this.bookModel
      .find({ isAvailable: false })
      .populate('authorId')
      .populate('categoryId')
      .populate('bookTags')
      .sort({ createdAt: -1 })
      .exec();

    if (!books.length)
      throw new NotFoundException('No unavailable books found');
    return { data: books, total: books.length };
  }

  async findTopRated(limit = 10) {
    if (limit < 1 || limit > 50)
      throw new BadRequestException('Limit must be between 1 and 50');

    return this.bookModel
      .find()
      .sort({ 'ratings.value': -1 })
      .limit(limit)
      .populate('authorId')
      .populate('ratings')
      .exec();
  }

  async findRecentlyAdded(days = 7) {
    if (days < 1 || days > 365)
      throw new BadRequestException('Days must be between 1 and 365');

    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.bookModel
      .find({ createdAt: { $gte: since } })
      .populate('authorId')
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
