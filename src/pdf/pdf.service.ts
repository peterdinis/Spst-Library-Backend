import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PdfService {
  private prisma = new PrismaClient();

  private async generatePdf(title: string, rows: string[][]): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30 });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk: Uint8Array<ArrayBufferLike>) => chunks.push(chunk));
    doc.on("end", () => {});

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
    const books = await this.prisma.book.findMany({
      include: { author: true, category: true },
    });

    const rows = books.map((b) => [
      `Title: ${b.name}`,
      `Author: ${b.author.name}`,
      `Category: ${b.category?.name ?? "N/A"}`,
      `Year: ${b.year ?? "N/A"}`,
      `Available: ${b.isAvailable ? "Yes" : "No"}`,
    ]);

    return this.generatePdf("Books List", rows);
  }

  async generateAuthorsPdf(): Promise<Buffer> {
    const authors = await this.prisma.author.findMany();

    const rows = authors.map((a) => [
      `Name: ${a.name}`,
      `Bio: ${a.bio ?? "N/A"}`,
      `Literary Period: ${a.litPeriod}`,
      `Born: ${a.bornDate}`,
      `Died: ${a.deathDate ?? "N/A"}`,
    ]);

    return this.generatePdf("Authors List", rows);
  }

  async generateCategoriesPdf(): Promise<Buffer> {
    const categories = await this.prisma.category.findMany();

    const rows = categories.map((c) => [
      `Name: ${c.name}`,
      `Description: ${c.description ?? "N/A"}`,
    ]);

    return this.generatePdf("Categories List", rows);
  }

  async generateUsersPdf(): Promise<Buffer> {
    const users = await this.prisma.user.findMany({
      include: { role: true },
    });

    const rows = users.map((u) => [
      `Name: ${u.name}`,
      `Email: ${u.email}`,
      `Role: ${u.role.name}`,
    ]);

    return this.generatePdf("Users List", rows);
  }

  async generateOrdersPdf(): Promise<Buffer> {
    const orders = await this.prisma.order.findMany({
      include: { user: true, items: { include: { book: true } } },
    });

    const rows = orders.map((o) => [
      `Order ID: ${o.id}`,
      `User: ${o.user.name}`,
      `Status: ${o.status}`,
      `Items: ${o.items.map((i) => `${i.book.name} x${i.quantity}`).join(", ")}`,
    ]);

    return this.generatePdf("Orders List", rows);
  }
}
