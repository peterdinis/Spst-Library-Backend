import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from 'apps/books/src/model/book.model';
import { Author, AuthorSchema } from 'apps/authors/src/models/author.model';
import { Category, CategorySchema } from 'apps/categories/src/model/category.model';
import { Order, OrderSchema } from 'apps/orders/src/model/orders.model';
import { OrderItem, OrderItemSchema } from 'apps/orders/src/model/order-item.model';

@Module({
  imports: [DatabaseModule, 
    MongooseModule.forFeature([
      {
        name: Book.name,
        schema: BookSchema 
      },
      {
        name: Author.name,
        schema: AuthorSchema,
      },

      {
        name: Category.name,
        schema: CategorySchema
      },

      {
        name: Order.name,
        schema: OrderSchema
      },

      {
        name: OrderItem.name,
        schema: OrderItemSchema
      }
    ])
  ],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
