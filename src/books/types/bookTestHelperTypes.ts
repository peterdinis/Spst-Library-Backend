export interface PaginatedResult<T> {
  data: T[];
  meta?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  total?: number;
}

export interface Book {
  id: number;
  name: string;
  authorId: number;
  categoryId?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Author {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}