import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderStatus } from './types/order-status.enum';
import { Book, BookDocument } from 'apps/books/src/model/book.model';
import { Order, OrderDocument } from './model/orders.model';
import { OrderItem, OrderItemDocument } from './model/order-item.model';
import {
  CreateOrderDto,
  OrderPaginationDto,
  UpdateOrderStatusDto,
} from '@app/dtos';
import { PaginatedOrders } from './types/pagination-result.type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private orderItemModel: Model<OrderItemDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  private async validateBookExists(bookId: string) {
    if (!bookId) {
      throw new BadRequestException('Book ID must be provided');
    }
    const book = await this.bookModel.findById(bookId);
    if (!book)
      throw new NotFoundException(`Book with ID ${bookId} does not exist`);
  }

  private validateOrderItems(items: CreateOrderDto['items']) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const bookIds = new Set<string>();
    for (const item of items) {
      if (!item.bookId) {
        throw new BadRequestException('Book ID must be provided');
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

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    this.validateOrderItems(dto.items);

    for (const item of dto.items) {
      await this.validateBookExists(item.bookId);
    }

    try {
      const orderItems = await this.orderItemModel.insertMany(
        dto.items.map((item) => ({
          bookId: new Types.ObjectId(item.bookId),
          quantity: item.quantity,
        })),
      );

      const order = new this.orderModel({
        userId: dto.userId,
        items: orderItems.map((i) => i._id),
        status: OrderStatus.PENDING,
      });

      return order.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId })
      .populate({ path: 'items', populate: { path: 'bookId' } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOrderById(orderId: string): Promise<Order> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }
    const order = await this.orderModel
      .findById(orderId)
      .populate({ path: 'items', populate: { path: 'bookId' } })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getOrderById(dto.orderId);

    if (!Object.values(OrderStatus).includes(dto.status)) {
      throw new BadRequestException(`Invalid order status: ${dto.status}`);
    }

    this.validateOrderStatusTransition(order.status, dto.status);

    try {
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          dto.orderId,
          { status: dto.status },
          { new: true }, // vráti aktualizovaný dokument
        )
        .populate({ path: 'items', populate: { path: 'bookId' } })
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
      }

      return updatedOrder;
    } catch {
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if ([OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(order.status)) {
      throw new ConflictException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    try {
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          orderId,
          { status: OrderStatus.CANCELLED },
          { new: true },
        )
        .populate({ path: 'items', populate: { path: 'bookId' } })
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return updatedOrder;
    } catch {
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }

  async returnOrder(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatus.COMPLETED) {
      throw new ConflictException(
        `Only completed orders can be returned. Current status: ${order.status}`,
      );
    }

    try {
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          orderId,
          { status: OrderStatus.PENDING },
          { new: true },
        )
        .populate({ path: 'items', populate: { path: 'bookId' } })
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return updatedOrder;
    } catch {
      throw new InternalServerErrorException('Failed to return order');
    }
  }

  async getAllCreatedOrders(
    pagination: OrderPaginationDto,
  ): Promise<PaginatedOrders> {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      dateFrom,
      dateTo,
    } = pagination;

    if (page < 1) throw new BadRequestException('Page must be positive');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (dateFrom || dateTo) query.createdAt = {};
    if (dateFrom) query.createdAt!['$gte'] = new Date(dateFrom);
    if (dateTo) query.createdAt!['$lte'] = new Date(dateTo);

    const total = await this.orderModel.countDocuments(query).exec();
    const data = await this.orderModel
      .find(query)
      .populate({ path: 'items', populate: { path: 'bookId' } })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
