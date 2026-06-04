// Tables for the better-auth OAuth 2.1 provider (`@better-auth/oauth-provider`)
// plus the `session` table and the `jwt` plugin's `jwks` key store.
//
// `session`: sessions are primarily Redis-resident (secondaryStorage). The
// OAuth provider plugin requires `session.storeSessionInDatabase: true` when a
// secondaryStorage is configured (it throws at init otherwise — see
// packages/auth/src/index.js), so sessions are now ALSO written here. Reads stay
// Redis-first; this table is a fallback + the FK target for OAuth tokens.
//
// Only schema-declared session fields are persisted (the field converter drops
// undeclared keys on write — AND, with storeSessionInDatabase enabled, that
// stripped row is what gets cached back into Redis, so an undeclared field is
// lost everywhere, not just in the DB). The impersonation plugin's
// `impersonatedBy` is therefore declared as a `session.additionalFields` entry
// (packages/auth/src/index.js) and needs its own `impersonated_by` column so
// `/signout` can detect an active "sign as" session.
//
// Column conventions follow the other better-auth tables (account/apikey):
// no FK constraints (services stay decoupled), TEXT for free-form/JSON and
// `string[]` fields (better-auth serializes arrays to JSON strings), DATETIME(3)
// for ms-precision timestamps, VARCHAR(255) for indexed/unique strings (MySQL
// can't index TEXT without a prefix length). Row-id references that point at a
// `serial` (BIGINT AUTO_INCREMENT) id are BIGINT (user_id, session_id,
// refresh_id); the OAuth `client_id` is the public client identifier string and
// `reference_id` is a generic owner ref, both VARCHAR. camelCase plugin fields
// are remapped to snake_case via the `schema` mappings in packages/auth/src.

