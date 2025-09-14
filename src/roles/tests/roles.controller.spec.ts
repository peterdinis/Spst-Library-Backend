import { Test, TestingModule } from '@nestjs/testing';
import { ChangeUserRoleDto } from '../dto/change.user.role.dto';
import { CreateRoleDto } from '../dto/create.role.dto';
import { UpdateRoleDto } from '../dto/update.role.dto';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changeUserRole: jest.fn(),
  };

  const mockRole = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoles = [
    mockRole,
    {
      id: 2,
      name: 'User',
      description: 'Regular user role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Admin',
      };

      mockRolesService.create.mockResolvedValue(mockRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRole);
    });

    it('should handle service errors during creation', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Admin',
      };

      const error = new Error('Role already exists');
      mockRolesService.create.mockRejectedValue(error);

      await expect(controller.create(createRoleDto)).rejects.toThrow(error);
      expect(service.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoles);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors when finding all roles', async () => {
      const error = new Error('Database connection failed');
      mockRolesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single role by id', async () => {
      const roleId = 1;
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(roleId);

      expect(service.findOne).toHaveBeenCalledWith(roleId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRole);
    });

    it('should handle service errors when role not found', async () => {
      const roleId = 999;
      const error = new Error('Role not found');
      mockRolesService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(roleId)).rejects.toThrow(error);
      expect(service.findOne).toHaveBeenCalledWith(roleId);
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDto = {
        name: 'Super Admin',
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedRole);
    });

    it('should handle partial updates', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDto = {
        name: 'Super Admin',
      };

      const updatedRole = { ...mockRole, name: 'Super Admin' };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });

    it('should handle service errors during update', async () => {
      const roleId = 999;
      const updateRoleDto: UpdateRoleDto = {
        name: 'Super Admin',
      };

      const error = new Error('Role not found');
      mockRolesService.update.mockRejectedValue(error);

      await expect(controller.update(roleId, updateRoleDto)).rejects.toThrow(error);
      expect(service.update).toHaveBeenCalledWith(roleId, updateRoleDto);
    });
  });

  describe('remove', () => {
    it('should remove a role successfully', async () => {
      const roleId = 1;
      const deleteResult = { message: 'Role deleted successfully' };
      mockRolesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(roleId);

      expect(service.remove).toHaveBeenCalledWith(roleId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResult);
    });

    it('should handle service errors when removing role', async () => {
      const roleId = 999;
      const error = new Error('Role not found');
      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(roleId);
    });

    it('should handle errors when role cannot be deleted due to constraints', async () => {
      const roleId = 1;
      const error = new Error('Cannot delete role - users are still assigned to this role');
      mockRolesService.remove.mockRejectedValue(error);

      await expect(controller.remove(roleId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(roleId);
    });
  });

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const changeUserRoleDto: ChangeUserRoleDto = {
        userId: 1,
        roleId: 2,
      };

      const result = {
        message: 'User role changed successfully',
        userId: 1,
        newRoleId: 2,
      };

      mockRolesService.changeUserRole.mockResolvedValue(result);

      const response = await controller.changeUserRole(changeUserRoleDto);

      expect(service.changeUserRole).toHaveBeenCalledWith(changeUserRoleDto);
      expect(service.changeUserRole).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });

    it('should handle service errors when changing user role', async () => {
      const changeUserRoleDto: ChangeUserRoleDto = {
        userId: 999,
        roleId: 999,
      };

      const error = new Error('User or role not found');
      mockRolesService.changeUserRole.mockRejectedValue(error);

      await expect(controller.changeUserRole(changeUserRoleDto)).rejects.toThrow(error);
      expect(service.changeUserRole).toHaveBeenCalledWith(changeUserRoleDto);
    });

    it('should handle invalid user role assignment', async () => {
      const changeUserRoleDto: ChangeUserRoleDto = {
        userId: 1,
        roleId: -1,
      };

      const error = new Error('Invalid role ID');
      mockRolesService.changeUserRole.mockRejectedValue(error);

      await expect(controller.changeUserRole(changeUserRoleDto)).rejects.toThrow(error);
      expect(service.changeUserRole).toHaveBeenCalledWith(changeUserRoleDto);
    });
  });

  describe('service dependency', () => {
    it('should have roles service injected', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(Object);
    });
  });
});