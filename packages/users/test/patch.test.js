import { setupService, kaoreUid } from './setup.js';

const { getService } = setupService();

describe('patch', () => {
  it('patch language of a user', async () => {
    const result = await getService().patch(kaoreUid, { culture: 'is' });

    expect(result.culture).toBe('is');
  });

  it('patch user with a too long language', async () => {
    await expect(
      getService().patch(kaoreUid, { culture: 'francaisDeFrânce' }),
    ).rejects.toMatchObject({
      info: {
        errors: [
          {
            field: 'culture',
            code: 'string.toolong',
          },
        ],
      },
    });
  });

  it('activating a user creates its token', async () => {
    const user = await getService().patch(
      38157927,
      { isActivated: true },
      { internal: true },
    );

    await expect(user.isActivated).toBe(true);
    await expect(user.apiKey).toBeTruthy();
  });
});
