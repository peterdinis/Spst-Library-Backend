import { NestFactory } from '@nestjs/core';
import { BookTagModule } from './book-tag.module';

async function bootstrap() {
  const app = await NestFactory.create(BookTagModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
