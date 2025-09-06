import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order.status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({
      data: {
        userId: dto.userId,
        items: {
          create: dto.items.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
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
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { book: true } } },
    });
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: dto.status },
    });
    return order;
  }
}
