import config from '../testconfig.js';
import * as service from './service/index.js';

describe('invitations - functional (server): execute actions of an invitation', () => {
  beforeAll(
    () =>
      new Promise((resolve, reject) =>
        service.initAndLoad(
          Object.assign(config, {
            actions: {
              createStakeholder: (executeData, actionParams, cb) =>
                cb(null, 'gugusse created'),
              uneActionBidon: (executeData, actionParams, cb) =>
                cb(null, "bidon d'huile"),
            },
          }),
          (err) => {
            if (err) return reject(err);
            resolve();
          },
        )),
  );

  it('execute actions of an invitation that not exists', async () => {
    const result = await service.execute({
      email: 'kevin.bertho@not-found.com',
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('invitation.notFound');
  });

  it('execute actions of an invitation', async () => {
    const result = await service.execute({ email: 'kevin.bertho@gmail.com' });

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.results).toStrictEqual(['gugusse created', "bidon d'huile"]);
  });

  it('execute missing actions of an invitation', async () =>
    new Promise((resolve, reject) => {
      service.initAndLoad(
        Object.assign(config, {
          actions: {},
        }),
        async (err) => {
          if (err) return reject(err);
          const result = await service.execute({
            email: 'kevin.bertho@gmail.com',
          });

          expect(result.success).toBe(false);
          expect(result.errors.length).toBe(2);

          resolve();
        },
      );
    }));
});
