// Phase 2a — mirror legacy OA password writes from `user.password` (+ `user.salt`)
// into `account.password` so phase 2b can verify and rehash via better-auth
// without a backfill window.
//
// Runs as outermost service hooks: `await next()` first guarantees the legacy
// write succeeded and the snake_case transform / `hashPassword` middleware
// have produced the hex hash in `context.data.password`.
//
// Failure policy: log+swallow. Legacy is the source of truth in 2a; a missed
// mirror is recovered by the phase 2b backfill migration.

import logs from '@openagenda/logs';

const log = logs('services/users/hooks/dualWriteLegacyPassword');
const HEX64 = /^[a-f0-9]{64}$/i;

async function mirror(auth, userId, salt, hex, op) {
  if (!salt) {
    log.warn(`dual-write skipped: missing salt (${op})`, { userId });
    return;
  }
  try {
    const encoded = auth.encodeLegacyPassword('sha256', salt, hex);
    await auth.upsertCredentialAccount(userId, encoded);
  } catch (err) {
    log.error(`dual-write account mirror failed (${op})`, { userId, err });
  }
}

const afterCreate = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  if (!auth || !context.result) return;

  const hex = context.data?.password;
  if (typeof hex !== 'string' || !HEX64.test(hex)) return;

  // `salt` is stripped from `result` by users `keepFields()` for non-internal
  // calls, so we read it from `data` where the inner `generateHash('salt')`
  // middleware put it before the insert.
  const salt = context.data?.salt ?? context.result?.salt;
  await mirror(auth, context.result.id, salt, hex, 'create');
};

const afterChangePassword = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  if (!auth) return;

  const before = context.params?.before;
  const hex = context.data?.password;
  if (!before || typeof hex !== 'string' || !HEX64.test(hex)) return;

  await mirror(auth, before.id, before.salt, hex, 'changePassword');
};

// Gated on `internal: true` because the only callsite that legitimately patches
// a credential password is `confirmUnlinkFacebook` (cibul-node/auth/unlinkFacebook.front.js).
// External admin patches with a password (none today) would be silently skipped.
const afterPatch = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  if (!auth || context.params?.internal !== true) return;

  const before = context.params?.before;
  const hex = context.data?.password;
  if (!before || typeof hex !== 'string' || !HEX64.test(hex)) return;

  await mirror(auth, before.id, before.salt, hex, 'patch');
};

export default function dualWriteLegacyPasswordHooks() {
  return {
    create: [afterCreate()],
    changePassword: [afterChangePassword()],
    patch: [afterPatch()],
  };
}
