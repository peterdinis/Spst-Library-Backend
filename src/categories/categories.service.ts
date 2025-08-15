import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindAllCategoriesDto } from './dto/find-all-categories.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category.
   * @param {CreateCategoryDto} data - The category creation payload.
   * @returns {Promise<Category>} The newly created category.
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  /**
   * Retrieve all categories with optional pagination and search.
   * @param {FindAllCategoriesDto} params - The pagination and search parameters.
   * @param {number} [params.skip=0] - Number of records to skip.
   * @param {number} [params.take=10] - Number of records to retrieve.
   * @param {string} [params.search] - Search term for category name.
   * @returns {Promise<{ data: Category[]; total: number }>} A list of categories and the total count.
   */
  async findAll(params: FindAllCategoriesDto): Promise<{ data: Category[]; total: number }> {
    const { skip = 0, take = 10, search = '' } = params;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({ where, skip, take }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Retrieve a category by its ID.
   * @param {number} id - The category ID.
   * @returns {Promise<Category | null>} The category if found, otherwise null.
   */
  async findOne(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  /**
   * Update a category by its ID.
   * @param {number} id - The category ID.
   * @param {UpdateCategoryDto} data - The update payload.
   * @returns {Promise<Category>} The updated category.
   */
  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  /**
   * Delete a category by its ID.
   * @param {number} id - The category ID.
   * @returns {Promise<Category>} The deleted category.
   */
  async remove(id: number): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}