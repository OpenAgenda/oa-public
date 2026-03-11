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
});
