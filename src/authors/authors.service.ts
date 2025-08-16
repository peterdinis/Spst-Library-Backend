import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Author } from '@prisma/client';
import { CreateAuthorDto } from './dto/create-author.dto';
import { FindAllAuthorsDto } from './dto/find-all-authors.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Create a new author and invalidate cached author lists.
   * @param {CreateAuthorDto} data - The author creation payload.
   * @returns {Promise<Author>} The newly created author.
   */
  async create(data: CreateAuthorDto): Promise<Author> {
    const author = await this.prisma.author.create({ data });
    // Invalidate all cached author lists
    await this.cacheManager.del('authors:all');
    return author;
  }

  /**
   * Retrieve all authors with optional pagination and search.
   * Uses caching for better performance.
   * @param {FindAllAuthorsDto} params - The pagination and search parameters.
   * @param {number} [params.skip=0] - Number of records to skip.
   * @param {number} [params.take=10] - Number of records to retrieve.
   * @param {string} [params.search] - Search term for author name or bio.
   * @returns {Promise<{ data: Author[]; total: number }>} A list of authors and the total count.
   */
  async findAll(params: FindAllAuthorsDto): Promise<{ data: Author[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;
    const cacheKey = `authors:paginate:${skip}:${take}:${search || 'all'}`;

    const cached = await this.cacheManager.get<{ data: Author[]; total: number }>(cacheKey);
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
    await this.cacheManager.set(cacheKey, result, 60 * 5); // cache for 5 min
    return result;
  }

  /**
   * Retrieve an author by ID with caching.
   * @param {number} id - The author ID.
   * @returns {Promise<Author | null>} The author if found, otherwise null.
   */
  async findOne(id: number): Promise<Author | null> {
    const cacheKey = `author:${id}`;
    const cached = await this.cacheManager.get<Author>(cacheKey);
    if (cached) return cached;

    const author = await this.prisma.author.findUnique({ where: { id } });
    if (author) {
      await this.cacheManager.set(cacheKey, author, 60 * 5);
    }
    return author;
  }

  /**
   * Update an author by ID and invalidate related cache entries.
   * @param {number} id - The author ID.
   * @param {UpdateAuthorDto} data - The update payload.
   * @returns {Promise<Author>} The updated author.
   */
  async update(id: number, data: UpdateAuthorDto): Promise<Author> {
    const author = await this.prisma.author.update({ where: { id }, data });
    await this.cacheManager.del(`author:${id}`);
    await this.cacheManager.del('authors:all');
    return author;
  }

  /**
   * Delete an author by ID and invalidate related cache entries.
   * @param {number} id - The author ID.
   * @returns {Promise<Author>} The deleted author.
   */
  async remove(id: number): Promise<Author> {
    const author = await this.prisma.author.delete({ where: { id } });
    await this.cacheManager.del(`author:${id}`);
    await this.cacheManager.del('authors:all');
    return author;
  }
}
