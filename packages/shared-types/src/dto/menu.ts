export interface Menu {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateMenuRequest {
  categoryId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateMenuRequest {
  categoryId?: number;
  name?: string;
  price?: number;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReorderMenusRequest {
  categoryId: number;
  orderedIds: number[];
}

export interface UploadImageResponse {
  url: string;
  filename: string;
}
