import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from 'src/roles/utils/roles';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: AuthorsService;

  const mockAuthor = {
    id: 1,
    name: 'John Doe',
    bornDate: new Date('1980-01-01'),
    books: [],
    createdAt: new Date(),
  };

  const mockPaginatedResult = {
    data: [mockAuthor],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAuthor),
            findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
            findOne: jest.fn().mockResolvedValue(mockAuthor),
            update: jest.fn().mockResolvedValue(mockAuthor),
            remove: jest
              .fn()
              .mockResolvedValue({ message: `Author 1 deleted successfully.` }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    service = module.get<AuthorsService>(AuthorsService);
  });

  describe('create', () => {
    it('should call service.create and return the created author', async () => {
      const dto = { name: 'John Doe', bornDate: new Date('1980-01-01') };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return paginated authors', async () => {
      const query = { page: 1, limit: 10, search: 'John' };
      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with parsed ID', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('update', () => {
    it('should call service.update with ID and DTO', async () => {
      const dto = { name: 'Updated Name' };
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('remove', () => {
    it('should call service.remove with ID and return message', async () => {
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: `Author 1 deleted successfully.` });
    });
  });

  // Optional: test error forwarding
  it('should propagate service errors', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValueOnce(new NotFoundException('Not found'));
    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
