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
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} does not exist`);
    }
  }

  private async validateOrderExists(orderId: number) {
    if (!orderId || orderId < 1) {
      throw new BadRequestException('Order ID must be a positive number');
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} does not exist`);
    }
    return order;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    for (const item of dto.items) {
      if (item.quantity < 1) {
        throw new BadRequestException('Item quantity must be at least 1');
      }
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

  async getOrderById(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    if (!userId || userId < 1) {
      throw new BadRequestException('User ID must be a positive number');
    }

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

    if (order.status === 'CANCELLED') {
      throw new ConflictException('Cannot update a cancelled order');
    }

    try {
      return this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: dto.status },
        include: { items: { include: { book: true } } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  async returnOrder(orderId: number): Promise<Order> {
    const order = await this.validateOrderExists(orderId);

    if (order.status !== 'COMPLETED') {
      throw new ConflictException('Only completed orders can be returned');
    }

    try {
      return await this.prisma.order.update({
        where: { id: orderId },
        data: { status: "PENDING" },
        include: { items: { include: { book: true } } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to return order');
    }
  }
}
