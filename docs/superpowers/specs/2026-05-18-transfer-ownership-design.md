# `core.agendas().events.transferOwnership` — core endpoint for event ownership transfer

**Date:** 2026-05-18
**Scope:** `packages/cibul-node` only

## Background

Event ownership transfer is currently handled by `packages/cibul-node/services/members/lib/transferEvent.js`, called from the HTTP route `POST /:agendaSlug/admin/members/transfer/:eventSlug` (`services/members/plugApp.js:159-210`). The express middleware `mw.authorize.adminModOrEventOwner` gates the route.

This bypass-the-core pattern has two problems:

1. **No reusable surface.** Background jobs, CLI scripts, or other route handlers that want to transfer ownership cannot reuse the logic — they'd have to either re-import the lib (which assumes an `services` shape) or re-implement the writes.
2. **Authorization lives only at the HTTP edge.** A future caller can call the lib directly and skip the `adminModOrEventOwner` check entirely.

It is also the only production path that legitimately passes `protected: false` to `agendaEvents().update` — i.e. the only path that can rewrite `agenda_event.user_uid`. It has **no integration test coverage** (no test file in `packages/cibul-node/test/` references `transferEvent` or the transfer route).

## Goals

1. Provide a `core.agendas(agendaUid).events.transferOwnership(eventUid, { userUid }, options)` endpoint with the same shape and conventions as `update` / `remove` / `add`.
2. Run authorization and target-validity checks inside the core endpoint so any caller (route, CLI, job, test) is gated identically.
3. Preserve the existing user-visible behavior of the HTTP route — same outcome on success, same authz rule, same best-effort feed follow/unfollow.
4. Cover the new endpoint with a functional test file that exercises the happy paths and the failure modes.

## Non-goals

