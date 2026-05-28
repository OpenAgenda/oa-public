import { hashApiKey } from '@openagenda/auth';
import load from './loadObjectFromFile.js';

const AGENDA_KEY_PLAINTEXT = 'e830934e9d1848189ac74de3bfa7df0a';

export default async (knex) => {
  await knex('user').insert([
    load('./sql/users/01.json', {
      id: 1,
      uid: 1,
    }),
  ]);

  await knex('api_key_set').insert([
    load('./sql/apiKeySets/01.json', {
      user_id: 1,
    }),
  ]);

  await knex('access_token').insert([
    load('./sql/accessTokens/01.json'),
    load('./sql/accessTokens/02.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/218.json', {
      uid: 123,
    }),
  ]);

  await knex('reviewer').insert([
    load('sql/members/kev.admin.json', {
      agenda_uid: 123,
      user_uid: 1,
    }),
  ]);

  // Seed an agenda key directly into the better-auth `apikey` store (the
  // legacy `key` table was dropped at D5a). The plaintext is hashed the same
  // way `verifyApiKey` hashes incoming keys, so the fixture key authenticates
  // exactly as a real one would.
  const now = new Date();
  await knex(knex.client.config.schemas.apiKey).insert({
    config_id: 'default',
    name: 'Wigglypoof',
    start: AGENDA_KEY_PLAINTEXT,
    reference_id: 'agenda:123',
    prefix: null,
    key: await hashApiKey(AGENDA_KEY_PLAINTEXT),
    enabled: true,
    rate_limit_enabled: false,
    request_count: 0,
    created_at: now,
    updated_at: now,
    permissions: null,
    metadata: JSON.stringify({ oaKind: 'agenda' }),
  });
};
