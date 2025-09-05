import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangeUserRoleDto } from './dto/change.user.role.dto';
import { CreateRoleDto } from './dto/create.role.dto';
import { UpdateRoleDto } from './dto/update.role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    // Will throw on unique name violation automatically
    return this.prisma.role.create({ data: { name: dto.name } });
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    // Optional: check existence first for nicer 404 instead of Prisma error
    await this.findOne(id);
    return this.prisma.role.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: number) {
    // Optional: check existence first
    await this.findOne(id);
    return this.prisma.role.delete({ where: { id } });
  }

  async changeUserRole(dto: ChangeUserRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!user)
      throw new NotFoundException(`User with ID ${dto.userId} not found`);

    if (!dto.roleId && !dto.roleName) {
      throw new BadRequestException('Provide either roleId or roleName');
    }

    const role = dto.roleId
      ? await this.prisma.role.findUnique({ where: { id: dto.roleId } })
      : await this.prisma.role.findUnique({ where: { name: dto.roleName! } });

    if (!role) {
      const ident = dto.roleId ? `ID ${dto.roleId}` : `name "${dto.roleName}"`;
      throw new NotFoundException(`Role with ${ident} not found`);
    }

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: { connect: { id: role.id } } },
      include: { role: true },
    });
  }
}
