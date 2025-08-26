import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Author } from '@prisma/client';
import { CreateAuthorDto } from './dto/create-author.dto';
import { FindAllAuthorsDto } from './dto/find-all-authors.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new author and invalidate cached author lists.
   */
  async create(data: CreateAuthorDto): Promise<Author> {
    const author = await this.prisma.author.create({ data });

    // Invalidate all cached author lists
    await this.cacheService.delete('authors:all');

    return author;
  }

  /**
   * Retrieve all authors with optional pagination and search.
   * Uses caching for better performance.
   */
  async findAll(
    params: FindAllAuthorsDto,
  ): Promise<{ data: Author[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;
    const cacheKey = `authors:paginate:${skip}:${take}:${search || 'all'}`;

    const cached = await this.cacheService.get<{
      data: Author[];
      total: number;
    }>(cacheKey);
    if (cached) return cached;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
            { nationality: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
      this.prisma.author.count({ where }),
    ]);

    const result = { data, total };
    await this.cacheService.set(cacheKey, result, 60_000 * 5); // cache for 5 min

    return result;
  }

  /**
   * Retrieve an author by ID with caching.
   */
  async findOne(id: number): Promise<Author | null> {
    const cacheKey = `author:${id}`;
    const cached = await this.cacheService.get<Author>(cacheKey);
    if (cached) return cached;

    const author = await this.prisma.author.findUnique({ where: { id } });
    if (author) {
      await this.cacheService.set(cacheKey, author, 60_000 * 5);
    }

    return author;
  }

  /**
   * Update an author by ID and invalidate related cache entries.
   */
  async update(id: number, data: UpdateAuthorDto): Promise<Author> {
    const author = await this.prisma.author.update({ where: { id }, data });

    await this.cacheService.delete(`author:${id}`);
    await this.cacheService.delete('authors:all');

    return author;
  }

  /**
   * Delete an author by ID and invalidate related cache entries.
   */
  async remove(id: number): Promise<Author> {
    const author = await this.prisma.author.delete({ where: { id } });

    await this.cacheService.delete(`author:${id}`);
    await this.cacheService.delete('authors:all');

    return author;
  }
}