- Bulk transfer (multiple events at once).
- Changing the HTTP route's URL, request shape, or response shape.
- Reworking `core/utils/authorizations.js` to add a `canTransferOwnership` slot (one consumer today; lift later if UI needs it).
- Notifying `aggregators` of the change (deliberately skipped — aggregated agendas don't track ownership).
- Re-enqueueing through `core.tasks.enqueue('eventUpdateSideEffects')` (transfers don't trigger the email/refresh path).

## Design

### 1. Endpoint surface

New file: `packages/cibul-node/core/agendas/events/transferOwnership.js`.

Wired in `core/agendas/events/index.js` next to its neighbors:

```js
import transferOwnership from './transferOwnership.js';
// ...
return (agendaUid) =>
  Object.assign(
    // ...
    {
      // ...
      transferOwnership: transferOwnership.bind(null, core, agendaUid),
    },
  );
```

**Signature:**

```js
export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  // data: { userUid }
  // options: { context, returnPayload, callOrigin, batched }
}
```

`context.userUid` (or `context.user.uid` / `context.member.userUid`) identifies the acting user, resolved via `extractActingFromContext` exactly like `remove.js` does.

### 2. Validation order and error semantics

Walked top-to-bottom, fail-fast. Each step matches the closest neighbor's idiom so the error surface stays consistent.

| #   | Check                                                                                                                                          | Throws                                              | Mirrors                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| 1   | `getAgenda(services, agendaUid, { detailed: true })`                                                                                           | `NotFound('agenda not found')`                      | `remove.js` / `update.js`                       |
| 2   | `extractActingFromContext(services, agendaUid, options.context)` → `{ actingUser, actingMember }`                                              | —                                                   | `remove.js`                                     |
| 3   | `events.get(eventUid, { access: 'internal', private: null })`                                                                                  | `NotFound('event not found')`                       | `remove.js`                                     |
| 4   | `agendaEvents(agendaUid).get(eventUid, { throwOnNotFound: true })` (transfers require a non-draft `agenda_event` row)                          | `NotFound`                                          | `update.js`                                     |
| 5   | `members.get({ agendaUid, userUid: data.userUid }, { roleAsSlug: false })` for the target                                                      | `NotFound('target member not found')`               | new                                             |
| 6   | Target role `>= contributor` (via `members.utils.compareRoles.isSuperiorToOrEqual`)                                                            | `Forbidden('target cannot edit events')`            | new                                             |
| 7   | **Acting authz**: `actingMember && (compareRoles.isSuperiorTo(actingMember.role, 'contributor') \|\| actingMember.userUid === event.ownerUid)` | `Forbidden('not authorized to transfer ownership')` | replaces `adminModOrEventOwner` middleware      |
| 8   | Short-circuit: `event.ownerUid === target.userUid` → log `info`, return the current event without writes                                       | —                                                   | new (avoid no-op activity entries and ES churn) |

The acting authz rule is kept **inline** in `transferOwnership.js` rather than added to `core/utils/authorizations.js`. The existing `loadAuthorizations` returns a fixed set of fields (`canEditEvent`, `canRemoveEvent`, ...) and its `_operation` argument is unused. Only this endpoint needs the rule today — if a UI later asks "can I transfer?", we lift it into `authorizations.js` then.

### 3. Side effects

After validation, in order:

1. **Patch the global event row** — `events.patch({ uid: event.uid }, { ownerUid: target.userUid }, { protected: false, access: 'internal' })`. Updates `event_2.owner_uid`. Same call as today's `transferEvent.js`.
2. **Update the per-agenda reference** — `agendaEvents(agendaUid).update(event.uid, { userUid: target.userUid }, { protected: false, context: { userUid: actingMember?.userUid, member: actingMember } })`. The explicit `protected: false` is required (this is the only path that legitimately rewrites `user_uid`); `context.userUid` flows in so the `onUpdate` interface sees the acting user.
3. **Refresh the search index** — reload `event` and `agendaEvent` after the writes, build a payload via `createPayload`, then call `eventSearch.update({ ...response, formSchema, event: convertLocationAdditionalFields(formSchema, fullEvent.after) })`. Same pattern as `update.js:333-339`. Errors are logged but not thrown (parity with `update.js`).
4. **Activity log** — new helper `createTransferOwnershipActivity` in `core/agendas/events/lib/`, called inline (not through the `eventUpdateSideEffects` BullMQ queue — transfers are rare enough that synchronous is fine, and the audit trail must not be lost on queue failure).
5. **Feed follow/unfollow** — preserve current best-effort behavior from `transferEvent.js:51-68`: unfollow previous owner from the event, follow the new owner. Each in its own `try/catch`, errors logged at `error` level.

**Deliberately skipped:**

- `aggregators.notify('updateEvent', ...)` — aggregated agendas don't track per-agenda ownership.
- `core.tasks.enqueue('eventUpdateSideEffects', ...)` — would send irrelevant content-change emails.

**Return value:** mirrors `update.js`. `response = await payload.getResponse('event', { access, load: { valid: true } })`; return `returnPayload ? response : response.event`.

### 4. Refactor of the existing surface

- `services/members/lib/transferEvent.js` — **deleted**. Its logic moves into the core endpoint.
- `services/members/plugApp.js:159-210` — the route's pre-resolution of the target (`req.body.userUid` or `req.body.email` → `req.targetMember`) **stays**, but the final handler that calls `transferEvent(...)` becomes:

  ```js
  (req, res, next) =>
    req.app.core
      .agendas(req.agenda.uid)
      .events.transferOwnership(
        req.event.uid,
        { userUid: req.targetMember.userUid },
        { context: { userUid: req.user.uid } },
      )
      .then(() => {
        if (req.query.json) {
          return res.status(200).json();
        }
        res.redirect(302, `/${req.agenda.slug}/events/${req.event.slug}`);
      }, next),
  ```

- `mw.authorize.adminModOrEventOwner` is **removed from this route only** (the line at `plugApp.js:164`). The middleware itself stays — `services/agendaEvents/plugApp.js:48` still uses it via the `authorizeAdminModOrEventOwner` export.

### 5. Test suite

New file: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`.

Sits at the package's test root next to `core.agendas.events.update.test.js` and `core.agendas.events.update.auth.test.js`. Uses the same setup pattern as `13_03_core.agendas.locations.merge.test.js`: `setup({ enabled, data: [...] })`, then build `core` from `Services(testConfig, { enabled })`, `shutdown` in `afterAll`.

**Fixture:** `014.sql.js` already provides everything — a published event (`que-ferons-nous-de-nos-deserts`, agenda `49405812`, event `83829657`, current `user_uid` `56659395`) and a populated member set. Reuse it; no new fixture file.

**Service enable list** — mirror the closest neighbor and add `activities`:
`knex, redis, simpleCache, tracker, accessTokens, files, bull, events, agendas, agendaEvents, agendaLocations, formSchemas, custom, eventSearch, members, networks, users, keys, activities`.

**Assertions never hit `knex` directly** — they go through `agendaEvents(agendaUid).get(eventUid)`, `events.get(eventUid)`, and `core.agendas(agendaUid).events.search.get(eventUid)` (or equivalent indexed lookup). Same convention as the regression test we just added to `13_03_core.agendas.locations.merge.test.js`.

**Coverage matrix** — one `describe` (or `it`) per outcome class:

| #   | Scenario                                                                      | Asserts                                                                                               |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | **Happy path** — admin transfers to another contributor+ member               | Return value's `ownerUid` is the target; `agendaEvent.userUid` is the target                          |
| 2   | **Event owner transfers** — acting member is the current owner, not admin/mod | Same as #1 — acting authz passes via the OR branch                                                    |
| 3   | **No-op short-circuit** — target is already the owner                         | No DB writes (verify `updatedAt` on `agenda_event` is unchanged); returns the current event           |
| 4   | **Agenda not found** — bogus `agendaUid`                                      | Throws `NotFound` with `agenda not found`                                                             |
| 5   | **Event not found** — bogus `eventUid`                                        | Throws `NotFound` with `event not found`                                                              |
| 6   | **Target not a member of the agenda**                                         | Throws `NotFound('target member not found')`                                                          |
| 7   | **Target role below contributor** (reviewer)                                  | Throws `Forbidden('target cannot edit events')`                                                       |
| 8   | **Acting member is contributor and not the owner**                            | Throws `Forbidden('not authorized to transfer ownership')`                                            |
| 9   | **No acting context** — no `context.userUid` resolved                         | Throws `Forbidden` — defense check that the route can't accidentally bypass authz by omitting context |
| 10  | **Search index reflects the transfer**                                        | The indexed event document returns the new `ownerUid` after the call resolves                         |

**Out of scope for this file:**

- The HTTP route end-to-end (a separate `*.test.js` later, if anyone wants it).
- The existing `user_uid`-preservation assertion in `13_03_core.agendas.locations.merge.test.js`, which stays as the regression test for the _other_ (no-op location-merge) path.

## Open questions

None blocking. The activity-log payload shape will follow whatever `createRemoveActivity` does for `remove.js` — adapt during implementation.
