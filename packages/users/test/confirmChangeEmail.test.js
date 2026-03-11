import { setupService, kaoreUid } from './setup.js';

const { getService } = setupService();

describe('confirmChangeEmail', () => {
  it('basic confirmChangeEmail', async () => {
    const user = await getService().confirmChangeEmail(kaoreUid, {
      query: {
        token: 'e4a0f1c97b2f4ca7966f069e7b090c0d',
      },
    });

    const internalUser = await getService().get(kaoreUid, { internal: true });

    expect(user.email).toBe('jean-bernard@gmail.com');
    expect(internalUser.store.newEmail).toBeUndefined();
    expect(internalUser.store.newEmailToken).toBeUndefined();
  });

  it('attempt to change his email for an email taken in the meantime', async () => {
    await expect(
      getService().confirmChangeEmail(17133001, {
        query: {
          token: '87071649646742ee8dce48e4eb1dc0b0',
        },
      }),
    ).rejects.toThrow('Already exist');
  });

  it('attempt to change email with a bad token in the query', async () => {
    await expect(
      getService().confirmChangeEmail(17133001, {
        query: {
          token: '87071649646742ee8dce48e4eb1dccbd',
        },
      }),
    ).rejects.toThrow('Bad token');
  });
});
