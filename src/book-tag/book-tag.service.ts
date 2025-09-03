import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';

@Injectable()
export class BookTagService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(name: string) {
    // Check if tag already exists
    const exists = await this.prisma.bookTag.findUnique({ where: { name } });
    if (exists)
      throw new BadRequestException(`Tag with name "${name}" already exists`);

    const tag = await this.prisma.bookTag.create({ data: { name } });

    // invalidate cache
    await this.cacheManager.del('bookTags');
    return tag;
  }

  async findAll() {
    const cached = await this.cacheManager.get('bookTags');
    if (cached) return cached;

    const tags = await this.prisma.bookTag.findMany();
    await this.cacheManager.set('bookTags', tags); // cache na 60 sekúnd
    return tags;
  }

  async findOne(id: number) {
    const tag = await this.prisma.bookTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: number, name?: string) {
    const tag = await this.prisma.bookTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);

    if (name) {
      const exists = await this.prisma.bookTag.findUnique({ where: { name } });
      if (exists && exists.id !== id)
        throw new BadRequestException(`Tag with name "${name}" already exists`);
    }

    const updated = await this.prisma.bookTag.update({
      where: { id },
      data: { name },
    });

    // invalidate cache
    await this.cacheManager.del('bookTags');
    return updated;
  }

  async remove(id: number) {
    const tag = await this.prisma.bookTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);

    await this.prisma.bookTag.delete({ where: { id } });

    // invalidate cache
    await this.cacheManager.del('bookTags');
    return { message: `Tag ${id} deleted` };
  }

  async search(query: string) {
    if (!query) throw new BadRequestException('Search query cannot be empty');

    const cacheKey = `bookTags_search_${query}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const results = await this.prisma.bookTag.findMany({
      where: { name: { contains: query } },
    });

    await this.cacheManager.set(cacheKey, results); // cache výsledok
    return results;
  }
}
