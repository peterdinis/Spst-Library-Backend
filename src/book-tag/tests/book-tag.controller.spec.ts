import { Test, TestingModule } from '@nestjs/testing';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BookTagController', () => {
  let controller: BookTagController;
  let service: BookTagService;

  const mockTag = { id: 1, name: 'Fiction' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookTagController],
      providers: [
        {
          provide: BookTagService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTag),
            findAll: jest.fn().mockResolvedValue([mockTag]),
            findOne: jest.fn().mockResolvedValue(mockTag),
            update: jest.fn().mockResolvedValue({ ...mockTag, name: 'Sci-Fi' }),
            remove: jest.fn().mockResolvedValue({ message: 'Tag 1 deleted' }),
            search: jest.fn().mockResolvedValue([mockTag]),
          },
        },
      ],
    }).compile();

    controller = module.get<BookTagController>(BookTagController);
    service = module.get<BookTagService>(BookTagService);
  });

  describe('create', () => {
    it('should call service.create and return the tag', async () => {
      const result = await controller.create('Fiction');
      expect(service.create).toHaveBeenCalledWith('Fiction');
      expect(result).toEqual(mockTag);
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTag]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with number ID', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTag);
    });
  });

  describe('update', () => {
    it('should call service.update with number ID and name', async () => {
      const result = await controller.update('1', 'Sci-Fi');
      expect(service.update).toHaveBeenCalledWith(1, 'Sci-Fi');
      expect(result).toEqual({ ...mockTag, name: 'Sci-Fi' });
    });
  });

  describe('remove', () => {
    it('should call service.remove with number ID', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Tag 1 deleted' });
    });
  });

  describe('search', () => {
    it('should call service.search with query string', async () => {
      const result = await controller.search('Fic');
      expect(service.search).toHaveBeenCalledWith('Fic');
      expect(result).toEqual([mockTag]);
    });

    it('should propagate service errors', async () => {
      jest.spyOn(service, 'search').mockRejectedValueOnce(new BadRequestException());
      await expect(controller.search('')).rejects.toThrow(BadRequestException);
    });
  });
});
