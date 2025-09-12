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
import { Role } from 'src/roles/roles';

@Injectable()
export class AuthService {
  private ACCESS_TOKEN_EXPIRY = '15m';
  private REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accessControlService: AccessControlService,
  ) {}

  private roleEnumToName(desired: Role): string {
    return String(desired);
  }

  private async getRoleByNameOrThrow(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw new BadRequestException(`Role "${name}" not found`);
    return role;
  }

  async register(dto: RegisterDto, creatorRole: Role = Role.STUDENT) {
    const desiredAppRole: Role = (dto as any).role ?? Role.STUDENT;

    if (!this.accessControlService.isAuthorized({ currentRole: creatorRole, requiredRole: desiredAppRole })) {
      throw new UnauthorizedException('You cannot assign this role');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const roleRecord = await this.getRoleByNameOrThrow(this.roleEnumToName(desiredAppRole));

    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password: hashedPassword, role: { connect: { id: roleRecord.id } } },
      include: { role: true },
    });

    return this.generateTokens(user.id, user.role.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { role: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.role.name);
  }

  async refreshToken(userId: number, refreshToken: string) {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!tokenRecord || tokenRecord.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.token.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Optionally revoke old token and create a new one
    await this.prisma.token.delete({ where: { id: tokenRecord.id } });

    return this.generateTokens(userId, tokenRecord.user.role.name);
  }

  async revokeTokens(userId: number) {
    await this.prisma.token.deleteMany({ where: { userId } });
  }

  async profile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: { select: { id: true, name: true } }, createdAt: true },
    });
  }

  private async generateTokens(userId: number, roleName: string) {
    const access_token = this.jwtService.sign({ sub: userId, role: roleName }, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
    const refresh_token = this.jwtService.sign({ sub: userId, role: roleName }, { expiresIn: this.REFRESH_TOKEN_EXPIRY });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token in DB
    await this.prisma.token.create({
      data: { userId, refreshToken: refresh_token, expiresAt },
    });

    return { access_token, refresh_token };
  }
}
