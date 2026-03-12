import { setupService } from './setup.js';

const { getService } = setupService();

describe('generateApiKey', () => {
  it('generate new api public key', async () => {
    const user = await getService().generateApiKey(17133001, {
      publicKey: true,
      secretKey: true,
      detailed: true,
    });

    expect(user.apiSecret).toBeTruthy();
  });
});
