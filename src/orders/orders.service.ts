import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(accountId: number, bookId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account)
      throw new BadRequestException(`Account ${accountId} does not exist`);

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new BadRequestException(`Book ${bookId} does not exist`);

    const order = await this.prisma.order.create({
      data: { accountId, bookId },
      include: { account: true, book: true },
    });

    // Invalidate relevant caches
    await this.cacheService.delete('orders:all');
    await this.cacheService.delete(`orders:account:${accountId}`);
    await this.cacheService.delete(`orders:book:${bookId}`);

    return order;
  }

  async findAll({
    status,
    accountId,
    bookId,
    skip = 0,
    take = 20,
  }: {
    status?: OrderStatus;
    accountId?: number;
    bookId?: number;
    skip?: number;
    take?: number;
  }) {
    const cacheKey = `orders:all:${status || 'all'}:${accountId || 'all'}:${
      bookId || 'all'
    }:${skip}:${take}`;

    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const orders = await this.prisma.order.findMany({
      where: { status, accountId, bookId },
      include: { book: true, account: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheService.set(cacheKey, orders, 60_000 * 5); // 5 min cache
    return orders;
  }

  async findOne(id: number) {
    const cacheKey = `order:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { book: true, account: true },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);

    await this.cacheService.set(cacheKey, order, 60_000 * 5);
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.findOne(id); // ensures existence

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { book: true, account: true },
    });

    // Invalidate caches
    await this.cacheService.delete(`order:${id}`);
    await this.cacheService.delete('orders:all');

    return updated;
  }

  async remove(id: number) {
    const deleted = await this.prisma.order.delete({
      where: { id },
      include: { book: true, account: true },
    });

    // Invalidate caches
    await this.cacheService.delete(`order:${id}`);
    await this.cacheService.delete('orders:all');

    return deleted;
  }
}
