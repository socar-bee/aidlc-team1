// 단위 테스트용 환경변수 (JwtTokenService 등이 부트 시 참조)
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-0123456789abcdef0123456789abcdef';
process.env.JWT_ADMIN_EXPIRES_IN = process.env.JWT_ADMIN_EXPIRES_IN ?? '16h';
process.env.TABLE_TOKEN_EXPIRES_IN = process.env.TABLE_TOKEN_EXPIRES_IN ?? '90d';
