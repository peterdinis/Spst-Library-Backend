import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './model/orders.model';
import { OrderItem, OrderItemSchema } from './model/order-item.model';
import { Book, BookSchema } from 'apps/books/src/model/book.model';

@Module({
  imports: [DatabaseModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Book.name, schema: BookSchema}
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
