import { hashApiKey } from '@openagenda/auth';

// Insert apikey-store rows from a list of plain descriptors:
//   { plaintext, userUid, oaKind, name? }
// `plaintext` is hashed via the same primitive verifyApiKey uses on read, and
// `userUid` becomes the reference_id (the apikey-store owner key — same shape
// resolveOwner decodes back).
export default async function seedApiKeys(knex, keys) {
  if (!keys || keys.length === 0) return;

  const now = new Date();
  const rows = await Promise.all(
    keys.map(async ({ plaintext, userUid, oaKind, name = null }) => ({
      config_id: 'default',
      name,
      start: plaintext,
      reference_id: String(userUid),
      prefix: null,
      key: await hashApiKey(plaintext),
      enabled: true,
      rate_limit_enabled: false,
      request_count: 0,
      created_at: now,
      updated_at: now,
      permissions: null,
      metadata: JSON.stringify({ oaKind }),
    })),
  );

  await knex(knex.client.config.schemas.apiKey).insert(rows);
}
