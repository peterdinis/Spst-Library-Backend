import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdersModule } from './../src/orders.module';
import { OrdersService } from './../src/orders.service';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderStatusDto,
} from '@app/dtos';
import { OrderStatus } from '../src/types/order-status.enum';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let service: OrdersService;

  const fakeOrderId = 'order123';
  const fakeUserId = 'user123';
  const fakeOrderItem: CreateOrderItemDto = { bookId: 'book123', quantity: 2 };
  const fakeOrderDto: CreateOrderDto = {
    userId: fakeUserId,
    items: [fakeOrderItem],
  };
  const fakeOrderResponse = { id: fakeOrderId, ...fakeOrderDto };

  const mockOrdersService = {
    createOrder: jest.fn().mockResolvedValue(fakeOrderResponse),
    getOrderById: jest.fn().mockResolvedValue(fakeOrderResponse),
    getOrdersForUser: jest.fn().mockResolvedValue([fakeOrderResponse]),
    updateOrderStatus: jest.fn().mockResolvedValue({ success: true }),
    returnOrder: jest.fn().mockResolvedValue({ success: true }),
    cancelOrder: jest.fn().mockResolvedValue({ success: true }),
    approveOrder: jest.fn().mockResolvedValue({ success: true }),
    declineOrder: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(OrdersService)
      .useValue(mockOrdersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<OrdersService>(OrdersService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('POST /orders - should create a new order', async () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send(fakeOrderDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(fakeOrderResponse);
        expect(service.createOrder).toHaveBeenCalledWith(fakeOrderDto);
      });
  });

  it('GET /orders/:id - should return an order by ID', async () => {
    return request(app.getHttpServer())
      .get(`/orders/${fakeOrderId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(fakeOrderResponse);
        expect(service.getOrderById).toHaveBeenCalledWith(fakeOrderId);
      });
  });

  it('GET /orders/user/:userId - should return all orders for a user', async () => {
    return request(app.getHttpServer())
      .get(`/orders/user/${fakeUserId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([fakeOrderResponse]);
        expect(service.getOrdersForUser).toHaveBeenCalledWith(fakeUserId);
      });
  });

  it('PATCH /orders/status - should update order status', async () => {
    const dto: UpdateOrderStatusDto = {
      orderId: fakeOrderId,
      status: OrderStatus.RETURNED,
    };

    return request(app.getHttpServer())
      .patch('/orders/status')
      .send(dto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true });
        expect(service.updateOrderStatus).toHaveBeenCalledWith(dto);
      });
  });

  it('PATCH /orders/:id/return - should return an order', async () => {
    return request(app.getHttpServer())
      .patch(`/orders/${fakeOrderId}/return`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true });
        expect(service.returnOrder).toHaveBeenCalledWith(fakeOrderId);
      });
  });

  it('PATCH /orders/:id/cancel - should cancel an order', async () => {
    return request(app.getHttpServer())
      .patch(`/orders/${fakeOrderId}/cancel`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true });
        expect(service.cancelOrder).toHaveBeenCalledWith(fakeOrderId);
      });
  });

  it('PATCH /orders/:id/approve - should approve an order', async () => {
    return request(app.getHttpServer())
      .patch(`/orders/${fakeOrderId}/approve`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true });
        expect(service.approveOrder).toHaveBeenCalledWith(fakeOrderId);
      });
  });

  it('PATCH /orders/:id/decline - should decline an order', async () => {
    return request(app.getHttpServer())
      .patch(`/orders/${fakeOrderId}/decline`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true });
        expect(service.declineOrder).toHaveBeenCalledWith(fakeOrderId);
      });
  });
});
