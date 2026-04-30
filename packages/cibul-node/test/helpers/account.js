// Returns the better-auth `account` row that mirrors the legacy `user.password`
// for the `credential` provider. Used by phase 2 dual-write tests.
export async function getCredentialAccount(knex, userId, schemas) {
  return knex(schemas.account)
    .where({ provider_id: 'credential', account_id: String(userId) })
    .first();
}

export default { getCredentialAccount };
