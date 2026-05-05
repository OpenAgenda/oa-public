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

export default function accountCleanupHooks() {
  return {
    remove: [afterRemove()],
    patch: [afterPatchBlacklist()],
  };
}
