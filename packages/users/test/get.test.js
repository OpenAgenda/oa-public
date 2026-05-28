import { setupService, kaoreUid, config } from './setup.js';

const { getService } = setupService();

describe('get', () => {
  it('simple get', async () => {
    const user = await getService().get(kaoreUid);

    expect(user.fullName).toBe('Kari Olafsson');
    expect(user).toHaveProperty('hasSocialAccount');
    expect(user).toHaveProperty('hasLocalAccount');
    expect(user).not.toHaveProperty('isRemoved');
    expect(user).not.toHaveProperty('isActivated');
  });

  it('get inexistent user', async () => {
    const user = await getService().get(86861664);

    expect(user).toBeNull();
  });

  it('get user with detailed option', async () => {
    const user = await getService().get(kaoreUid, { detailed: true });

    expect(user).toHaveProperty('isRemoved');
    expect(user).toHaveProperty('isActivated');
    expect(user).toHaveProperty('isBlacklisted');
    expect(user).toHaveProperty('transverseApiAccess');
    expect(user.canCreateSecretKeys).toBe(true);
    expect(user).not.toHaveProperty('store');
  });

  it('get without detailed: canCreateSecretKeys is not exposed', async () => {
    const user = await getService().get(kaoreUid);
    expect(user).not.toHaveProperty('canCreateSecretKeys');
  });

  it('get user with internal option', async () => {
    const user = await getService().get(kaoreUid, { internal: true });

    expect(user).toHaveProperty('replyToken');
  });

  it('get user with removed option at null', async () => {
    const user = await getService().get(9003991, { removed: null });

    expect(user.email).toBe('contact@dedale.info');
    expect(user).not.toHaveProperty('isRemoved');
    expect(user).not.toHaveProperty('isActivated');
  });

  it('get user with includeImagePath', async () => {
    const user = await getService().get(75052324, { includeImagePath: true });

    expect(user.image).toBe(`${config.imagePath}review_kaore-olafsson_01.jpg`);
    expect(user.email).toBe('kaoreolafsson@gmail.com');
  });
});
