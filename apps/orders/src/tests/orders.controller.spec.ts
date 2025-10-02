import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@app/dtos';

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
    it('should call ordersService.createOrder and return result', async () => {
      const dto: CreateOrderDto = { userId: '123', items: [] };
      const result = { id: 'order1' };
      service.createOrder.mockResolvedValue(result);

      expect(await controller.createOrder(dto)).toEqual(result);
      expect(service.createOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('getOrder', () => {
    it('should call ordersService.getOrderById and return result', async () => {
      const result = { id: 'order1' };
      service.getOrderById.mockResolvedValue(result);

      expect(await controller.getOrder('order1')).toEqual(result);
      expect(service.getOrderById).toHaveBeenCalledWith('order1');
    });
  });

  describe('getOrdersByUser', () => {
    it('should call ordersService.getOrdersForUser and return result', async () => {
      const result = [{ id: 'order1' }];
      service.getOrdersForUser.mockResolvedValue(result);

      expect(await controller.getOrdersByUser('user1')).toEqual(result);
      expect(service.getOrdersForUser).toHaveBeenCalledWith('user1');
    });
  });

  describe('updateStatus', () => {
    it('should call ordersService.updateOrderStatus and return result', async () => {
      const dto: UpdateOrderStatusDto = { orderId: 'order1', status: 'APPROVED' };
      const result = { success: true };
      service.updateOrderStatus.mockResolvedValue(result);

      expect(await controller.updateStatus(dto)).toEqual(result);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(dto);
    });
  });

  describe('returnOrder', () => {
    it('should call ordersService.returnOrder and return result', async () => {
      const result = { success: true };
      service.returnOrder.mockResolvedValue(result);

      expect(await controller.returnOrder('order1')).toEqual(result);
      expect(service.returnOrder).toHaveBeenCalledWith('order1');
    });
  });

  describe('cancelOrder', () => {
    it('should call ordersService.cancelOrder and return result', async () => {
      const result = { success: true };
      service.cancelOrder.mockResolvedValue(result);

      expect(await controller.cancelOrder('order1')).toEqual(result);
      expect(service.cancelOrder).toHaveBeenCalledWith('order1');
    });
  });

  describe('approveOrder', () => {
    it('should call ordersService.approveOrder and return result', async () => {
      const result = { success: true };
      service.approveOrder.mockResolvedValue(result);

      expect(await controller.approveOrder('order1')).toEqual(result);
      expect(service.approveOrder).toHaveBeenCalledWith('order1');
    });
  });

  describe('declineOrder', () => {
    it('should call ordersService.declineOrder and return result', async () => {
      const result = { success: true };
      service.declineOrder.mockResolvedValue(result);

      expect(await controller.declineOrder('order1')).toEqual(result);
      expect(service.declineOrder).toHaveBeenCalledWith('order1');
    });
  });
});
