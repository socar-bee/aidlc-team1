export interface JwtConfig {
  secret: string;
  adminExpiresIn: string;
  tableExpiresIn: string;
}

export function jwtConfig(): JwtConfig {
  return {
    secret: process.env.JWT_SECRET!,
    adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN ?? '16h',
    tableExpiresIn: process.env.TABLE_TOKEN_EXPIRES_IN ?? '90d',
  };
}
