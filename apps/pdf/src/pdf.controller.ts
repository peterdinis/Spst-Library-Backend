import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import express from 'express';
import { PdfService } from './pdf.service';

@ApiTags('PDF')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':entity')
  @ApiOperation({ summary: 'Download PDF for a given entity' })
  @ApiParam({
    name: 'entity',
    description: 'The entity to generate PDF for',
    enum: ['books', 'authors', 'categories', 'users', 'orders'],
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file returned successfully',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 400, description: 'Unknown entity' })
  async downloadPdf(@Param('entity') entity: string, @Res() res: express.Response) {
    let pdfBuffer: Buffer;

    switch (entity) {
      case 'books':
        pdfBuffer = await this.pdfService.generateBooksPdf();
        break;
      case 'authors':
        pdfBuffer = await this.pdfService.generateAuthorsPdf();
        break;
      case 'categories':
        pdfBuffer = await this.pdfService.generateCategoriesPdf();
        break;
      case 'orders':
        pdfBuffer = await this.pdfService.generateOrdersPdf();
        break;
      default:
        res.status(400).send('Unknown entity');
        return;
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${entity}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
