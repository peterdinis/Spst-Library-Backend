import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  
  let prisma: {
    role: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    // přetypujeme na náš jednoduchý mock typ
    prisma = module.get(PrismaService) as unknown as typeof prisma;
  });

  describe('create', () => {
    it('should create a role', async () => {
      prisma.role.create.mockResolvedValue({ id: 1, name: 'Admin' });
      const result = await service.create({ name: 'Admin' });
      expect(result).toEqual({ id: 1, name: 'Admin' });
      expect(prisma.role.create).toHaveBeenCalledWith({ data: { name: 'Admin' } });
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      prisma.role.findMany.mockResolvedValue([{ id: 1, name: 'Admin' }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1, name: 'Admin' }]);
    });
  });

  describe('findOne', () => {
    it('should return a role if found', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1, name: 'Admin' });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, name: 'Admin' });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.role.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1, name: 'Admin' });
      prisma.role.update.mockResolvedValue({ id: 1, name: 'User' });

      const result = await service.update(1, { name: 'User' });
      expect(result).toEqual({ id: 1, name: 'User' });
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'User' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1, name: 'Admin' });
      prisma.role.delete.mockResolvedValue({ id: 1, name: 'Admin' });

      const result = await service.remove(1);
      expect(result).toEqual({ id: 1, name: 'Admin' });
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('changeUserRole', () => {
    const userId = 10;

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.changeUserRole({ userId, roleId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if neither roleId nor roleName is provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: userId });
      await expect(
        service.changeUserRole({ userId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if role not found by ID', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: userId });
      prisma.role.findUnique.mockResolvedValue(null);
      await expect(
        service.changeUserRole({ userId, roleId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should change user role using roleId', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: userId });
      prisma.role.findUnique.mockResolvedValue({ id: 1, name: 'Admin' });
      prisma.user.update.mockResolvedValue({
        id: userId,
        role: { id: 1, name: 'Admin' },
      });

      const result = await service.changeUserRole({ userId, roleId: 1 });
      expect(result).toEqual({
        id: userId,
        role: { id: 1, name: 'Admin' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: { connect: { id: 1 } } },
        include: { role: true },
      });
    });

    it('should change user role using roleName', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: userId });
      prisma.role.findUnique.mockResolvedValue({ id: 2, name: 'User' });
      prisma.user.update.mockResolvedValue({
        id: userId,
        role: { id: 2, name: 'User' },
      });

      const result = await service.changeUserRole({
        userId,
        roleName: 'User',
      });
      expect(result).toEqual({
        id: userId,
        role: { id: 2, name: 'User' },
      });
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'User' },
      });
    });
  });
});
