import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from 'apps/books/src/model/book.model';
import { Author, AuthorDocument } from 'apps/authors/src/models/author.model';
import { Category, CategoryDocument } from 'apps/categories/src/model/category.model';
import { OrderItem, OrderItemDocument } from 'apps/orders/src/model/order-item.model';
import { Order, OrderDocument } from 'apps/orders/src/model/orders.model';

@Injectable()
export class PdfService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
  ) {}

  private async generatePdf(title: string, rows: string[][]): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {});

    doc.fontSize(20).text(title, { underline: true });
    doc.moveDown();

    rows.forEach((row) => {
      row.forEach((line) => doc.fontSize(12).text(line));
      doc.moveDown();
    });

    doc.end();

    return Buffer.concat(chunks);
  }

  async generateBooksPdf(): Promise<Buffer> {
    const books = await this.bookModel.find()
      .populate('author')
      .populate('category')
      .exec();

    const rows = books.map((b) => [
      `Title: ${b.name}`,
      `Year: ${b.year ?? 'N/A'}`,
      `Available: ${b.isAvailable ? 'Yes' : 'No'}`,
    ]);

    return this.generatePdf('Books List', rows);
  }

  async generateAuthorsPdf(): Promise<Buffer> {
    const authors = await this.authorModel.find().exec();

    const rows = authors.map((a) => [
      `Name: ${a.name}`,
      `Bio: ${a.bio ?? 'N/A'}`,
      `Literary Period: ${a.litPeriod ?? 'N/A'}`,
      `Born: ${a.bornDate ?? 'N/A'}`,
      `Died: ${a.deathDate ?? 'N/A'}`,
    ]);

    return this.generatePdf('Authors List', rows);
  }

  async generateCategoriesPdf(): Promise<Buffer> {
    const categories = await this.categoryModel.find().exec();

    const rows = categories.map((c) => [
      `Name: ${c.name}`,
      `Description: ${c.description ?? 'N/A'}`,
    ]);

    return this.generatePdf('Categories List', rows);
  }

  async generateOrdersPdf(): Promise<Buffer> {
    const orders = await this.orderModel.find()
      .populate({
        path: 'items',
        populate: { path: 'bookId' },
      })
      .exec();

    const rows = orders.map((o) => [
      `Order ID: ${o._id}`,
      `Status: ${o.status}`,
      `Items: ${(o.items as unknown as OrderItemDocument[])
        .map((i) => `${(i.bookId as any)?.name ?? 'N/A'} x${i.quantity}`)
        .join(', ')}`,
    ]);

    return this.generatePdf('Orders List', rows);
  }
}
