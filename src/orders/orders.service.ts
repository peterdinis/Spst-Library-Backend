import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Service responsible for managing orders.
 * Provides methods for creating, retrieving, updating, and deleting orders.
 */
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new order for a given account and book.
   * Validates that both account and book exist.
   * @param accountId - The ID of the account placing the order
   * @param bookId - The ID of the book being ordered
   * @throws BadRequestException if account or book does not exist
   * @returns The created order
   */
  async create(accountId: number, bookId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account)
      throw new BadRequestException(`Account ${accountId} does not exist`);

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new BadRequestException(`Book ${bookId} does not exist`);

    return this.prisma.order.create({
      data: { accountId, bookId },
      include: { account: true, book: true },
    });
  }

  /**
   * Retrieve all orders with optional filtering and pagination.
   * @param status - Filter by order status
   * @param accountId - Filter by account ID
   * @param bookId - Filter by book ID
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns A list of orders with pagination
   */
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
    return this.prisma.order.findMany({
      where: {
        status,
        accountId,
        bookId,
      },
      include: { book: true, account: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieve a single order by ID.
   * @param id - The order ID
   * @throws NotFoundException if the order is not found
   * @returns The found order
   */
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { book: true, account: true },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  /**
   * Update the status of an order.
   * @param id - The order ID
   * @param status - The new status (e.g., APPROVED, REJECTED, RETURNED)
   * @throws NotFoundException if the order does not exist
   * @returns The updated order
   */
  async updateStatus(id: number, status: OrderStatus) {
    await this.findOne(id); // ensures existence, throws if not found
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { book: true, account: true },
    });
  }

  /**
   * Delete an order by ID.
   * @param id - The order ID
   * @throws NotFoundException if the order does not exist
   * @returns The deleted order
   */
  async remove(id: number) {
    await this.findOne(id); // ensures existence
    return this.prisma.order.delete({
      where: { id },
      include: { book: true, account: true },
    });
  }
}
