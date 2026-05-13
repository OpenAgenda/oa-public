import { setupService } from './setup.js';

const { getService } = setupService();

describe('create', () => {
  it('create a user with an already taken email', async () => {
    await expect(
      getService().create({
        fullName: 'Jean-Eude',
        email: 'gaetan@cibul.net',
        password: 'pa**word',
      }),
    ).rejects.toThrow('Already exist');
  });

  it('create an activated user', async () => {
    const user = await getService().create(
      {
        fullName: 'Jean-Eude',
        email: 'jean-eude@oa.com',
        password: 'pa**word',
        isActivated: true,
      },
      { detailed: true },
    );

    expect(user.isActivated).toBe(true);
    expect(user.apiKey).toBeTruthy();
  });

  it('create a user should hash password', async () => {
    const password = 'pa**word';

    const user = await getService().create(
      { fullName: 'Jean-Eude', email: 'jean-eude@oa.com', password },
      { detailed: true, internal: true },
    );

    expect(user.password).not.toBe(password);
  });

  it('does not create a legacy activation token for a new user', async () => {
    const email = 'jean-eude@oa.com';
    const user = await getService().create(
      { fullName: 'Jean-Eude', email, password: 'pa**word' },
      { detailed: true },
    );

    const token = await getService()
      .config.getTokensService()
      .findOne({ query: { email } });
    expect(user.email).toBe(email);
    expect(token).toBeUndefined();
  });

  it('create generate a reply token', async () => {
    const email = 'jean-eude@oa.com';
    const user = await getService().create(
      {
        fullName: 'Jean-Eude',
        email,
        password: 'pa**word',
        isActivated: true,
      },
      { detailed: true, internal: true },
    );

    expect(typeof user.replyToken).toBe('string');
    expect(user.replyToken).toHaveLength(36);
  });
});
