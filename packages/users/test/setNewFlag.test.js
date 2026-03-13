import { setupService } from './setup.js';

const { getService } = setupService();

describe('setNewFlag', () => {
  it('set a new flag to true', async () => {
    const user = await getService().get(17133001);

    expect(user.isNew).toBe(true);

    const modifiedUser = await getService().setNewFlag(17133001, {
      isNew: false,
    });

    expect(modifiedUser.isNew).toBe(false);
  });
});
