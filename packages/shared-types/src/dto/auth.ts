export interface AdminLoginRequest {
  storeCode: string;
  username: string;
  password: string;
}

export interface AdminUserPayload {
  id: number;
  storeId: number;
  username: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AdminUserPayload;
}

export interface TableSetupRequest {
  tableNumber: number;
  password: string;
}

export interface TablePayload {
  tableId: number;
  storeId: number;
  tableNumber: number;
}

export interface TableSetupResponse {
  tableToken: string;
  table: {
    id: number;
    tableNumber: number;
  };
}
