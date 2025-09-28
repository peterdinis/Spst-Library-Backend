import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookTag, BookTagDocument } from './models/book-tag.model';

@Injectable()
export class BookTagService {
  constructor(
    @InjectModel(BookTag.name) private bookTagModel: Model<BookTagDocument>,
  ) {}

  async create(name: string): Promise<BookTag> {
    if (!name || !name.trim()) {
      throw new BadRequestException('Tag name is required');
    }

    const exists = await this.bookTagModel.findOne({ name }).exec();
    if (exists) {
      throw new BadRequestException(`Tag with name "${name}" already exists`);
    }

    const tag = new this.bookTagModel({ name });
    return tag.save();
  }

  async findAll(): Promise<BookTag[]> {
    return this.bookTagModel.find().exec();
  }

  async findOne(id: string): Promise<BookTag> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    const tag = await this.bookTagModel.findById(id).exec();
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: string, name?: string): Promise<BookTag> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    const tag = await this.bookTagModel.findById(id).exec();
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);

    if (name) {
      const exists = await this.bookTagModel.findOne({ name }).exec();
      if (exists && exists.id !== id) {
        throw new BadRequestException(`Tag with name "${name}" already exists`);
      }
      tag.name = name;
    }

    return tag.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    const tag = await this.bookTagModel.findById(id).exec();
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);

    await this.bookTagModel.findByIdAndDelete(id).exec();
    return { message: `Tag ${id} deleted` };
  }

  async search(query: string): Promise<BookTag[]> {
    if (!query || !query.trim()) {
      throw new BadRequestException('Search query cannot be empty');
    }

    return this.bookTagModel
      .find({ name: { $regex: query, $options: 'i' } })
      .exec();
  }
}
