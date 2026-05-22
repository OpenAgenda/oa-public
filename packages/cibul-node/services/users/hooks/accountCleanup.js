// Phase 2.5 — clean up better-auth state when a user is soft-removed or
// blacklisted:
// - remove → delete credential row AND revoke sessions.
// - blacklist (internal patch isBlacklisted false→true) → revoke sessions
//   only; the credential row stays because blacklist is reversible.
//
// Failure policy (aligned with phase 2a): log + swallow. Legacy is the
// source of truth and a missed cleanup never blocks the operation.

import logs from '@openagenda/logs';

const log = logs('services/users/hooks/accountCleanup');

const afterRemove = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  const before = context.params?.before;
  if (!auth || !before) return;

  const userId = before.id;
  try {
    // Revoke before delete: defense-in-depth against a DB hiccup leaving
    // the user logged in until session TTL.
    await auth.revokeUserSessions(userId);
    await auth.deleteCredentialAccount(userId);
    await auth.deleteAllOAuthAccounts(userId);
  } catch (err) {
    log.error('account cleanup on remove failed', { userId, err });
  }
};

const afterPatchBlacklist = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  const before = context.params?.before;
  if (!auth || context.params?.internal !== true || !before) return;

  // Only act on false→true. `context.data` is snake_cased by the users
  // service middleware before our outermost hook runs; `params.before`
  // is stashed pre-transform and stays camelCase.
  if (before.isBlacklisted === true || context.data?.is_blacklisted !== true) return;

  try {
    await auth.revokeUserSessions(before.id);
  } catch (err) {
    log.error('session revoke on blacklist failed', { userId: before.id, err });
  }
};

// Fields mirrored into the BA Redis session snapshot (read off `req.user` by
// lib/authGuards.js loadUser). The patch `snakeCase()` before-hook has
// already snake-cased `context.data` by the time this after-hook runs (same
// convention `afterPatchBlacklist` relies on for `is_blacklisted`), so only
// snake forms are needed. `is_blacklisted` is deliberately absent — handled by
// `afterPatchBlacklist` (revoke wins) — as are high-frequency internal fields
// (last_inbox_check, last_signin, last_notified).
const MIRRORED_FIELDS = [
  'full_name',
  'image',
  'culture',
  'transverse_api_access',
  'is_new',
];

// Re-snapshot the user into active Redis sessions when a patch mutates a
// session-mirrored field, so `req.user` reflects the new value on the next
// request — without logging the user out (revocation is reserved for
// blacklist/remove). Fires for both user self-service patches (restricted to
// fullName/culture/image by the patch before-hooks) and internal admin patches
// (transverseApiAccess/isNew); `params.before` is stashed unconditionally on
// patch, so it is available regardless of provider. If the same patch also
// blacklists, the revoke hook wins and a refresh would be pointless, so skip it.
//
// Invariant: req.user freshness relies on user mutations going through
// `usersSvc.patch`. A direct DB write (or another service mutating the user
// row) bypasses this hook and leaves the Redis session snapshot stale until
// the session is recreated.
const afterPatchRefreshSession = () => async (context, next) => {
  await next();
  const auth = context.services?.auth;
  const before = context.params?.before;
  if (!auth || !before) return;

  const data = context.data ?? {};
  if (data.is_blacklisted === true && before.isBlacklisted !== true) return;
  if (!MIRRORED_FIELDS.some((field) => field in data)) return;

  try {
    await auth.refreshUserSessions(before.id);
  } catch (err) {
    log.error('session refresh on patch failed', { userId: before.id, err });
  }
};

export default function accountCleanupHooks() {
  return {
    remove: [afterRemove()],
    patch: [afterPatchBlacklist(), afterPatchRefreshSession()],
  };
}
