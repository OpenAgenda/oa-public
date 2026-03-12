import { setupService, kaoreUid } from './setup.js';

const { getService } = setupService();

describe('requestChangeEmail', () => {
  it('basic requestChangeEmail', async () => {
    await getService().requestChangeEmail(kaoreUid, {
      newEmail: 'jean-meaurice@hotmail.fr',
    });

    const internalUser = await getService().get(kaoreUid, { internal: true });

    expect(internalUser.store.newEmail).toBe('jean-meaurice@hotmail.fr');
    expect(internalUser.store.newEmailToken).toHaveLength(32);
  });

  it('attempt to requestChangeEmail with an already taken email', async () => {
    await expect(
      getService().requestChangeEmail(kaoreUid, {
        newEmail: 'romain.lange@gmail.com',
      }),
    ).rejects.toThrow('Already exist');
  });

  it('attempt to requestChangeEmail with a bad email', async () => {
    await expect(
      getService().requestChangeEmail(kaoreUid, {
        newEmail: 'romain.langegmail.com',
      }),
    ).rejects.toMatchObject({
      info: {
        errors: [
          {
            field: 'newEmail',
            code: 'email.invalid',
          },
        ],
      },
    });
  });

  it('attempt to requestChangeEmail with a bad email (ends with ;)', async () => {
    await expect(
      getService().requestChangeEmail(kaoreUid, {
        newEmail: 'romain.lange@gmail.com;',
      }),
    ).rejects.toMatchObject({
      info: {
        errors: [
          {
            field: 'newEmail',
            code: 'email.invalid',
          },
        ],
      },
    });
  });
});
