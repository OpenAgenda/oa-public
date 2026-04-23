import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import * as service from '../service/index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const invitationSample = {
  id: 1,
  email: 'kevin.bertho@gmail.com',
  token: '066LREi0S3hUA2Uh273a6b147C15rMV2',
  store: {
    nextId: 3,
    actions: [
      {
        id: 1,
        name: 'createStakeholder',
        params: { role: 'admin' },
      },
      {
        id: 2,
        name: 'uneActionBidon',
        params: ['firstParams', { second: 'caca' }],
      },
    ],
  },
};

describe('invitations - functional (server): get an invitation', () => {
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

  it('get with email', async () => {
    const { invitation } = await service.get({
      email: 'kevin.bertho@gmail.com',
    });

    expect(invitation._data).toStrictEqual(invitationSample);
    expect(invitation.id).toBe(invitationSample.id);
    expect(invitation.email).toBe(invitationSample.email);
    expect(invitation.token).toBe(invitationSample.token);
    expect(invitation.data).toStrictEqual(invitationSample.store);
  });

  it('get with token', async () => {
    const { invitation } = await service.get({
      token: '066LREi0S3hUA2Uh273a6b147C15rMV2',
    });

    expect(invitation._data).toStrictEqual(invitationSample);
    expect(invitation.id).toBe(invitationSample.id);
    expect(invitation.email).toBe(invitationSample.email);
    expect(invitation.token).toBe(invitationSample.token);
    expect(invitation.data).toStrictEqual(invitationSample.store);
  });

  it('get with bad token return null', async () => {
    const { invitation } = await service.get({
      token: '066LREi0S3hUA2Uh273a6b147C1kaore',
    });

    expect(invitation).toBeNull();
  });
});
