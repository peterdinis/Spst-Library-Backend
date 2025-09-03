import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationDto } from './dto/category-pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly cacheKeyAll = 'categories:all';

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    // Include search in cache key
    const cacheKey = `${this.cacheKeyAll}:page=${page}:limit=${limit}:search=${search || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    const result = {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `category:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    await this.cacheManager.set(cacheKey, category, 60);
    return category;
  }

  async create(data: CreateCategoryDto) {
    const category = await this.prisma.category.create({ data });
    await this.cacheManager.clear();
    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.prisma.category.update({ where: { id }, data });
    await this.cacheManager.del(`category:${id}`);
    await this.cacheManager.clear();
    return category;
  }

  async remove(id: number) {
    await this.prisma.category.delete({ where: { id } });
    await this.cacheManager.del(`category:${id}`);
    await this.cacheManager.clear();
    return { message: `Category ${id} deleted` };
  }
}
