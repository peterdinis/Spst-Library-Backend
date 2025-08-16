import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Role } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new teacher in the system
   * @param name - Full name of the teacher
   * @param username - Unique username
   * @param email - Unique email address
   * @param password - Raw password (will be hashed before saving)
   * @returns Created teacher account (without password)
   */
  async registerTeacher(
    name: string,
    username: string,
    email: string,
    password: string,
  ): Promise<Omit<Account, 'password'>> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await this.prisma.account.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
      },
    });

    // Exclude password from returned object
    const { password: _, ...result } = teacher;
    return result;
  }

  /**
   * Validates a teacher's credentials and returns a signed JWT if valid
   * @param username - teacher's username
   * @param password - Raw password for verification
   * @returns JWT token object { access_token: string }
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const teacher = await this.prisma.account.findUnique({
      where: { username },
    });
    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: teacher.id,
      role: teacher.role,
      username: teacher.username,
    };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  /**
   * Returns the current teacher's profile
   * @param teacherId - The id of the teacher extracted from JWT
   * @returns teacher account without password
   */
  async getProfile(teacherId: number): Promise<Omit<Account, 'password'>> {
    const teacher = await this.prisma.account.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) throw new UnauthorizedException('Teacher not found');

    const { password, ...result } = teacher;
    return result;
  }
}
