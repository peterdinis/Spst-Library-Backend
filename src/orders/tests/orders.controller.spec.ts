import { Test, TestingModule } from '@nestjs/testing';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.status.dto';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder: Order = {
    id: 1,
    userId: 1,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ordersServiceMock = {
    createOrder: jest.fn(),
    getOrderById: jest.fn(),
    getOrdersByUser: jest.fn(),
    updateOrderStatus: jest.fn(),
    returnOrder: jest.fn(),
    cancelOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should call service.createOrder and return the order', async () => {
      const dto: CreateOrderDto = { userId: 1, items: [{ bookId: 1, quantity: 1 }] };
      ordersServiceMock.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(dto);
      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('getOrder', () => {
    it('should call service.getOrderById and return the order', async () => {
      ordersServiceMock.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrder('1');
      expect(result).toEqual(mockOrder);
      expect(service.getOrderById).toHaveBeenCalledWith(1);
    });
  });

  describe('getOrdersByUser', () => {
    it('should call service.getOrdersByUser and return orders', async () => {
      ordersServiceMock.getOrdersByUser.mockResolvedValue([mockOrder]);

      const result = await controller.getOrdersByUser('1');
      expect(result).toEqual([mockOrder]);
      expect(service.getOrdersByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateOrderStatus and return the order', async () => {
      const dto: UpdateOrderStatusDto = { orderId: 1, status: OrderStatus.COMPLETED };
      ordersServiceMock.updateOrderStatus.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED });

      const result = await controller.updateStatus(dto);
      expect(result.status).toEqual(OrderStatus.COMPLETED);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(dto);
    });
  });

  describe('returnOrder', () => {
    it('should call service.returnOrder and return the order', async () => {
      ordersServiceMock.returnOrder.mockResolvedValue({ ...mockOrder, status: OrderStatus.PENDING });

      const result = await controller.returnOrder('1');
      expect(result.status).toEqual(OrderStatus.PENDING);
      expect(service.returnOrder).toHaveBeenCalledWith(1);
    });
  });

  describe('cancelOrder', () => {
    it('should call service.cancelOrder and return the order', async () => {
      ordersServiceMock.cancelOrder.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });

      const result = await controller.cancelOrder('1');
      expect(result.status).toEqual(OrderStatus.CANCELLED);
      expect(service.cancelOrder).toHaveBeenCalledWith(1);
    });
  });
});
