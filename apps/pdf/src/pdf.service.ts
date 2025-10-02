import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Author, AuthorDocument } from "apps/authors/src/models/author.model";
import { Book, BookDocument } from "apps/books/src/model/book.model";
import { Category, CategoryDocument } from "apps/categories/src/model/category.model";
import { OrderItem, OrderItemDocument } from "apps/orders/src/model/order-item.model";
import { Order, OrderDocument } from "apps/orders/src/model/orders.model";
import { Model } from "mongoose";
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)  private orderItemModel: Model<OrderItemDocument>,
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
    const books = await this.bookModel
      .find()
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
    const orders = await this.orderModel
      .find()
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

  /** New function: generate one PDF with all data combined */
  async generateAllDataPdf(): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {});

    // ---- Books ----
    const books = await this.bookModel
      .find()
      .populate('author')
      .populate('category')
      .exec();
    doc.fontSize(24).text('Books', { underline: true });
    doc.moveDown();
    books.forEach((b) => {
      doc.fontSize(12).text(`Title: ${b.name}`);
      doc.text(`Year: ${b.year ?? 'N/A'}`);
      doc.text(`Available: ${b.isAvailable ? 'Yes' : 'No'}`);
      doc.moveDown();
    });

    doc.addPage();

    // ---- Authors ----
    const authors = await this.authorModel.find().exec();
    doc.fontSize(24).text('Authors', { underline: true });
    doc.moveDown();
    authors.forEach((a) => {
      doc.fontSize(12).text(`Name: ${a.name}`);
      doc.text(`Bio: ${a.bio ?? 'N/A'}`);
      doc.text(`Literary Period: ${a.litPeriod ?? 'N/A'}`);
      doc.text(`Born: ${a.bornDate ?? 'N/A'}`);
      doc.text(`Died: ${a.deathDate ?? 'N/A'}`);
      doc.moveDown();
    });

    doc.addPage();

    // ---- Categories ----
    const categories = await this.categoryModel.find().exec();
    doc.fontSize(24).text('Categories', { underline: true });
    doc.moveDown();
    categories.forEach((c) => {
      doc.fontSize(12).text(`Name: ${c.name}`);
      doc.text(`Description: ${c.description ?? 'N/A'}`);
      doc.moveDown();
    });

    doc.addPage();

    // ---- Orders ----
    const orders = await this.orderModel
      .find()
      .populate({
        path: 'items',
        populate: { path: 'bookId' },
      })
      .exec();
    doc.fontSize(24).text('Orders', { underline: true });
    doc.moveDown();
    orders.forEach((o) => {
      doc.fontSize(12).text(`Order ID: ${o._id}`);
      doc.text(`Status: ${o.status}`);
      doc.text(
        `Items: ${(o.items as unknown as OrderItemDocument[])
          .map((i) => `${(i.bookId as any)?.name ?? 'N/A'} x${i.quantity}`)
          .join(', ')}`
      );
      doc.moveDown();
    });

    doc.end();

    return Buffer.concat(chunks);
  }
}
