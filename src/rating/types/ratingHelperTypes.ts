export interface FindAllResult {
  data: { id: number }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type CacheMock = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  clear: jest.Mock;
};
