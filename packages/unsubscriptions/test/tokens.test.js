import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import Unsubscriptions from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('tokens', () => {
  let client;
  let service;

  beforeAll(async () => {
    client = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [
        `${__dirname}/fixtures/unsubscriptionLink.data.sql`,
        `${__dirname}/fixtures/unsubscribed.data.sql`,
      ],
    });
    service = Unsubscriptions({
      secret: 'secret',
      knex: client,
    });
  });

  it('Token is created from provided payload', () => {
    const token = service.tokens.create({
      this: 'isThePayload',
    });

    expect(token.split('.').shift()).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    );
  });

  it('Token can be parsed by calling parse method', async () => {
    const token = service.tokens.create({
      this: 'isThePayload',
    });

    expect(await service.tokens.parse(token)).toEqual({ this: 'isThePayload' });
  });

  it('Token can be verified against legacy db entries', async () => {
    const payload = await service.tokens.parse(
      'f319173c-e1b8-4a81-98f8-b130f7a72cc1',
    );

    expect(payload).toEqual({
      target: 'user:63496533',
      rule: {
        id: null,
        entity_name: null,
        identifier: null,
        actions: 'receive',
        subject: 'notificationsSummary',
        inverted: false,
        conditions: null,
        fields: null,
        reason: null,
      },
    });
  });

  afterAll(async () => {
    await client?.destroy();
  });
});
