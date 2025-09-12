import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.status.dto';
import { Order, OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async validateBookExists(bookId: number) {
    if (!bookId || bookId < 1) {
      throw new BadRequestException('Book ID must be a positive number');
    }
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book)
      throw new NotFoundException(`Book with ID ${bookId} does not exist`);
    if (!book.isAvailable)
      throw new ConflictException(`Book "${book.name}" is not available`);
  }

  private async validateOrderExists(orderId: number) {
    if (!orderId || orderId < 1) {
      throw new BadRequestException('Order ID must be a positive number');
    }
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order)
      throw new NotFoundException(`Order with ID ${orderId} does not exist`);
    return order;
  }

  private validateOrderItems(items: CreateOrderDto['items']) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const bookIds = new Set<number>();
    for (const item of items) {
      if (!item.bookId || item.bookId < 1) {
        throw new BadRequestException('Book ID must be a positive number');
      }
      if (!item.quantity || item.quantity < 1) {
        throw new BadRequestException('Item quantity must be at least 1');
      }
      if (bookIds.has(item.bookId)) {
        throw new BadRequestException(
          'Duplicate books are not allowed in the same order',
        );
      }
      bookIds.add(item.bookId);
    }
  }

  private validateOrderStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
  ) {
    if (current === OrderStatus.CANCELLED) {
      throw new ConflictException('Cannot update a cancelled order');
    }
    if (current === OrderStatus.RETURNED && next !== OrderStatus.PENDING) {
      throw new ConflictException(
        'Returned orders can only be reset to PENDING',
      );
    }
  }

  private validateUserId(userId: number) {
    if (!userId || userId < 1) {
      throw new BadRequestException('User ID must be a positive number');
    }
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    this.validateUserId(dto.userId);
    this.validateOrderItems(dto.items);
    
    for (const item of dto.items) {
      await this.validateBookExists(item.bookId);
    }

    try {
      return await this.prisma.order.create({
        data: {
          userId: dto.userId,
          items: {
            create: dto.items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: { include: { book: true } } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    return await this.validateOrderExists(orderId);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    this.validateUserId(userId);

    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.validateOrderExists(dto.orderId);

    if (!Object.values(OrderStatus).includes(dto.status)) {
      throw new BadRequestException('Invalid order status');
    }

    this.validateOrderStatusTransition(order.status, dto.status);

    try {
      return await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: dto.status },
        include: { items: { include: { book: true } } },
      });
    } catch {
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  async returnOrder(orderId: number): Promise<Order> {
    const order = await this.validateOrderExists(orderId);

    if (order.status !== OrderStatus.COMPLETED) {
      throw new ConflictException('Only completed orders can be returned');
    }

    try {
      return await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PENDING },
        include: { items: { include: { book: true } } },
      });
    } catch {
      throw new InternalServerErrorException('Failed to return order');
    }
  }

  async cancelOrder(orderId: number): Promise<Order> {
    await this.validateOrderExists(orderId);

    if (OrderStatus.CANCELLED) {
      throw new ConflictException('Order cannot be cancelled');
    }

    try {
      return await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: { items: { include: { book: true } } },
      });
    } catch {
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }
}
