import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Role } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new student in the system
   * @param name - Full name of the student
   * @param username - Unique username
   * @param email - Unique email address
   * @param password - Raw password (will be hashed before saving)
   * @returns Created student account (without password)
   */
  async registerStudent(
    name: string,
    username: string,
    email: string,
    password: string,
  ): Promise<Omit<Account, 'password'>> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await this.prisma.account.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    // Exclude password from returned object
    const { password: _, ...result } = student;
    return result;
  }

  /**
   * Validates a student's credentials and returns a signed JWT if valid
   * @param username - Student's username
   * @param password - Raw password for verification
   * @returns JWT token object { access_token: string }
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const student = await this.prisma.account.findUnique({
      where: { username },
    });
    if (!student || !(await bcrypt.compare(password, student.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: student.id,
      role: student.role,
      username: student.username,
    };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  /**
   * Returns the current student's profile
   * @param studentId - The id of the student extracted from JWT
   * @returns Student account without password
   */
  async getProfile(studentId: number): Promise<Omit<Account, 'password'>> {
    const student = await this.prisma.account.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new UnauthorizedException('Student not found');

    const { password, ...result } = student;
    return result;
  }

  /**
   * Get all books borrowed by a student
   * @param studentId - The id of the student
   * @returns Array of borrowed books with order info
   */
  async getBorrowedBooks(studentId: number) {
    const borrowed = await this.prisma.order.findMany({
      where: {
        accountId: studentId,
        status: {
          in: ['APPROVED', 'RETURNED'],
        },
      },
      include: {
        book: true,
      },
    });

    return borrowed.map((order) => ({
      orderId: order.id,
      status: order.status,
      borrowedAt: order.createdAt,
      book: {
        id: order.book.id,
        title: order.book.title,
        authorId: order.book.authorId,
        categoryId: order.book.categoryId,
        publisherName: order.book.publisherName,
        isbn: order.book.isbn,
        coverImageUrl: order.book.coverImageUrl,
        isBorrowed: order.book.isBorrowed,
        publishedYear: order.book.publishedYear,
        language: order.book.language,
      },
    }));
  }

  /**
   * Updates a student's profile
   * @param studentId - Student ID from JWT
   * @param data - Fields to update (name, lastName, classRoom, email, etc.)
   * @returns Updated student account without password
   */
  async updateProfile(
    studentId: number,
    data: Partial<Pick<Account, 'name' | 'lastName' | 'classRoom' | 'email'>>,
  ): Promise<Omit<Account, 'password'>> {
    const updated = await this.prisma.account.update({
      where: { id: studentId },
      data,
    });

    const { password, ...result } = updated;
    return result;
  }
}
