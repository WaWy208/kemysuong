jest.mock('../../src/modules/auth/auth.repository', () => ({
  findByEmail: jest.fn(),
  findActiveByEmail: jest.fn(),
  createUser: jest.fn(),
  findById: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('../../src/utils/jwt', () => ({
  signAccessToken: jest.fn(() => 'access-token'),
  signRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(() => ({ sub: 'u1' }))
}));

const bcrypt = require('bcryptjs');
const authRepository = require('../../src/modules/auth/auth.repository');
const authService = require('../../src/modules/auth/auth.service');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects self-register as admin', async () => {
    await expect(
      authService.register({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN'
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('registers customer and returns tokens', async () => {
    authRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    authRepository.createUser.mockResolvedValue({
      _id: 'u1',
      name: 'Customer 1',
      email: 'customer1@example.com',
      role: 'CUSTOMER',
      isActive: true
    });

    const result = await authService.register({
      name: 'Customer 1',
      email: 'customer1@example.com',
      password: 'password123',
      role: 'CUSTOMER'
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.role).toBe('CUSTOMER');
  });
});
