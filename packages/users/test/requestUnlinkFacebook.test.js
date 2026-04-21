import { setupService, kaoreUid } from './setup.js';

const { getService } = setupService();

describe('requestUnlinkFacebook', () => {
  it('stores pending email and hashed password in user.store', async () => {
    await getService().requestUnlinkFacebook(kaoreUid, {
      email: 'kaore-migration@example.com',
      password: 'hunter2!',
    });

    const internalUser = await getService().get(kaoreUid, { internal: true });

    expect(internalUser.store.unlinkFacebookEmail).toBe(
      'kaore-migration@example.com',
    );
    expect(internalUser.store.unlinkFacebookPasswordHash).toHaveLength(64); // sha256 hex
    // The user's current password and facebookUid are left untouched.
    expect(internalUser.facebookUid).toBe('592025090');
    expect(internalUser.password).toBe(
      '752359df2b518e8797b19579c87274b2f292ce37',
    );
    // The token now lives in the user_token table, not in user.store.
    expect(internalUser.store.unlinkFacebookToken).toBeUndefined();
  });

  it('accepts re-submission and updates the pending hashed password', async () => {
    await getService().requestUnlinkFacebook(kaoreUid, {
      email: 'kaore-migration@example.com',
      password: 'hunter2!',
    });

    const first = await getService().get(kaoreUid, { internal: true });
    const firstHash = first.store.unlinkFacebookPasswordHash;

    await getService().requestUnlinkFacebook(kaoreUid, {
      email: 'kaore-migration@example.com',
      password: 'hunter2!-different',
    });

    const second = await getService().get(kaoreUid, { internal: true });

    expect(second.store.unlinkFacebookPasswordHash).toHaveLength(64);
    expect(second.store.unlinkFacebookPasswordHash).not.toBe(firstHash);
  });

  it('accepts the current email and skips the unicity check', async () => {
    await expect(
      getService().requestUnlinkFacebook(kaoreUid, {
        email: 'kaoreolafsson@gmail.com', // the user's own current email
        password: 'hunter2!',
      }),
    ).resolves.toBeTruthy();
  });

  it('rejects when the requested email is already taken by another account', async () => {
    await expect(
      getService().requestUnlinkFacebook(kaoreUid, {
        email: 'romain.lange@gmail.com',
        password: 'hunter2!',
      }),
    ).rejects.toThrow('Already exist');
  });

  it('rejects on an invalid email', async () => {
    await expect(
      getService().requestUnlinkFacebook(kaoreUid, {
        email: 'not-an-email',
        password: 'hunter2!',
      }),
    ).rejects.toMatchObject({
      info: {
        errors: [
          {
            field: 'email',
            code: 'email.invalid',
          },
        ],
      },
    });
  });

  it('rejects on a too-short password', async () => {
    await expect(
      getService().requestUnlinkFacebook(kaoreUid, {
        email: 'kaore-migration@example.com',
        password: 'x',
      }),
    ).rejects.toMatchObject({
      info: {
        errors: [
          {
            field: 'password',
          },
        ],
      },
    });
  });

  it('rejects when the user is not linked to Facebook', async () => {
    // Vincent Audette-Chapdelaine (vincentac@gmail.com) has facebook_uid: null.
    const vincentUid = 17133001;
    await expect(
      getService().requestUnlinkFacebook(vincentUid, {
        email: 'vincent-migration@example.com',
        password: 'hunter2!',
      }),
    ).rejects.toThrow('notFacebookAccount');
  });
});
