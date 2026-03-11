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

  it('findOne by key', async () => {
    const key = '317e316466a629c8dacd4aa81f39c930';

    const user = await getService().findOne({
      query: {
        key,
      },
      detailed: true,
    });
    expect(user.apiKey).toBe(key);
  });
});
