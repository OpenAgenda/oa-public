import { setupService } from './setup.js';

const { getService } = setupService();

describe('hook-less methods', () => {
  it('update store manually', async () => {
    const rawUser = await getService()._get(17133001, {
      query: { $select: ['store'] },
    });

    const store = rawUser.store ? JSON.parse(rawUser.store) : {};
    store.registrationCaptchaScore = 0.9;

    const updatedUser = await getService()._patch(17133001, {
      store: JSON.stringify(store),
    });
    const updatedStore = JSON.parse(updatedUser.store);

    expect(updatedStore.registrationCaptchaScore).toBe(0.9);
  });
});
