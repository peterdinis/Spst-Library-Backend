import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './model/category.model';
import { CategoriesPaginationDto } from '@app/dtos/categories/categories-pagination.dto';
import { CreateCategoryDto } from '@app/dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '@app/dtos/categories/update-categories.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private async validateCategoryExists(id: string) {
    if (!id) throw new BadRequestException('Category ID is required');

    const category = await this.categoryModel
      .findById(id)
      .populate('books')
      .exec();
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  private validateCreateData(data: CreateCategoryDto) {
    if (!data.name || !data.name.trim())
      throw new BadRequestException('Category name is required');
    if (data.name.length > 100)
      throw new BadRequestException(
        'Category name must be less than 100 characters',
      );
    if (data.description && data.description.length > 500)
      throw new BadRequestException(
        'Description must be less than 500 characters',
      );
  }

  private validateUpdateData(data: UpdateCategoryDto) {
    if (data.name && !data.name.trim())
      throw new BadRequestException('Category name cannot be empty');
    if (data.name && data.name.length > 100)
      throw new BadRequestException(
        'Category name must be less than 100 characters',
      );
    if (data.description && data.description.length > 500)
      throw new BadRequestException(
        'Description must be less than 500 characters',
      );
  }

  async findAll(pagination: CategoriesPaginationDto) {
    const { page = 1, limit = 10, search } = pagination;

    if (page < 1)
      throw new BadRequestException('Page must be a positive integer');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    const filter: any = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate('books')
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    return this.validateCategoryExists(id);
  }

  async create(data: CreateCategoryDto) {
    this.validateCreateData(data);

    const existing = await this.categoryModel
      .findOne({ name: data.name })
      .exec();
    if (existing)
      throw new ConflictException(`Category "${data.name}" already exists`);

    try {
      const category = await this.categoryModel.create(data);
      return category;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async update(id: string, data: UpdateCategoryDto) {
    this.validateUpdateData(data);
    await this.validateCategoryExists(id);

    try {
      const category = await this.categoryModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
      return category;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string) {
    await this.validateCategoryExists(id);

    try {
      await this.categoryModel.findByIdAndDelete(id).exec();
      return { message: `Category ${id} deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
