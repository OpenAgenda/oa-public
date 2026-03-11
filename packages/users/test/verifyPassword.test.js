import { setupService } from './setup.js';

const { getService } = setupService();

describe('verifyPassword', () => {
  it('check a good password', async () => {
    const validPassword = await getService().verifyPassword('cibulon', {
      query: {
        email: 'gaetan@cibul.net',
      },
    });

    expect(validPassword).toBe(true);
  });
});
