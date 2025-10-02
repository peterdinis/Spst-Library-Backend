import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Types } from 'mongoose';
import { RatingsModule } from './../src/ratings.module';
import { RatingService } from '../src/ratings.service';
import { faker } from '@faker-js/faker';
import { CreateRatingDto, UpdateRatingDto } from '@app/dtos';

describe('RatingsController (E2E)', () => {
  let app: INestApplication;
  let ratingService: RatingService;

  // Mock data
  const ratingId = new Types.ObjectId().toHexString();
  const rating = {
    _id: ratingId,
    bookId: new Types.ObjectId(),
    value: 4,
    comment: 'Great book!',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RatingsModule],
    })
      .overrideProvider(RatingService)
      .useValue({
        findAll: jest.fn().mockResolvedValue({ data: [rating], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        findOne: jest.fn().mockResolvedValue(rating),
        create: jest.fn().mockResolvedValue({ ...rating }),
        update: jest.fn().mockResolvedValue({ ...rating, value: 5 }),
        remove: jest.fn().mockResolvedValue({ message: `Rating ${ratingId} deleted successfully` }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    ratingService = moduleFixture.get<RatingService>(RatingService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  // ------------------- GET /ratings -------------------
  it('GET /ratings should return paginated ratings', async () => {
    return request(app.getHttpServer())
      .get('/ratings')
      .expect(200)
      .expect(res => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.meta).toHaveProperty('total', 1);
      });
  });

  // ------------------- GET /ratings/:id -------------------
  it('GET /ratings/:id should return a rating', async () => {
    return request(app.getHttpServer())
      .get(`/ratings/${ratingId}`)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toEqual(ratingId);
        expect(res.body.value).toEqual(rating.value);
      });
  });

  it('GET /ratings/:id should return 400 for invalid id', async () => {
    return request(app.getHttpServer())
      .get('/ratings/invalid')
      .expect(400);
  });

  // ------------------- POST /ratings -------------------
  it('POST /ratings should create a rating', async () => {
    const dto: CreateRatingDto = {
      bookId: faker.number.int({ min: 1, max: 1000 }),
      value: 5,
      comment: faker.lorem.sentence(),
    };

    return request(app.getHttpServer())
      .post('/ratings')
      .send(dto)
      .expect(201)
      .expect(res => {
        expect(res.body.value).toEqual(dto.value);
        expect(res.body.comment).toEqual(dto.comment);
      });
  });

  it('POST /ratings should return 400 for invalid payload', async () => {
    return request(app.getHttpServer())
      .post('/ratings')
      .send({ bookId: 'invalid', value: 10 })
      .expect(400);
  });

  // ------------------- PATCH /ratings/:id -------------------
  it('PATCH /ratings/:id should update a rating', async () => {
    const dto: UpdateRatingDto = { value: 5 };

    return request(app.getHttpServer())
      .patch(`/ratings/${ratingId}`)
      .send(dto)
      .expect(200)
      .expect(res => {
        expect(res.body.value).toEqual(dto.value);
      });
  });

  it('PATCH /ratings/:id should return 400 for invalid id', async () => {
    return request(app.getHttpServer())
      .patch('/ratings/invalid')
      .send({ value: 5 })
      .expect(400);
  });

  // ------------------- DELETE /ratings/:id -------------------
  it('DELETE /ratings/:id should remove a rating', async () => {
    return request(app.getHttpServer())
      .delete(`/ratings/${ratingId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.message).toEqual(`Rating ${ratingId} deleted successfully`);
      });
  });

  it('DELETE /ratings/:id should return 400 for invalid id', async () => {
    return request(app.getHttpServer())
      .delete('/ratings/invalid')
      .expect(400);
  });
});
