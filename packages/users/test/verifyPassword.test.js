import { setupService, getConfig, Service } from './setup.js';

const { getService } = setupService();

describe('verifyPassword', () => {
  // testconfig wires no `interfaces.verifyPassword`, so this exercises the
  // environment-level legacy fallback (a deployment without `services.auth`):
  // `gaetan@cibul.net` is seeded with the legacy hash of 'cibulon'.
  it('check a good password (legacy fallback, no BA verifier)', async () => {
    const validPassword = await getService().verifyPassword('cibulon', {
      query: {
        email: 'gaetan@cibul.net',
      },
    });

    expect(validPassword).toBe(true);
  });
});

// With the better-auth verifier wired (the normal API process), `verifyPassword`
// checks `account.password` FIRST, then falls back to the legacy `user.password`
// hash so the few accounts with no credential row are never wrongly rejected.
describe('verifyPassword — better-auth first, legacy fallback', () => {
  const buildService = (verifyPassword) => {
    const conf = getConfig({
      interfaces: { verifyPassword },
    });
    const tokensService = new Service.Tokens({
      Model: conf.Model,
      name: conf.schemas.userToken,
      id: 'id',
      paginate: conf.paginate,
      interfaces: conf.interfaces,
    });
    return new Service({ ...conf, getTokensService: () => tokensService });
  };

  const query = { query: { email: 'gaetan@cibul.net' } };

  it('accepts the current password from better-auth even when the legacy hash is stale', async () => {
    // BA knows the password changed to 'newpass'; the legacy column still has
    // the old 'cibulon' hash. This is the desync bug — must pass via BA.
    const service = buildService((user, password) => password === 'newpass');

    expect(await service.verifyPassword('newpass', query)).toBe(true);
  });

  it('falls back to the legacy hash when better-auth has no match', async () => {
    // BA rejects (e.g. account with no credential row); the legacy column still
    // holds a valid 'cibulon' hash — the fallback must accept it.
    const service = buildService(() => false);

    expect(await service.verifyPassword('cibulon', query)).toBe(true);
  });

  it('rejects when neither better-auth nor the legacy hash matches', async () => {
    const service = buildService((user, password) => password === 'newpass');

    expect(await service.verifyPassword('wrong', query)).toBe(false);
  });
});
