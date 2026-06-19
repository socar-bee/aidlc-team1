export interface Category {
  id: number;
  storeId: number;
  name: string;
  sortOrder: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
}

export interface ReorderCategoriesRequest {
  orderedIds: number[];
}
