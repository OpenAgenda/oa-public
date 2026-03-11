import { setupService } from './setup.js';

const { getService } = setupService();

describe('remove', () => {
  it('remove a user', async () => {
    await getService().remove(17133001, { removed: null, detailed: true });

    const modifiedUser = await getService().get(17133001);

    expect(modifiedUser).toBeNull();

    const removedUser = await getService().get(17133001, {
      removed: null,
      detailed: true,
      internal: true,
    });

    expect(removedUser.email).toBeNull();
    expect(removedUser.store.email).toBe('vincentac@gmail.com');
    expect(removedUser.isRemoved).toBe(true);
  });

  it('remove an inexistent user', async () => {
    const result = await getService().remove(86861664, {
      removed: null,
      detailed: true,
    });

    expect(result).toBeNull();
  });
});
