// Shared OAuth-scope helpers, used by BOTH the v3 per-operation gate
// (`requireScope.js`) and the v2 per-route gate (`api/middleware/oauthScope.js`).
// The scope vocabulary is a single model across the whole API (one resource,
// version-neutral audience), so the "what scopes does this caller hold" logic
// lives here once.

// Bridge an api-key `permissions` map to the flat OAuth scope vocabulary.
// The api-key plugin stores capabilities as `Record<resource, actions[]>`
// (e.g. `{ events: ['read'], agendas: ['read'] }`, surfaced parsed by
// verifyKey); a scope is the same thing flattened to a `resource:action`
// string. So `{ events: ['read','write'] }` → `['events:read','events:write']`.
// Defensive against a non-array action list.
export function scopesFromPermissions(permissions) {
  const scopes = [];
  for (const [resource, actions] of Object.entries(permissions)) {
    if (!Array.isArray(actions)) continue;
    for (const action of actions) scopes.push(`${resource}:${action}`);
  }
  return scopes;
}

// The scopes granted to the caller, or `null` when the credential is NOT
// scope-constrained (→ pass through, holds every scope).
//
//   - OAuth token: always an array. `[]` means "the consent granted nothing" →
//     FAIL CLOSED (an empty grant must not act).
//   - API key: GRANDFATHERED. A key's scopes live in the api-key plugin's
//     `permissions` field (surfaced parsed by verifyKey as
//     `req.apiKey.permissions`). It is `null` on every key created before scopes
//     existed (no UI sets it yet) → `null` here → pass = all scopes, so adding
//     scopes to keys never breaks an existing one. A key with EXPLICIT
//     permissions is constrained to the flattened set (an explicit empty map
//     `{}` → `[]` → holds nothing, the right reading of "granted none").
//   - Agenda key / session: no `req.oauth`, no `req.apiKey` → `null` → pass.
export function grantedScopesOf(req) {
  if (req.oauth) return req.oauth.scopes ?? [];
  if (req.apiKey?.permissions) return scopesFromPermissions(req.apiKey.permissions);
  return null;
}
