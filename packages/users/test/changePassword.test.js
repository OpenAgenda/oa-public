import * as crypto from '../utils/crypto.js';
import { setupService, config, getKnex } from './setup.js';

const { getService } = setupService();

describe('changePassword', () => {
  it('change password', async () => {
    const password = 'lab***adudule';

    await getService().changePassword(17133001, {
      password,
    });

    const result = await getKnex()(config.schemas.user)
      .select()
      .first()
      .where({ uid: 17133001 });

    expect(result.password).toBe(crypto.hashPassword(password, result.salt));
  });

  it('change password - validation fail', async () => {
    await expect(
      getService().changePassword(17133001, {
        password: null,
      }),
    ).rejects.toMatchObject({
      errors: [
        {
          field: 'password',
          code: 'required',
        },
      ],
    });
  });

  it('try to change password of an inexistent user', async () => {
    const password = 'lab***adudule';

    const result = await getService().changePassword(78945612, {
      password,
    });

    expect(result).toBeNull();
  });
});
