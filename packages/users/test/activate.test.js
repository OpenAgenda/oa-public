import { setupService } from './setup.js';

const { getService } = setupService();

describe('activate', () => {
  it('activates without a token in hand', async () => {
    const user = await getService().activate(
      898928392,
      {},
      { ignoreToken: true },
    );
    expect(user.isActivated).toBe(true);
  });

  it('activate an inexistent user', async () => {
    await expect(
      getService().activate(86861664, {}, { ignoreToken: true }),
    ).rejects.toThrow('not found');
  });
});
