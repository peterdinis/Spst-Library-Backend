import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { PdfController } from '../pdf.controller';
import { PdfService } from '../pdf.service';

describe('PdfController', () => {
  let controller: PdfController;
  let pdfService: jest.Mocked<PdfService>;
  let mockResponse: Partial<Response>;

  const sampleBuffer = Buffer.from('PDF data');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfService,
          useValue: {
            generateBooksPdf: jest.fn().mockResolvedValue(sampleBuffer),
            generateAuthorsPdf: jest.fn().mockResolvedValue(sampleBuffer),
            generateCategoriesPdf: jest.fn().mockResolvedValue(sampleBuffer),
            generateOrdersPdf: jest.fn().mockResolvedValue(sampleBuffer),
          },
        },
      ],
    }).compile();

    controller = module.get<PdfController>(PdfController);
    pdfService = module.get(PdfService);

    mockResponse = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('downloadAllPdf', () => {
    it('should call generateAllDataPdf and return PDF', async () => {
      pdfService.generateAllDataPdf = jest.fn().mockResolvedValue(sampleBuffer);

      await controller.downloadAllPdf(mockResponse as Response);

      expect(pdfService.generateAllDataPdf).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
          'Content-Disposition': expect.stringContaining('all_data.pdf'),
        }),
      );
      expect(mockResponse.send).toHaveBeenCalledWith(sampleBuffer);
    });
  });

  describe('downloadPdf', () => {
    it('should call generateBooksPdf and return PDF', async () => {
      await controller.downloadPdf('books', mockResponse as Response);

      expect(pdfService.generateBooksPdf).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
          'Content-Disposition': expect.stringContaining('books.pdf'),
        }),
      );
      expect(mockResponse.send).toHaveBeenCalledWith(sampleBuffer);
    });

    it('should call generateAuthorsPdf and return PDF', async () => {
      await controller.downloadPdf('authors', mockResponse as Response);

      expect(pdfService.generateAuthorsPdf).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(sampleBuffer);
    });

    it('should call generateCategoriesPdf and return PDF', async () => {
      await controller.downloadPdf('categories', mockResponse as Response);

      expect(pdfService.generateCategoriesPdf).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(sampleBuffer);
    });

    it('should call generateOrdersPdf and return PDF', async () => {
      await controller.downloadPdf('orders', mockResponse as Response);

      expect(pdfService.generateOrdersPdf).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(sampleBuffer);
    });

    it('should return 400 for unknown entity', async () => {
      await controller.downloadPdf('unknown', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Unknown entity');
    });
  });
});
