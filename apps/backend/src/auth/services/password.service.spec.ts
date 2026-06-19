import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('해시는 평문과 다르고 bcrypt 포맷이다', async () => {
    const hash = await service.hash('admin1234');
    expect(hash).not.toBe('admin1234');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('올바른 비밀번호는 compare=true', async () => {
    const hash = await service.hash('admin1234');
    expect(await service.compare('admin1234', hash)).toBe(true);
  });

  it('틀린 비밀번호는 compare=false', async () => {
    const hash = await service.hash('admin1234');
    expect(await service.compare('wrong', hash)).toBe(false);
  });
});
