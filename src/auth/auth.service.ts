import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role as PrismaRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { AccessControlService } from 'src/roles/access-control.service';
import { Role, toPrismaRole } from 'src/roles/roles';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accessControlService: AccessControlService,
  ) { }

  async register(dto: RegisterDto, creatorRole: Role = Role.STUDENT) {
    // Default to STUDENT if role is not provided
    const desiredRole = dto.role;

    // Check if creator (self-register or admin) can assign this role
    if (
      !this.accessControlService.isAuthorized({
        currentRole: creatorRole,
        requiredRole: desiredRole as unknown as Role,
      })
    ) {
      throw new UnauthorizedException('You cannot assign this role');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: toPrismaRole(desiredRole as unknown as Role),
      },
    });

    return this.generateToken(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.role);
  }

  async profile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        orders: true
      },
    });
  }

  private generateToken(userId: number, role: PrismaRole) {
    return {
      access_token: this.jwtService.sign({ sub: userId, role }),
    };
  }
}
