import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindAllCategoriesDto } from './dto/find-all-categories.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Create a new category.
   * @param {CreateCategoryDto} data - The category creation payload.
   * @returns {Promise<Category>} The newly created category.
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({ data });

    // Invalidate category caches after creation
    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${category.id}`);

    return category;
  }

  /**
   * Retrieve all categories with optional pagination and search.
   * @param {FindAllCategoriesDto} params - The pagination and search parameters.
   * @param {number} [params.skip=0] - Number of records to skip.
   * @param {number} [params.take=10] - Number of records to retrieve.
   * @param {string} [params.search] - Search term for category name.
   * @returns {Promise<{ data: Category[]; total: number }>} A list of categories and the total count.
   */
  async findAll(
    params: FindAllCategoriesDto,
  ): Promise<{ data: Category[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;
    const cacheKey = `categories:all:${skip}:${take}:${search}`;

    // Check cache first
    const cached = await this.cacheManager.get<{
      data: Category[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({ where, skip, take }),
      this.prisma.category.count({ where }),
    ]);

    const result = { data, total };

    // Cache result for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60);

    return result;
  }

  /**
   * Retrieve a category by its ID.
   * @param {number} id - The category ID.
   * @returns {Promise<Category | null>} The category if found, otherwise null.
   */
  async findOne(id: number): Promise<Category | null> {
    const cacheKey = `category:${id}`;

    // Try cache first
    const cached = await this.cacheManager.get<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await this.prisma.category.findUnique({ where: { id } });

    if (category) {
      await this.cacheManager.set(cacheKey, category, 60);
    }

    return category;
  }

  /**
   * Update a category by its ID.
   * @param {number} id - The category ID.
   * @param {UpdateCategoryDto} data - The update payload.
   * @returns {Promise<Category>} The updated category.
   */
  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.update({ where: { id }, data });

    // Invalidate caches
    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${id}`);

    return category;
  }

  /**
   * Delete a category by its ID.
   * @param {number} id - The category ID.
   * @returns {Promise<Category>} The deleted category.
   */
  async remove(id: number): Promise<Category> {
    const category = await this.prisma.category.delete({ where: { id } });

    // Invalidate caches
    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${id}`);

    return category;
  }
}