export async function up(knex) {
  const { schemas } = knex.client.config;
  const {
    session,
    oauthClient,
    oauthAccessToken,
    oauthRefreshToken,
    oauthConsent,
    jwks,
  } = schemas;

  if (!await knex.schema.hasTable(session)) {
    await knex.schema.createTable(session, (t) => {
      t.bigIncrements('id').primary();
      t.string('token', 255).notNullable();
      t.bigint('user_id').notNullable();
      t.dateTime('expires_at', { precision: 3 }).notNullable();
      t.string('ip_address', 255).nullable();
      t.text('user_agent').nullable();
      t.dateTime('created_at', { precision: 3 }).notNullable();
      t.dateTime('updated_at', { precision: 3 }).notNullable();
      // Impersonation marker: the impersonator's user id, set via the
      // oa-impersonation plugin's `createSession` override and declared as a
      // `session.additionalFields` entry so it survives the field converter.
      t.string('impersonated_by', 255).nullable();
      t.unique('token', { indexName: 'idx_session_token' });
      t.index('user_id', 'idx_session_user_id');
      t.index('expires_at', 'idx_session_expires_at');
    });
  }

  if (!await knex.schema.hasTable(oauthClient)) {
    await knex.schema.createTable(oauthClient, (t) => {
      t.bigIncrements('id').primary();
      t.string('client_id', 255).notNullable();
      t.text('client_secret').nullable();
      t.boolean('disabled').notNullable().defaultTo(false);
      t.boolean('skip_consent').nullable();
      t.boolean('enable_end_session').nullable();
      t.string('subject_type', 255).nullable();
      t.text('scopes').nullable();
      t.bigint('user_id').nullable();
      t.dateTime('created_at', { precision: 3 }).nullable();
      t.dateTime('updated_at', { precision: 3 }).nullable();
      t.string('name', 255).nullable();
      t.text('uri').nullable();
      t.text('icon').nullable();
      t.text('contacts').nullable();
      t.text('tos').nullable();
      t.text('policy').nullable();
      t.string('software_id', 255).nullable();
      t.string('software_version', 255).nullable();
      t.text('software_statement').nullable();
      t.text('redirect_uris').notNullable();
      t.text('post_logout_redirect_uris').nullable();
      t.string('token_endpoint_auth_method', 255).nullable();
      t.text('grant_types').nullable();
      t.text('response_types').nullable();
      t.boolean('public').nullable();
      t.string('type', 255).nullable();
      t.boolean('require_pkce').nullable();
      t.string('reference_id', 255).nullable();
      t.text('metadata').nullable();
      t.unique('client_id', { indexName: 'idx_oauth_client_client_id' });
      t.index('user_id', 'idx_oauth_client_user_id');
    });
  }

  if (!await knex.schema.hasTable(oauthRefreshToken)) {
    await knex.schema.createTable(oauthRefreshToken, (t) => {
      t.bigIncrements('id').primary();
      t.string('token', 255).notNullable();
      t.string('client_id', 255).notNullable();
      t.bigint('session_id').nullable();
      t.bigint('user_id').notNullable();
      t.string('reference_id', 255).nullable();
      t.dateTime('expires_at', { precision: 3 }).nullable();
      t.dateTime('created_at', { precision: 3 }).nullable();
      t.dateTime('revoked', { precision: 3 }).nullable();
      t.dateTime('auth_time', { precision: 3 }).nullable();
      t.text('scopes').notNullable();
      t.unique('token', { indexName: 'idx_oauth_refresh_token_token' });
      t.index('client_id', 'idx_oauth_refresh_token_client_id');
      t.index('session_id', 'idx_oauth_refresh_token_session_id');
      t.index('user_id', 'idx_oauth_refresh_token_user_id');
    });
  }

  if (!await knex.schema.hasTable(oauthAccessToken)) {
    await knex.schema.createTable(oauthAccessToken, (t) => {
      t.bigIncrements('id').primary();
      t.string('token', 255).notNullable();
      t.string('client_id', 255).notNullable();
      t.bigint('session_id').nullable();
      t.bigint('user_id').nullable();
      t.string('reference_id', 255).nullable();
      t.bigint('refresh_id').nullable();
      t.dateTime('expires_at', { precision: 3 }).nullable();
      t.dateTime('created_at', { precision: 3 }).nullable();
      t.text('scopes').notNullable();
      t.unique('token', { indexName: 'idx_oauth_access_token_token' });
      t.index('client_id', 'idx_oauth_access_token_client_id');
      t.index('session_id', 'idx_oauth_access_token_session_id');
      t.index('user_id', 'idx_oauth_access_token_user_id');
      t.index('refresh_id', 'idx_oauth_access_token_refresh_id');
    });
  }

  if (!await knex.schema.hasTable(oauthConsent)) {
    await knex.schema.createTable(oauthConsent, (t) => {
      t.bigIncrements('id').primary();
      t.string('client_id', 255).notNullable();
      t.bigint('user_id').nullable();
      t.string('reference_id', 255).nullable();
      t.text('scopes').notNullable();
      t.dateTime('created_at', { precision: 3 }).nullable();
      t.dateTime('updated_at', { precision: 3 }).nullable();
      t.index('client_id', 'idx_oauth_consent_client_id');
      t.index('user_id', 'idx_oauth_consent_user_id');
    });
  }

  if (!await knex.schema.hasTable(jwks)) {
    await knex.schema.createTable(jwks, (t) => {
      t.bigIncrements('id').primary();
      t.text('public_key').notNullable();
      t.text('private_key').notNullable();
      t.dateTime('created_at', { precision: 3 }).notNullable();
      t.dateTime('expires_at', { precision: 3 }).nullable();
    });
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await knex.schema.dropTableIfExists(schemas.jwks);
  await knex.schema.dropTableIfExists(schemas.oauthConsent);
  await knex.schema.dropTableIfExists(schemas.oauthAccessToken);
  await knex.schema.dropTableIfExists(schemas.oauthRefreshToken);
  await knex.schema.dropTableIfExists(schemas.oauthClient);
  await knex.schema.dropTableIfExists(schemas.session);
}
