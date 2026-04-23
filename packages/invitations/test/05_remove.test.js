import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import * as service from '../service/index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('invitations - functional (server): remove an invitation', () => {
  let knex;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init(config);
  });

  afterAll(() => knex?.destroy());

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
