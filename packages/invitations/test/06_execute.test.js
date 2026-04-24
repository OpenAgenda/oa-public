import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import * as service from '../service/index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('invitations - functional (server): execute actions of an invitation', () => {
  let knex;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init(
      Object.assign(config, {
        actions: {
          createStakeholder: (executeData, actionParams, cb) =>
            cb(null, 'gugusse created'),
          uneActionBidon: (executeData, actionParams, cb) =>
            cb(null, "bidon d'huile"),
        },
      }),
    );
  });

  afterAll(() => knex?.destroy());

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

  it('execute missing actions of an invitation', async () => {
    await knex.destroy();
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init(
      Object.assign(config, {
        actions: {},
      }),
    );

    const result = await service.execute({
      email: 'kevin.bertho@gmail.com',
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(2);
  });
});
