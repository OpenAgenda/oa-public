import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import * as service from '../service/index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('invitations - functional (server): initialization', () => {
  let knex;

  afterAll(() => knex?.destroy());

  it('if the service is not initialized, endpoints will throw an error', () =>
    expect(
      service.assign(
        { email: 'test@gmail.com', token: 'fqfdsqfsdsq' },
        'adminCreate',
        {},
      ),
    ).rejects.toThrow('service not initialized'));

  it('initialize using .init()', () => {
    expect(() => service.init(config)).not.toThrow();
  });

  it('setup loads fixtures via migrations and SQL data files', async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init(config);
  });

  it('setup can be called with no data files', async () => {
    await knex.destroy();
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
    });
    service.init(config);
  });
});
