import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, Order } from '@prisma/client';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.status.dto';
import { OrdersService } from '../orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockBook = { id: 1, name: 'Book 1', isAvailable: true };
  const mockOrder: Order = {
    id: 1,
    userId: 1,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    book: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        items: [{ bookId: 1, quantity: 2 }],
      };
      prismaMock.book.findUnique.mockResolvedValue(mockBook);
      prismaMock.order.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(dto);
      expect(result).toEqual(mockOrder);
      expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.order.create).toHaveBeenCalled();
    });

    it('should throw if book is not available', async () => {
      prismaMock.book.findUnique.mockResolvedValue({
        ...mockBook,
        isAvailable: false,
      });
      const dto: CreateOrderDto = {
        userId: 1,
        items: [{ bookId: 1, quantity: 2 }],
      };
      await expect(service.createOrder(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw if duplicate book in order', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        items: [
          { bookId: 1, quantity: 1 },
          { bookId: 1, quantity: 2 },
        ],
      };
      await expect(service.createOrder(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOrderById', () => {
    it('should return the order', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      const result = await service.getOrderById(1);
      expect(result).toEqual(mockOrder);
      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw if order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      await expect(service.getOrderById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders for a user', async () => {
      prismaMock.order.findMany.mockResolvedValue([mockOrder]);
      const result = await service.getOrdersByUser(1);
      expect(result).toEqual([mockOrder]);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { items: { include: { book: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw if userId invalid', async () => {
      await expect(service.getOrdersByUser(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const dto: UpdateOrderStatusDto = {
        orderId: 1,
        status: OrderStatus.COMPLETED,
      };
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });

      const result = await service.updateOrderStatus(dto);
      expect(result.status).toEqual(OrderStatus.COMPLETED);
    });

    it('should throw if invalid status', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      const dto: any = { orderId: 1, status: 'INVALID' };
      await expect(service.updateOrderStatus(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if updating a cancelled order', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });
      const dto: UpdateOrderStatusDto = {
        orderId: 1,
        status: OrderStatus.COMPLETED,
      };
      await expect(service.updateOrderStatus(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('returnOrder', () => {
    it('should reset a completed order to pending', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });

      const result = await service.returnOrder(1);
      expect(result.status).toEqual(OrderStatus.PENDING);
    });

    it('should throw if order is not completed', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      await expect(service.returnOrder(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancelOrder(1);
      expect(result.status).toEqual(OrderStatus.CANCELLED);
    });
  });
});
