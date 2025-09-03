import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PaginationDto } from './dto/rating-pagination.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly cacheKeyAll = 'ratings:all';

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const cacheKey = `${this.cacheKeyAll}:${page}:${limit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const [items, total] = await Promise.all([
      this.prisma.rating.findMany({
        skip,
        take: limit,
        include: { book: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rating.count(),
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
    const cacheKey = `rating:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const rating = await this.prisma.rating.findUnique({
      where: { id },
      include: { book: true },
    });
    if (!rating) throw new NotFoundException(`Rating ${id} not found`);

    await this.cacheManager.set(cacheKey, rating, 60);
    return rating;
  }

  async create(data: CreateRatingDto) {
    const rating = await this.prisma.rating.create({ data });
    await this.cacheManager.clear(); // clear cache globally
    return rating;
  }

  async update(id: number, data: UpdateRatingDto) {
    const rating = await this.prisma.rating.update({
      where: { id },
      data,
    });
    await this.cacheManager.del(`rating:${id}`);
    await this.cacheManager.clear();
    return rating;
  }

  async remove(id: number) {
    await this.prisma.rating.delete({ where: { id } });
    await this.cacheManager.del(`rating:${id}`);
    await this.cacheManager.clear();
    return { message: `Rating ${id} deleted` };
  }
}
