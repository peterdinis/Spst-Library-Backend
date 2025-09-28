import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BooksModule } from './books.module';

async function bootstrap() {
  const app = await NestFactory.create(BooksModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('SPŠT API Documentation Books')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 5004);
}
bootstrap();
