import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { AccessControlService } from 'src/roles/access-control.service';
import { Role } from 'src/roles/roles'; // your app-level enum (e.g., ADMIN | TEACHER | STUDENT)

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accessControlService: AccessControlService,
  ) {}

  /** Convert your app enum Role to a DB role name string. */
  private roleEnumToName(desired: Role): string {
    return String(desired); // if your enum is a string enum, this is fine
  }

  private async getRoleByNameOrThrow(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw new BadRequestException(`Role "${name}" not found in DB`);
    return role;
  }

  async register(dto: RegisterDto, creatorRole: Role = Role.STUDENT) {
    const desiredAppRole: Role = (dto as any).role ?? Role.STUDENT;

    // Check if the creator is allowed to assign this role
    const allowed = this.accessControlService.isAuthorized({
      currentRole: creatorRole,
      requiredRole: desiredAppRole,
    });
    if (!allowed)
      throw new UnauthorizedException('You cannot assign this role');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const desiredRoleName = this.roleEnumToName(desiredAppRole); // e.g., 'STUDENT'
    const roleRecord = await this.getRoleByNameOrThrow(desiredRoleName);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: { connect: { id: roleRecord.id } },
      },
      include: { role: true },
    });

    return this.generateToken(user.id, user.role.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.role.name);
  }

  async profile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        orders: true,
      },
    });
  }

  private generateToken(userId: number, roleName: string) {
    // Embed a human-readable role name into JWT
    return {
      access_token: this.jwtService.sign({ sub: userId, role: roleName }),
    };
  }
}
