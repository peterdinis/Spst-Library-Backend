import { NestFactory } from '@nestjs/core';
import { PdfModule } from './pdf.module';

async function bootstrap() {
  const app = await NestFactory.create(PdfModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
