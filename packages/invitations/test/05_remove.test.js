'use strict';

const config = require('../testconfig');
const service = require('./service');

describe('invitations - functional (server): remove an invitation', () => {
  beforeAll(async () => {
    await new Promise((resolve, reject) =>
      service.initAndLoad(config, (err) => {
        if (err) return reject(err);
        resolve();
      }));
  });

  it('remove an invitation that not exists', async () => {
    const result = await service.remove({
      email: 'kevin.bertho@not-found.com',
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('invitation.notFound');
  });

  it('remove an invitation', async () => {
    const result = await service.remove({ email: 'kevin.bertho@gmail.com' });

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
