import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from '../notifications.service';
import { MessagesService } from 'libs/messages/messages.service';
import { NotificationDocument } from '../types/NotificationTypes';
import { Notification } from '../model/notification.model';
import {
  CreateNotificationDto,
  CreateOrderNotificationDto,
  ReturnOrderNotificationDto,
} from '@app/dtos';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

type MockModel<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  find: jest.Mock<{ sort: (arg: object) => Promise<Partial<T>[]> }, [object]>;
  findByIdAndUpdate: jest.Mock<
    Promise<Partial<T> | null>,
    [string, Partial<T>, object]
  >;
};

const createMockNotificationModel = (): MockModel<NotificationDocument> => ({
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockModel: MockModel<NotificationDocument>;
  let messagesService: MessagesService;

  beforeEach(async () => {
    mockModel = createMockNotificationModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getModelToken(Notification.name), useValue: mockModel },
        { provide: MessagesService, useValue: { sendKafkaMessage: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    messagesService = module.get<MessagesService>(MessagesService);
  });

  // -------------------- CREATE --------------------
  describe('create', () => {
    it('should throw BadRequestException if userId or message missing', async () => {
      const dto: CreateNotificationDto = {
        userId: '',
        message: '',
        type: 'info',
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create and return a notification', async () => {
      const dto: CreateNotificationDto = {
        userId: '123',
        message: 'Hello',
        type: 'info',
      };
      const mockSaved: Partial<NotificationDocument> = { _id: 'abc', ...dto };

      const saveMock = jest.fn().mockResolvedValue(mockSaved);
      mockModel.create.mockReturnValue({
        save: saveMock,
      } as unknown as NotificationDocument);

      const result = await service.create(dto);
      expect(result).toEqual(mockSaved);
      expect(messagesService.sendKafkaMessage).toHaveBeenCalledWith(
        'notification.created',
        expect.objectContaining({
          id: mockSaved._id,
          userId: dto.userId,
          message: dto.message,
          type: dto.type,
        }),
      );
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const dto: CreateNotificationDto = {
        userId: '123',
        message: 'test',
        type: 'info',
      };
      const saveMock = jest.fn().mockRejectedValue(new Error('fail'));
      mockModel.create.mockReturnValue({
        save: saveMock,
      } as unknown as NotificationDocument);

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // -------------------- CREATE ORDER NOTIFICATION --------------------
  describe('createOrderNotification', () => {
    it('should throw BadRequestException if userEmail or message missing', async () => {
      const dto: CreateOrderNotificationDto = {
        userEmail: '',
        message: '',
        type: 'order',
      };
      await expect(service.createOrderNotification(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create and return order notification', async () => {
      const dto: CreateOrderNotificationDto = {
        userEmail: 'a@test.com',
        message: 'Order created',
        type: 'order',
      };
      const mockSaved: Partial<NotificationDocument> = { _id: 'ord1', ...dto };

      const saveMock = jest.fn().mockResolvedValue(mockSaved);
      mockModel.create.mockReturnValue({
        save: saveMock,
      } as unknown as NotificationDocument);

      const result = await service.createOrderNotification(dto);
      expect(result).toEqual(mockSaved);
      expect(messagesService.sendKafkaMessage).toHaveBeenCalledWith(
        'notification.created',
        expect.objectContaining({
          id: mockSaved._id,
          userEmail: dto.userEmail,
          message: dto.message,
          type: dto.type,
        }),
      );
    });
  });

  // -------------------- CREATE RETURN ORDER NOTIFICATION --------------------
  describe('createReturnOrderNotification', () => {
    it('should throw BadRequestException if userEmail or message missing', async () => {
      const dto: ReturnOrderNotificationDto = {
        userEmail: '',
        message: '',
        type: 'return',
      };
      await expect(service.createReturnOrderNotification(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create and return return order notification', async () => {
      const dto: ReturnOrderNotificationDto = {
        userEmail: 'b@test.com',
        message: 'Return initiated',
        type: 'return',
      };
      const mockSaved: Partial<NotificationDocument> = { _id: 'ret1', ...dto };

      const saveMock = jest.fn().mockResolvedValue(mockSaved);
      mockModel.create.mockReturnValue({
        save: saveMock,
      } as unknown as NotificationDocument);

      const result = await service.createReturnOrderNotification(dto);
      expect(result).toEqual(mockSaved);
      expect(messagesService.sendKafkaMessage).toHaveBeenCalledWith(
        'notification.created',
        expect.objectContaining({
          id: mockSaved._id,
          userEmail: dto.userEmail,
          message: dto.message,
          type: dto.type,
        }),
      );
    });
  });

  // -------------------- FIND BY USER --------------------
  describe('findByUser', () => {
    it('should throw BadRequestException if userId missing', async () => {
      await expect(service.findByUser('')).rejects.toThrow(BadRequestException);
    });

    it('should return notifications', async () => {
      const mockNotifications: Partial<NotificationDocument>[] = [
        { _id: '1', userId: '123', message: 'Hello' },
      ];

      const sortMock = jest.fn().mockResolvedValue(mockNotifications);
      mockModel.find.mockReturnValue({ sort: sortMock } as unknown as {
        sort: (arg: object) => Promise<Partial<NotificationDocument>[]>;
      });

      const result = await service.findByUser('123');
      expect(result).toEqual(mockNotifications);
    });

    it('should throw InternalServerErrorException if query fails', async () => {
      mockModel.find.mockImplementation(() => {
        throw new Error('fail');
      });
      await expect(service.findByUser('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // -------------------- MARK AS READ --------------------
  describe('markAsRead', () => {
    it('should throw BadRequestException if id invalid', async () => {
      await expect(service.markAsRead('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(
        service.markAsRead('507f191e810c19729de860ea'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should mark notification as read', async () => {
      const mockNotif: Partial<NotificationDocument> = {
        _id: '507f191e810c19729de860ea',
        isRead: true,
      };
      mockModel.findByIdAndUpdate.mockResolvedValue(mockNotif);

      const result = await service.markAsRead('507f191e810c19729de860ea');
      expect(result).toEqual(mockNotif);
      expect(messagesService.sendKafkaMessage).toHaveBeenCalledWith(
        'notification.read',
        expect.objectContaining({ id: mockNotif._id, isRead: true }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
      await expect(
        service.markAsRead('507f191e810c19729de860ea'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
