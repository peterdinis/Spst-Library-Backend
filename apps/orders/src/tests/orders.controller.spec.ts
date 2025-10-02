import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';
import { CreateOrderDto, CreateOrderItemDto, UpdateOrderStatusDto } from '@app/dtos';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            getOrderById: jest.fn(),
            getOrdersForUser: jest.fn(),
            updateOrderStatus: jest.fn(),
            returnOrder: jest.fn(),
            cancelOrder: jest.fn(),
            approveOrder: jest.fn(),
            declineOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call ordersService.createOrder with valid DTO and return result', async () => {
      const items: CreateOrderItemDto[] = [{ bookId: 'book123', quantity: 2 }];
      const dto: CreateOrderDto = { userId: 'user123', items };
      const result = { id: 'order1', ...dto };
      service.createOrder.mockResolvedValue(result);

      const response = await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('getOrder', () => {
    it('should call ordersService.getOrderById and return result', async () => {
      const result = { id: 'order1' };
      service.getOrderById.mockResolvedValue(result);

      const response = await controller.getOrder('order1');

      expect(service.getOrderById).toHaveBeenCalledWith('order1');
      expect(response).toEqual(result);
    });
  });

  describe('getOrdersByUser', () => {
    it('should call ordersService.getOrdersForUser and return result', async () => {
      const result = [{ id: 'order1' }];
      service.getOrdersForUser.mockResolvedValue(result);

      const response = await controller.getOrdersByUser('user1');

      expect(service.getOrdersForUser).toHaveBeenCalledWith('user1');
      expect(response).toEqual(result);
    });
  });

  describe('updateStatus', () => {
    it('should call ordersService.updateOrderStatus and return result', async () => {
      const dto: UpdateOrderStatusDto = { orderId: 'order1', status: 'APPROVED' };
      const result = { success: true };
      service.updateOrderStatus.mockResolvedValue(result);

      const response = await controller.updateStatus(dto);

      expect(service.updateOrderStatus).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('returnOrder', () => {
    it('should call ordersService.returnOrder and return result', async () => {
      const result = { success: true };
      service.returnOrder.mockResolvedValue(result);

      const response = await controller.returnOrder('order1');

      expect(service.returnOrder).toHaveBeenCalledWith('order1');
      expect(response).toEqual(result);
    });
  });

  describe('cancelOrder', () => {
    it('should call ordersService.cancelOrder and return result', async () => {
      const result = { success: true };
      service.cancelOrder.mockResolvedValue(result);

      const response = await controller.cancelOrder('order1');

      expect(service.cancelOrder).toHaveBeenCalledWith('order1');
      expect(response).toEqual(result);
    });
  });

  describe('approveOrder', () => {
    it('should call ordersService.approveOrder and return result', async () => {
      const result = { success: true };
      service.approveOrder.mockResolvedValue(result);

      const response = await controller.approveOrder('order1');

      expect(service.approveOrder).toHaveBeenCalledWith('order1');
      expect(response).toEqual(result);
    });
  });

  describe('declineOrder', () => {
    it('should call ordersService.declineOrder and return result', async () => {
      const result = { success: true };
      service.declineOrder.mockResolvedValue(result);

      const response = await controller.declineOrder('order1');

      expect(service.declineOrder).toHaveBeenCalledWith('order1');
      expect(response).toEqual(result);
    });
  });
});
