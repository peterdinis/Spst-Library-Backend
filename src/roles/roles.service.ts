import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangeUserRoleDto } from './dto/change.user.role.dto';
import { CreateRoleDto } from './dto/create.role.dto';
import { UpdateRoleDto } from './dto/update.role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
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
    return this.prisma.role.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }

  async changeUserRole(dto: ChangeUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User with ID ${dto.userId} not found`);

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: dto.role },
    });
  }
}
