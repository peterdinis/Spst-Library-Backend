import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { NotificationsModule } from './../src/notifications.module';
import { getModelToken } from '@nestjs/mongoose';
import { Notification } from '../src/model/notification.model';
import { Model } from 'mongoose';

// Mock Mongoose model for E2E tests
const mockNotificationModel = {
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let model: Model<Notification>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(getModelToken(Notification.name))
      .useValue(mockNotificationModel)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    model = moduleFixture.get<Model<Notification>>(getModelToken(Notification.name));
  });

  afterAll(async () => {
    await app.close();
  });

  // -------------------- POST /notifications --------------------
  it('POST /notifications - should create generic notification', async () => {
    const dto = { userId: '123', message: 'Hello', type: 'info' };
    const saved = { _id: '1', ...dto };
    mockNotificationModel.create.mockReturnValue({ save: jest.fn().mockResolvedValue(saved) });

    const response = await request(app.getHttpServer())
      .post('/notifications')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual(saved);
  });

  // -------------------- POST /notifications/order --------------------
  it('POST /notifications/order - should create order notification', async () => {
    const dto = { userEmail: 'a@test.com', message: 'Order created', type: 'order' };
    const saved = { _id: '2', ...dto };
    mockNotificationModel.create.mockReturnValue({ save: jest.fn().mockResolvedValue(saved) });

    const response = await request(app.getHttpServer())
      .post('/notifications/order')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual(saved);
  });

  // -------------------- POST /notifications/return-order --------------------
  it('POST /notifications/return-order - should create return order notification', async () => {
    const dto = { userEmail: 'b@test.com', message: 'Return initiated', type: 'return' };
    const saved = { _id: '3', ...dto };
    mockNotificationModel.create.mockReturnValue({ save: jest.fn().mockResolvedValue(saved) });

    const response = await request(app.getHttpServer())
      .post('/notifications/return-order')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual(saved);
  });

  // -------------------- GET /notifications/:userId --------------------
  it('GET /notifications/:userId - should return notifications', async () => {
    const userId = '123';
    const notifications = [{ _id: '1', userId, message: 'Hello', type: 'info' }];
    const sortMock = jest.fn().mockResolvedValue(notifications);
    mockNotificationModel.find.mockReturnValue({ sort: sortMock });

    const response = await request(app.getHttpServer())
      .get(`/notifications/${userId}`)
      .expect(200);

    expect(response.body).toEqual(notifications);
  });

  // -------------------- PATCH /notifications/:id/read --------------------
  it('PATCH /notifications/:id/read - should mark notification as read', async () => {
    const id = '507f191e810c19729de860ea';
    const updated = { _id: id, isRead: true };
    mockNotificationModel.findByIdAndUpdate.mockResolvedValue(updated);

    const response = await request(app.getHttpServer())
      .patch(`/notifications/${id}/read`)
      .expect(200);

    expect(response.body).toEqual(updated);
  });
});
