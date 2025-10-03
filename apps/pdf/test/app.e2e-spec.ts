import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PdfModule } from './../src/pdf.module';
import { PdfService } from './../src/pdf.service';

describe('PdfController (e2e)', () => {
  let app: INestApplication;
  const fakeBuffer = Buffer.from('fake-pdf');

  const mockPdfService = {
    generateBooksPdf: jest.fn().mockResolvedValue(fakeBuffer),
    generateAuthorsPdf: jest.fn().mockResolvedValue(fakeBuffer),
    generateCategoriesPdf: jest.fn().mockResolvedValue(fakeBuffer),
    generateOrdersPdf: jest.fn().mockResolvedValue(fakeBuffer),
    generateAllDataPdf: jest.fn().mockResolvedValue(fakeBuffer),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PdfModule],
    })
      .overrideProvider(PdfService)
      .useValue(mockPdfService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  const validEntities = ['books', 'authors', 'categories', 'orders'];

  validEntities.forEach((entity) => {
    it(`GET /pdf/${entity} should return a PDF`, async () => {
      return request(app.getHttpServer())
        .get(`/pdf/${entity}`)
        .expect(200)
        .expect('Content-Type', /application\/pdf/)
        .expect('Content-Disposition', new RegExp(`${entity}.pdf`))
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Buffer);
          expect(Buffer.from(res.body).toString()).toContain('fake-pdf');
        });
    });
  });

  it('GET /pdf/unknown should return 400', async () => {
    return request(app.getHttpServer())
      .get('/pdf/unknown')
      .expect(400)
      .expect('Unknown entity');
  });

  it('GET /pdf/all should return a combined PDF', async () => {
    // Mock the new method in PdfService
    mockPdfService.generateAllDataPdf = jest.fn().mockResolvedValue(fakeBuffer);

    return request(app.getHttpServer())
      .get('/pdf/all')
      .expect(200)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', /all_data.pdf/)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Buffer);
        expect(Buffer.from(res.body).toString()).toContain('fake-pdf');
        expect(mockPdfService.generateAllDataPdf).toHaveBeenCalled();
      });
  });
});
