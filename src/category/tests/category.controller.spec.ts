import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';
import { PaginationDto } from '../dto/category-pagination.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategory = { id: 1, name: 'Fiction', description: 'Fiction books', books: [] };
  const mockCategories = [mockCategory];

  const categoryServiceMock = {
    findAll: jest.fn(),
    findAllCached: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: categoryServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll and return categories', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      categoryServiceMock.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll(pagination);
      expect(result).toEqual(mockCategories);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
    });
  });

  describe('findAllCached', () => {
    it('should call service.findAllCached and return categories', async () => {
      categoryServiceMock.findAllCached.mockResolvedValue(mockCategories);

      const result = await controller.findAllCached();
      expect(result).toEqual(mockCategories);
      expect(service.findAllCached).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return a category', async () => {
      categoryServiceMock.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should call service.create and return the created category', async () => {
      const dto: CreateCategoryDto = { name: 'Fiction', description: 'Desc' };
      categoryServiceMock.create.mockResolvedValue(mockCategory);

      const result = await controller.create(dto);
      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call service.update and return the updated category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated', description: 'Updated desc' };
      categoryServiceMock.update.mockResolvedValue({ ...mockCategory, ...dto });

      const result = await controller.update(1, dto);
      expect(result).toEqual({ ...mockCategory, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return a success message', async () => {
      const message = { message: 'Category 1 deleted successfully' };
      categoryServiceMock.remove.mockResolvedValue(message);

      const result = await controller.remove(1);
      expect(result).toEqual(message);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
