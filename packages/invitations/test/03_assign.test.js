import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import * as service from '../service/index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const actions = {
  setToEnglish: (cb) => cb(true),
};

describe('invitations - functional (server): assign an action to an invitation', () => {
  let knex;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init({ ...config, actions });
  });

  afterAll(() => knex?.destroy());

  it('assigning an action to an inexistent invitation creates it', async () => {
    const result = await service.assign(
      { email: 'kevin.bertho@openagenda.com' },
      'setToEnglish',
    );

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.invitation.data).toStrictEqual({
      nextId: 1,
      actions: [{ id: 1, name: 'setToEnglish', params: [] }],
    });
  });

  it('works with callback too', async () => {
    const result = await service.assign(
      { email: 'kevin@bertho.com' },
      'setToEnglish',
    );

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.invitation.data).toStrictEqual({
      nextId: 1,
      actions: [{ id: 1, name: 'setToEnglish', params: [] }],
    });
  });

  it('assigning an action to an invitation with params', async () => {
    const result = await service.assign(
      { email: 'kaore.olafsson@gmail.com' },
      'setToEnglish',
      [['an', 'array', 'first'], 42],
    );

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.invitation.data).toStrictEqual({
      nextId: 1,
      actions: [
        { id: 1, name: 'setToEnglish', params: [['an', 'array', 'first'], 42] },
      ],
    });
  });

  it('cannot assign an action to an inexistent invitation without specifing email', async () => {
    const result = await service.assign({ token: 'mabite' }, 'setToEnglish');

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('invitation.notFound');
  });

  it('cannot assign an action that not exists', async () => {
    const result = await service.assign(
      { email: 'kevin.bertho@gmail.com' },
      'notExists',
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].code).toBe('action.notFound');
  });

  it('onAssign receive Invitation instance and action', async () => {
    const conf = { ...config, actions };
    conf.interfaces.onAssign = (action, Invitation, cb) => {
      expect(action).toStrictEqual({
        id: 1,
        name: 'setToEnglish',
        params: [['an', 'array', 'first'], 42],
      });
      cb();
    };

    await knex.destroy();
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/invitation.data.sql`],
    });
    service.init(conf);

    const result = await service.assign(
      { email: 'kaore.olafsson@gmail.com' },
      'setToEnglish',
      [['an', 'array', 'first'], 42],
    );

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
