// D5b P4a — relax the legacy access_token → api_key_set link so the next code
// deploy can stop writing it. We only loosen constraints here; the column and
// the FK target table stay around until P4b drops them. This split keeps the
// migration↔deploy window safe: N-1 (P3) still writes api_key_set_id (now
// nullable, FK gone — write succeeds), N (P4a) stops writing it entirely.

export async function up(knex) {
  const { schemas } = knex.client.config;

  await knex.schema
    .raw(
      `ALTER TABLE \`${schemas.accessToken}\`
         DROP FOREIGN KEY \`access_token_api_key_set_id_api_key_set_id\``,
    )
    .catch((err) => {
      // Re-run safety: the FK may already be gone.
      if (!/check that.*exists|doesn't exist|errno: 152/i.test(err.message)) {
        throw err;
      }
    });

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       MODIFY \`api_key_set_id\` BIGINT UNSIGNED NULL`,
  );
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  // Down only makes sense if no NULL rows snuck in after P4a's code deploy;
  // tighten back to NOT NULL only when safe, otherwise leave nullable.
  const [[{ nulls }]] = await knex.raw(
    `SELECT COUNT(*) AS nulls FROM \`${schemas.accessToken}\`
       WHERE api_key_set_id IS NULL`,
  );
  if (Number(nulls) === 0) {
    await knex.schema.raw(
      `ALTER TABLE \`${schemas.accessToken}\`
         MODIFY \`api_key_set_id\` BIGINT UNSIGNED NOT NULL`,
    );
  }

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       ADD CONSTRAINT \`access_token_api_key_set_id_api_key_set_id\`
       FOREIGN KEY (\`api_key_set_id\`) REFERENCES \`${schemas.apiKeySet}\` (\`id\`) ON DELETE CASCADE`,
  );
}
