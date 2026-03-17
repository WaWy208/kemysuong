jest.mock('../../src/modules/users/users.repository', () => ({
  findPublicById: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  updateById: jest.fn(),
  countByRole: jest.fn(),
  countActiveUsers: jest.fn()
}));

const usersRepository = require('../../src/modules/users/users.repository');
const usersService = require('../../src/modules/users/users.service');

describe('users.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns dashboard user stats', async () => {
    usersRepository.countByRole.mockImplementation(async (role) => {
      if (role === 'ADMIN') return 1;
      if (role === 'CUSTOMER') return 30;
      return 0;
    });
    usersRepository.countActiveUsers.mockResolvedValue(28);

    const result = await usersService.memberStats();

    expect(result).toEqual({
      totalAdmins: 1,
      totalCustomers: 30,
      totalActive: 28
    });
  });

  test('prevents admin from changing own role', async () => {
    usersRepository.findById.mockResolvedValue({ _id: 'u1', role: 'ADMIN' });

    await expect(usersService.updateMember('u1', { role: 'CUSTOMER' }, 'u1')).rejects.toMatchObject({
      statusCode: 400
    });
  });
});
