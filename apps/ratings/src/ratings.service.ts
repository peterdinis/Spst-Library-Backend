import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './model/rating.model';
import { CreateRatingDto } from '@app/dtos/ratings/create-rating.dto';
import { PaginationDto } from '@app/dtos/ratings/rating-pagination.dto';
import { UpdateRatingDto } from '@app/dtos/ratings/update-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    if (page < 1 || limit < 1)
      throw new BadRequestException('Page and limit must be positive');

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.ratingModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('bookId'),
      this.ratingModel.countDocuments(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid rating ID');
    const rating = await this.ratingModel.findById(id).populate('bookId');
    if (!rating) throw new NotFoundException(`Rating ${id} not found`);
    return rating;
  }

  async create(dto: CreateRatingDto) {
    if (!Types.ObjectId.isValid(dto.bookId))
      throw new BadRequestException('Invalid book ID');
    const rating = new this.ratingModel(dto);
    return rating.save();
  }

  async update(id: string, dto: UpdateRatingDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid rating ID');
    const rating = await this.ratingModel.findById(id);
    if (!rating) throw new NotFoundException(`Rating ${id} not found`);

    if (dto.value !== undefined) rating.value = dto.value;
    if (dto.comment !== undefined) rating.comment = dto.comment;

    return rating.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid rating ID');
    const rating = await this.ratingModel.findById(id);
    if (!rating) throw new NotFoundException(`Rating ${id} not found`);

    await rating.deleteOne();
    return { message: `Rating ${id} deleted successfully` };
  }
}
