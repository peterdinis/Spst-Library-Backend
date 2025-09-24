import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';

@Module({
  imports: [PrismaModule],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}
