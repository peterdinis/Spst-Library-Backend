// authors.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Author, AuthorDocument } from './models/author.model';
import { CreateAuthorDto } from '@app/dtos/authors/create-author.dto';
import { QueryAuthorDto } from '@app/dtos/authors/query-author.dto';
import { UpdateAuthorDto } from '@app/dtos/authors/update-author.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
  ) {}

  async create(dto: CreateAuthorDto): Promise<Author> {
    const existing = await this.authorModel.findOne({
      name: dto.name,
      bornDate: dto.bornDate,
    }).exec();

    if (existing) {
      throw new ConflictException(
        `Author "${dto.name}" (born ${dto.bornDate}) already exists.`,
      );
    }

    const author = await this.authorModel.create(dto);
    return author;
  }

  async findAll(query: QueryAuthorDto): Promise<PaginatedResult<Author>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    const filter: FilterQuery<AuthorDocument> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await this.authorModel.countDocuments(filter).exec();
    if (total === 0) {
      throw new NotFoundException(
        `No authors found${search ? ` matching "${search}"` : ''}.`,
      );
    }

    const data = await this.authorModel
      .find(filter)
      .populate('books')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Author> {
    if (!id) throw new BadRequestException('Invalid author ID');

    const author = await this.authorModel.findById(id).populate('books').exec();
    if (!author) throw new NotFoundException(`Author ${id} not found`);

    return author;
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
    if (!id) throw new BadRequestException('Invalid author ID');

    const exists = await this.authorModel.findById(id).exec();
    if (!exists) throw new NotFoundException(`Author ${id} not found`);

    if (dto.name || dto.bornDate) {
      const duplicate = await this.authorModel.findOne({
        _id: { $ne: id },
        name: dto.name ?? exists.name,
        bornDate: dto.bornDate ?? exists.bornDate,
      }).exec();

      if (duplicate) {
        throw new ConflictException(
          `Another author with name "${dto.name ?? exists.name}" and born date "${dto.bornDate ?? exists.bornDate}" already exists.`,
        );
      }
    }

    const updated = await this.authorModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('books')
      .exec();

    return updated!;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!id) throw new BadRequestException('Invalid author ID');

    const exists = await this.authorModel.findById(id).exec();
    if (!exists) throw new NotFoundException(`Author ${id} not found`);

    await this.authorModel.findByIdAndDelete(id).exec();
    return { message: `Author ${id} deleted successfully.` };
  }
}
