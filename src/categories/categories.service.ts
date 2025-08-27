import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, // opravené
  ) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({ data });

    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${category.id}`);

    return category;
  }

  async findAll(
    params: FindAllCategoriesDto,
  ): Promise<{ data: Category[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;
    const cacheKey = `categories:list:${skip}:${take}:${search || 'all'}`;

    const cached = await this.cacheManager.get<{
      data: Category[];
      total: number;
    }>(cacheKey);
    if (cached) return cached;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    const result = { data, total };
    await this.cacheManager.set(cacheKey, result); // TTL v sekundách
    return result;
  }

  async findOne(id: number): Promise<Category> {
    const cacheKey = `category:${id}`;
    const cached = await this.cacheManager.get<Category>(cacheKey);
    if (cached) return cached;

    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    await this.cacheManager.set(cacheKey, category);
    return category;
  }

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.update({ where: { id }, data });

    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${id}`);

    return category;
  }

  async remove(id: number): Promise<Category> {
    const category = await this.prisma.category.delete({ where: { id } });

    await this.cacheManager.del('categories:all');
    await this.cacheManager.del(`category:${id}`);

    return category;
  }
}
