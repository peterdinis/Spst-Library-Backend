import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationDto } from './dto/category-pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly cacheKeyAll = 'categories:all';
  private readonly DEFAULT_CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async validateCategoryExists(id: number) {
    if (!id || id < 1) throw new BadRequestException('Category ID must be a positive number');
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  private validateCreateData(data: CreateCategoryDto) {
    if (!data.name || !data.name.trim())
      throw new BadRequestException('Category name is required');
    if (data.name.length > 100)
      throw new BadRequestException('Category name must be less than 100 characters');
    if (data.description && data.description.length > 500)
      throw new BadRequestException('Description must be less than 500 characters');
  }

  private validateUpdateData(data: UpdateCategoryDto) {
    if (data.name && !data.name.trim())
      throw new BadRequestException('Category name cannot be empty');
    if (data.name && data.name.length > 100)
      throw new BadRequestException('Category name must be less than 100 characters');
    if (data.description && data.description.length > 500)
      throw new BadRequestException('Description must be less than 500 characters');
  }

  async findAllCached() {
    const cacheKey = `${this.cacheKeyAll}:full`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      include: { books: { select: { id: true, name: true, categoryId: true } } },
    });

    await this.cacheManager.set(cacheKey, categories, this.DEFAULT_CACHE_TTL);
    return categories;
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;

    if (page < 1) throw new BadRequestException('Page must be a positive integer');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    const skip = (page - 1) * limit;
    const cacheKey = `${this.cacheKeyAll}:page=${page}:limit=${limit}:search=${search || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
<<<<<<< HEAD
        take: Number(limit),
        include: {
          books: true,
        },
=======
        take: limit,
        include: { books: true },
>>>>>>> main
      }),
      this.prisma.category.count({ where }),
    ]);

    const result = {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.cacheManager.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `category:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const category = await this.validateCategoryExists(id);

    await this.cacheManager.set(cacheKey, category, this.DEFAULT_CACHE_TTL);
    return category;
  }

  async create(data: CreateCategoryDto) {
    this.validateCreateData(data);

    const existing = await this.prisma.category.findFirst({ where: { name: data.name } });
    if (existing) throw new ConflictException(`Category "${data.name}" already exists`);

    try {
      const category = await this.prisma.category.create({ data });
      await this.cacheManager.clear(); // clear all relevant caches
      return category;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async update(id: number, data: UpdateCategoryDto) {
    this.validateUpdateData(data);
    await this.validateCategoryExists(id);

    try {
      const category = await this.prisma.category.update({ where: { id }, data });
      await this.cacheManager.del(`category:${id}`);
      await this.cacheManager.clear();
      return category;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: number) {
    await this.validateCategoryExists(id);

    try {
      await this.prisma.category.delete({ where: { id } });
      await this.cacheManager.del(`category:${id}`);
      await this.cacheManager.clear();
      return { message: `Category ${id} deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
