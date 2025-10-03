import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import {
  CreateNotificationDto,
  CreateOrderNotificationDto,
  ReturnOrderNotificationDto,
} from '@app/dtos';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<NotificationsService>> = {
      create: jest.fn(),
      createOrderNotification: jest.fn(),
      createReturnOrderNotification: jest.fn(),
      findByUser: jest.fn(),
      markAsRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService) as jest.Mocked<NotificationsService>;
  });

  // -------------------- CREATE --------------------
  describe('create', () => {
    it('should call service.create with DTO and return result', async () => {
      const dto: CreateNotificationDto = { userId: '123', message: 'Hello', type: 'info' };
      const result = { id: 'abc', ...dto };

      service.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  // -------------------- CREATE ORDER --------------------
  describe('createOrder', () => {
    it('should call service.createOrderNotification with DTO and return result', async () => {
      const dto: CreateOrderNotificationDto = { userEmail: 'a@test.com', message: 'Order created', type: 'order' };
      const result = { id: 'order1', ...dto };

      service.createOrderNotification.mockResolvedValue(result);

      expect(await controller.createOrder(dto)).toEqual(result);
      expect(service.createOrderNotification).toHaveBeenCalledWith(dto);
    });
  });

  // -------------------- CREATE RETURN ORDER --------------------
  describe('createReturnOrder', () => {
    it('should call service.createReturnOrderNotification with DTO and return result', async () => {
      const dto: ReturnOrderNotificationDto = { userEmail: 'b@test.com', message: 'Return initiated', type: 'return' };
      const result = { id: 'return1', ...dto };

      service.createReturnOrderNotification.mockResolvedValue(result);

      expect(await controller.createReturnOrder(dto)).toEqual(result);
      expect(service.createReturnOrderNotification).toHaveBeenCalledWith(dto);
    });
  });

  // -------------------- FIND BY USER --------------------
  describe('findByUser', () => {
    it('should call service.findByUser and return notifications', async () => {
      const userId = '123';
      const result = [{ id: '1', userId, message: 'Hello', type: 'info' }];

      service.findByUser.mockResolvedValue(result);

      expect(await controller.findByUser(userId)).toEqual(result);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  // -------------------- MARK AS READ --------------------
  describe('markAsRead', () => {
    it('should call service.markAsRead and return updated notification', async () => {
      const id = '507f191e810c19729de860ea';
      const result = { id, isRead: true };

      service.markAsRead.mockResolvedValue(result);

      expect(await controller.markAsRead(id)).toEqual(result);
      expect(service.markAsRead).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if notification not found', async () => {
      const id = '507f191e810c19729de860ea';
      service.markAsRead.mockRejectedValue(new NotFoundException());

      await expect(controller.markAsRead(id)).rejects.toThrow(NotFoundException);
    });
  });
});
