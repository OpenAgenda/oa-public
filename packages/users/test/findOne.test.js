import { setupService } from './setup.js';

const { getService } = setupService();

describe('findOne', () => {
  it('findOne by email', async () => {
    const email = 'romain.lange@gmail.com';

    const user = await getService().findOne({
      query: {
        email,
      },
    });

    expect(user.email).toBe(email);
  });

  it('findOne inexistent email', async () => {
    const user = await getService().findOne({
      query: {
        email: 'inexistent@example.com',
      },
    });

    expect(user).toBeUndefined();
  });
});
