import { Test, TestingModule } from '@nestjs/testing';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

describe('PdfController', () => {
  let pdfController: PdfController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [PdfService],
    }).compile();

    pdfController = app.get<PdfController>(PdfController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pdfController.getHello()).toBe('Hello World!');
    });
  });
});
