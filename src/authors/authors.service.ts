import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateAuthorDto) {
    // ensure no duplicate author with same name + bornDate
    const existing = await this.prisma.author.findFirst({
      where: { name: dto.name, bornDate: dto.bornDate },
    });
    if (existing) {
      throw new ConflictException(
        `Author "${dto.name}" (born ${dto.bornDate}) already exists.`,
      );
    }

    const author = await this.prisma.author.create({ data: dto });
    await this.cacheManager.clear(); // invalidate cache
    return author;
  }

  async findAll(query: QueryAuthorDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const search = query.search?.trim();

  if (page <= 0 || limit <= 0) {
    throw new BadRequestException('Page and limit must be greater than 0');
  }

  const cacheKey = `authors:${search || 'all'}:page:${page}:limit:${limit}`;
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  const where = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {};

  const [data, total] = await Promise.all([
    this.prisma.author.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        books: true
      }
    }),
    this.prisma.author.count({ where }),
  ]);

  if (!data.length) {
    throw new NotFoundException(
      `No authors found${search ? ` matching "${search}"` : ''}.`,
    );
  }

  const result = {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await this.cacheManager.set(cacheKey, result, 60); // 60s TTL
  return result;
}

  async findOne(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid author ID');
    }

    const cacheKey = `author:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException(`Author ${id} not found`);

    await this.cacheManager.set(cacheKey, author, 60);
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid author ID');
    }

    const exists = await this.prisma.author.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Author ${id} not found`);

    // prevent duplicate if name + bornDate already taken by another author
    if (dto.name || dto.bornDate) {
      const duplicate = await this.prisma.author.findFirst({
        where: {
          name: dto.name ?? exists.name,
          bornDate: dto.bornDate ?? exists.bornDate,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Another author with name "${dto.name ?? exists.name}" and born date "${dto.bornDate ?? exists.bornDate}" already exists.`,
        );
      }
    }

    const author = await this.prisma.author.update({
      where: { id },
      data: dto,
    });

    await this.cacheManager.clear();
    return author;
  }

  async remove(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid author ID');
    }

    const exists = await this.prisma.author.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Author ${id} not found`);

    await this.prisma.author.delete({ where: { id } });
    await this.cacheManager.clear();
    return { message: `Author ${id} deleted successfully.` };
  }
}
