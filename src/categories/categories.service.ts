import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindAllCategoriesDto } from './dto/find-all-categories.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new category.
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({ data });

    // Invalidate category caches after creation
    await this.cacheService.delete('categories:all');
    await this.cacheService.delete(`category:${category.id}`);

    return category;
  }

  /**
   * Retrieve all categories with optional pagination and search.
   */
  async findAll(
    params: FindAllCategoriesDto,
  ): Promise<{ data: Category[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;
    const cacheKey = `categories:all:${skip}:${take}:${search}`;

    // Check cache first
    const cached = await this.cacheService.get<{ data: Category[]; total: number }>(
      cacheKey,
    );
    if (cached) return cached;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({ where, skip, take }),
      this.prisma.category.count({ where }),
    ]);

    const result = { data, total };

    // Cache result for 60 seconds
    await this.cacheService.set(cacheKey, result, 60_000);

    return result;
  }

  /**
   * Retrieve a category by its ID.
   */
  async findOne(id: number): Promise<Category | null> {
    const cacheKey = `category:${id}`;

    const cached = await this.cacheService.get<Category>(cacheKey);
    if (cached) return cached;

    const category = await this.prisma.category.findUnique({ where: { id } });

    if (category) {
      await this.cacheService.set(cacheKey, category, 60_000);
    }

    return category;
  }

  /**
   * Update a category by its ID.
   */
  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.update({ where: { id }, data });

    // Invalidate caches
    await this.cacheService.delete('categories:all');
    await this.cacheService.delete(`category:${id}`);

    return category;
  }

  /**
   * Delete a category by its ID.
   */
  async remove(id: number): Promise<Category> {
    const category = await this.prisma.category.delete({ where: { id } });

    // Invalidate caches
    await this.cacheService.delete('categories:all');
    await this.cacheService.delete(`category:${id}`);

    return category;
  }
}
