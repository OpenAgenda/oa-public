'use strict';

const config = require('../testconfig');
const service = require('./service');

describe('invitations - functional (server): remove an action from an invitation', () => {
  beforeAll(async () => {
    await new Promise((resolve, reject) =>
      service.initAndLoad(config, (err) => {
        if (err) return reject(err);
        resolve();
      }));
  });

  it('remove an action from an invitation that not exists', async () => {
    const result = await service.removeAction(
      { email: 'kevin.bertho@not-found.com' },
      1,
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('invitation.notFound');
  });

  it('remove an action from an invitation', async () => {
    const result = await service.removeAction(
      { email: 'kevin.bertho@gmail.com' },
      1,
    );

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.invitation.data).toStrictEqual({
      nextId: 3,
      actions: [
        {
          id: 2,
          name: 'uneActionBidon',
          params: ['firstParams', { second: 'caca' }],
        },
      ],
    });
  });
});
