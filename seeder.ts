import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from 'apps/library-backend-app/src/app.module';
import { Author, AuthorDocument } from 'apps/authors/src/models/author.model';
import { Category, CategoryDocument } from 'apps/categories/src/model/category.model';
import { Book, BookDocument } from 'apps/books/src/model/book.model';
import { AuthorSuggestion, AuthorSuggestionDocument, SuggestionStatus } from 'apps/author-suggestion/src/model/author-suggestion.model';
import { Order, OrderDocument } from 'apps/orders/src/model/orders.model';
import { Rating, RatingDocument } from 'apps/ratings/src/model/rating.model';
import { OrderItem, OrderItemDocument } from 'apps/orders/src/model/order-item.model';
import { OrderStatus } from 'apps/orders/src/types/order-status.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authorModel = app.get<Model<AuthorDocument>>(getModelToken(Author.name));
  const categoryModel = app.get<Model<CategoryDocument>>(getModelToken(Category.name));
  const bookModel = app.get<Model<BookDocument>>(getModelToken(Book.name));
  const ratingModel = app.get<Model<RatingDocument>>(getModelToken(Rating.name));
  const orderModel = app.get<Model<OrderDocument>>(getModelToken(Order.name));
  const orderItemModel = app.get<Model<OrderItemDocument>>(getModelToken(OrderItem.name));
  const authorSuggestionModel = app.get<Model<AuthorSuggestionDocument>>(getModelToken(AuthorSuggestion.name));

  // Vyčisti všetky kolekcie
  await Promise.all([
    authorModel.deleteMany({}),
    categoryModel.deleteMany({}),
    bookModel.deleteMany({}),
    ratingModel.deleteMany({}),
    orderModel.deleteMany({}),
    orderItemModel.deleteMany({}),
    authorSuggestionModel.deleteMany({})
  ]);

  // Authors
  const author1 = await authorModel.create({
    name: 'J. K. Rowling',
    bio: 'Author of Harry Potter',
    litPeriod: 'Contemporary',
    bornDate: '1965',
  });

  const author2 = await authorModel.create({
    name: 'J. R. R. Tolkien',
    bio: 'Author of The Lord of the Rings',
    litPeriod: 'Modern',
    bornDate: '1892',
    deathDate: '1973'
  });

  // Categories
  const category1 = await categoryModel.create({
    name: 'Fantasy',
    description: 'Fantasy books',
  });

  const category2 = await categoryModel.create({
    name: 'Adventure',
    description: 'Adventure books',
  });

  // Books
  const book1 = await bookModel.create({
    name: 'Harry Potter and the Philosopher\'s Stone',
    year: 1997,
    isAvailable: true,
    authorId: author1._id,
    categoryId: category1._id,
  });

  const book2 = await bookModel.create({
    name: 'The Hobbit',
    year: 1937,
    isAvailable: true,
    authorId: author2._id,
    categoryId: category2._id,
  });

  // Ratings
  await ratingModel.create({
    bookId: book1._id,
    value: 5,
    comment: 'Amazing book!'
  });

  await ratingModel.create({
    bookId: book2._id,
    value: 4,
    comment: 'Classic story'
  });

  // Orders
  const order1 = await orderModel.create({
    userId: 'user123',
    status: OrderStatus.PENDING,
  });

  const order2 = await orderModel.create({
    userId: 'user456',
    status: OrderStatus.COMPLETED,
  });

  // OrderItems
  await orderItemModel.create({
    orderId: order1._id,
    bookId: book1._id,
    quantity: 2,
  });

  await orderItemModel.create({
    orderId: order2._id,
    bookId: book2._id,
    quantity: 1,
  });

  // AuthorSuggestions
  await authorSuggestionModel.create({
    name: 'George R. R. Martin',
    bio: 'Author of A Song of Ice and Fire',
    litPeriod: 'Contemporary',
    bornDate: '1948',
    suggestedByName: 'admin',
    status: SuggestionStatus.PENDING,
  });

  console.log('✅ Database seeding finished!');
  await app.close();
}

bootstrap();
