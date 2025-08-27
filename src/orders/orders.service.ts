import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailsService } from 'src/emails/emails.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    await this.cacheManager.del('orders:all');
    await this.cacheManager.del(`orders:account:${accountId}`);
    await this.cacheManager.del(`orders:book:${bookId}`);

    // Send confirmation email
    if (account.email) {
      await this.emailsService.sendOrderConfirmation(account.email, order);
    }

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

    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) return cached;

    const orders = await this.prisma.order.findMany({
      where: { status, accountId, bookId },
      include: { book: true, account: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, orders); // 5 min
    return orders;
  }

  async findOne(id: number) {
    const cacheKey = `order:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { book: true, account: true },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);

    await this.cacheManager.set(cacheKey, order); // 5 min
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
    await this.cacheManager.del(`order:${id}`);
    await this.cacheManager.del('orders:all');

    return updated;
  }

  async remove(id: number) {
    const deleted = await this.prisma.order.delete({
      where: { id },
      include: { book: true, account: true },
    });

    // Invalidate caches
    await this.cacheManager.del(`order:${id}`);
    await this.cacheManager.del('orders:all');

    return deleted;
  }
}
