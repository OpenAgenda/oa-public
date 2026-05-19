# `core.agendas().events.transferOwnership` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `core.agendas(agendaUid).events.transferOwnership(eventUid, { userUid }, options)` as a first-class core endpoint with the same validation, authorization, and side-effect discipline as its neighbors (`update`, `remove`), and route the existing HTTP transfer route through it.

**Architecture:** A new file in `packages/cibul-node/core/agendas/events/` implements the endpoint, mirroring the shape and error contract of `update.js` and `remove.js`. A small activity helper sits next to `createRemoveActivity.js` in the same `lib/` directory. The HTTP route in `services/members/plugApp.js` keeps its target-resolution glue (`{ userUid }` or `{ email }` → `req.targetMember`) but delegates everything else to the new core endpoint; the `adminModOrEventOwner` middleware is unwired from this route but left exported (still used by `services/agendaEvents/plugApp.js`). `services/members/lib/transferEvent.js` is deleted. Functional integration tests use fixture `014.sql.js` plus a small amount of inline-seeded member data.

**Tech Stack:** Node.js (ESM), Jest, knex, `@openagenda/verror`, `@openagenda/agenda-events`, `@openagenda/members`.

**Reference points in the codebase:**

- `packages/cibul-node/core/agendas/events/update.js` — closest sibling for validation order, payload pattern, eventSearch update.
- `packages/cibul-node/core/agendas/events/remove.js` — uses `extractActingFromContext`, calls activity helper, layout to follow.
- `packages/cibul-node/core/agendas/events/lib/createRemoveActivity.js` — template for `createTransferOwnershipActivity.js`.
- `packages/cibul-node/services/members/lib/transferEvent.js` — current ad-hoc implementation (to be deleted).
- `packages/cibul-node/test/core.agendas.events.update.test.js` — template for the new test file (ES setup, service enable list).
- `packages/cibul-node/test/13_03_core.agendas.locations.merge.test.js` — template for service-based assertions (no raw knex reads).
- `docs/superpowers/specs/2026-05-18-transfer-ownership-design.md` — design spec.

**Fixture data (`packages/cibul-node/test/fixtures/014.sql.js`) used by the new test file:**

- Agenda `17026855` (la gargouille) — has multiple roles already.
- Event `48564567` (in eventSet 3) — `draft: 0`, `owner_uid: 63170203`, `agenda_uid: 17026855`. The `agenda_event` row exists but has `user_uid` unset (null).
- Members of agenda `17026855`:
  - `user_uid: 1` — credential `2` (administrator) — **acting admin** for happy-path tests.
  - `user_uid: 63170200` (janine) — credential `3` (moderator) — used as **transfer target**.
  - `user_uid: 63170203` — credential `1` (contributor) — **current owner** of event `48564567`.
- Inline-seeded in the test's `beforeAll`:
  - `user_uid: 99999001` — credential `4` (reader, in agenda `17026855`) — target for "role too low" test.
  - `user_uid: 99999002` — credential `1` (contributor, in agenda `17026855`) — acting user for "contributor-not-owner" test.

**Role codes:** `1` = contributor, `2` = administrator, `3` = moderator, `4` = reader (from `packages/members/iso/roleValues.js`).

---

### Task 1: Scaffold the test file with a happy-path skeleton

**Files:**

- Create: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`

- [ ] **Step 1: Write the failing test file**

Create `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`:

```js
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
  'tracker',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'keys',
  'activities',
];

const AGENDA_UID = 17026855;
const EVENT_UID = 48564567;
const CURRENT_OWNER_UID = 63170203; // contributor, member of AGENDA_UID
const ADMIN_UID = 1; // administrator, member of AGENDA_UID
const TARGET_UID = 63170200; // janine, moderator, member of AGENDA_UID
const READER_UID = 99999001; // seeded reader (target for role-too-low test)
const SPARE_CONTRIBUTOR_UID = 99999002; // seeded contributor (acting for not-owner test)

describe('core - functional (server): core.agendas().events.transferOwnership', () => {
  let core;

  const config = testConfig.extendWith({
    queuesPrefix: 'qTransferOwnership:',
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_transferOwnership',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['014.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });
    core = Core(services, config);

    // Inline seed: spare reader + spare contributor in AGENDA_UID
    const now = new Date();
    await core.services.knex('reviewer').insert([
      {
        agenda_uid: AGENDA_UID,
        user_uid: READER_UID,
        credential: 4, // reader
        created_at: now,
        updated_at: now,
      },
      {
        agenda_uid: AGENDA_UID,
        user_uid: SPARE_CONTRIBUTOR_UID,
        credential: 1, // contributor
        created_at: now,
        updated_at: now,
      },
    ]);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({ index: 'test' })
      .catch(() => null);
    await core.agendas(AGENDA_UID).events.search.rebuild();

    await core.services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  // ---- Failure cases first (no state mutation) ----

  // (Placeholders — filled in across subsequent tasks)

  // ---- Happy-path cases last ----

  it('admin transfers event ownership to another member', async () => {
    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: ADMIN_UID } },
      );

    const event = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    expect(event.ownerUid).toBe(TARGET_UID);

    const agendaEvent = await core.services
      .agendaEvents(AGENDA_UID)
      .get(EVENT_UID);
    expect(agendaEvent.userUid).toBe(TARGET_UID);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run from `packages/cibul-node`:

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: FAIL — `core.agendas(...).events.transferOwnership is not a function`.

- [ ] **Step 3: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js
git commit -m "test(cibul-node): scaffold core.agendas().events.transferOwnership suite"
```

---

### Task 2: Endpoint stub + wire-up into `events/index.js`

**Files:**

- Create: `packages/cibul-node/core/agendas/events/transferOwnership.js`
- Modify: `packages/cibul-node/core/agendas/events/index.js`

- [ ] **Step 1: Create the stub endpoint**

Create `packages/cibul-node/core/agendas/events/transferOwnership.js`:

```js
import logs from '@openagenda/logs';

const log = logs('core/agendas/events/transferOwnership');

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  log('not implemented yet', { agendaUid, eventUid, data, options });
  throw new Error('not implemented');
}
```

- [ ] **Step 2: Wire it into the events index**

Edit `packages/cibul-node/core/agendas/events/index.js`. Add an import alongside the others and bind it inside the returned factory.

Add this import after the existing imports near the top of the file:

```js
import transferOwnership from './transferOwnership.js';
```

Inside the `(agendaUid) => Object.assign(...)` return value, add the binding next to `patch`:

```js
patch: update.patch.bind(null, core, agendaUid),
transferOwnership: transferOwnership.bind(null, core, agendaUid),
```

- [ ] **Step 3: Run the test to confirm it now fails with the stub error**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: FAIL — happy-path test throws `not implemented` (rather than "not a function"). Wiring confirmed.

- [ ] **Step 4: Commit**

```bash
git add packages/cibul-node/core/agendas/events/transferOwnership.js packages/cibul-node/core/agendas/events/index.js
git commit -m "feat(cibul-node): scaffold core.agendas().events.transferOwnership endpoint"
```

---

### Task 3: Agenda + event existence checks

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add two failing tests**

In the test file, in the "Failure cases first" section, add:

```js
it('throws NotFound when the agenda does not exist', async () => {
  await expect(
    core
      .agendas(99999999)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: ADMIN_UID } },
      ),
  ).rejects.toMatchObject({
    name: 'NotFound',
    message: expect.stringContaining('agenda not found'),
  });
});

it('throws NotFound when the event does not exist', async () => {
  await expect(
    core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        99999999,
        { userUid: TARGET_UID },
        { context: { userUid: ADMIN_UID } },
      ),
  ).rejects.toMatchObject({
    name: 'NotFound',
    message: expect.stringContaining('event not found'),
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail with the stub error**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 new tests FAIL (they throw `not implemented`, not `NotFound`).

- [ ] **Step 3: Implement agenda + event existence checks**

Replace the body of `packages/cibul-node/core/agendas/events/transferOwnership.js` with:

```js
import { NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.js';

const log = logs('core/agendas/events/transferOwnership');

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  const { events } = core.services;

  log('transferring event %s on agenda %s', eventUid, agendaUid);

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const event = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  throw new Error('not implemented');
}
```

Note: `getAgenda` already throws `NotFound('agenda not found')` when the agenda is missing — verify by quickly checking the helper, no extra wrapping needed.

- [ ] **Step 4: Run tests to confirm the 2 new tests pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 NotFound tests PASS; happy-path test still FAILS with `not implemented`.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership validates agenda and event existence"
```

---

### Task 4: AgendaEvent existence check

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add a failing test that deletes the agenda_event row before the call**

In the failure-cases section, add:

```js
it('throws NotFound when the agenda_event reference row is missing', async () => {
  // Pick a non-mutated event whose agenda_event row we can drop for this test.
  // We use the existing draft-only fixture event by stripping its agenda_event row.
  const STRAY_EVENT_UID = 19201989; // present in some fixtures; if absent here we delete defensively
  await core.services.knex('agenda_event').delete().where({
    agenda_uid: AGENDA_UID,
    event_uid: STRAY_EVENT_UID,
  });

  await expect(
    core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        STRAY_EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: ADMIN_UID } },
      ),
  ).rejects.toMatchObject({ name: 'NotFound' });
});
```

Note: if `STRAY_EVENT_UID` does not exist as an event in `014.sql.js`, this test will throw `event not found` from Task 3's check — which is also `NotFound` and satisfies the assertion. The intent is that the call rejects before any write happens. The implementer should verify which path triggered by looking at the log output; if needed, replace `STRAY_EVENT_UID` with an event uid that exists but whose `agenda_event` row has been deleted in-test (any non-target event from `014.sql.js`'s eventSets — e.g. event 83829660 from eventSet 7 in `agenda 17026855`). Confirm by reading `packages/cibul-node/test/fixtures/sql/eventSets/7.json`.

- [ ] **Step 2: Run the test (expect FAIL with `not implemented` for now if event exists; PASS-by-coincidence with `event not found` if event does not exist)**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Inspect the failure message: the test must end with `NotFound`. If it errors with `not implemented`, proceed to Step 3. If it already passes (event was not in the fixture), the implementer should rewrite the test to use a real event then delete its `agenda_event` row — the implementation in Step 3 will catch that case.

- [ ] **Step 3: Add the agendaEvent existence check**

In `transferOwnership.js`, replace the body between the event check and the `throw new Error('not implemented')` with:

```js
const { agendaEvents, events } = core.services;

// ... existing agenda + event checks ...

const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
  throwOnNotFound: true,
});

throw new Error('not implemented');
```

(Update the destructuring of `core.services` at the top to include `agendaEvents`.)

- [ ] **Step 4: Run tests, confirm pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: agenda-event NotFound test PASSES. Previous 2 NotFound tests still PASS. Happy path still FAILS.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership requires an agenda_event reference"
```

---

### Task 5: Target member existence + role check

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add two failing tests**

```js
it('throws NotFound when the target user is not a member of the agenda', async () => {
  await expect(
    core.agendas(AGENDA_UID).events.transferOwnership(
      EVENT_UID,
      { userUid: 88888888 }, // never seeded
      { context: { userUid: ADMIN_UID } },
    ),
  ).rejects.toMatchObject({
    name: 'NotFound',
    message: expect.stringContaining('target member not found'),
  });
});

it('throws Forbidden when the target member role is below contributor', async () => {
  await expect(
    core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: READER_UID },
        { context: { userUid: ADMIN_UID } },
      ),
  ).rejects.toMatchObject({
    name: 'Forbidden',
    message: expect.stringContaining('target cannot edit events'),
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail with `not implemented`**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 new tests FAIL.

- [ ] **Step 3: Implement target validation**

Update `transferOwnership.js`:

```js
import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import membersSvc from '@openagenda/members';
import getAgenda from '../utils/getAgenda.js';

const log = logs('core/agendas/events/transferOwnership');

const {
  utils: { compareRoles },
} = membersSvc;

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  const { agendaEvents, events, members } = core.services;

  log('transferring event %s on agenda %s', eventUid, agendaUid);

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const event = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    throwOnNotFound: true,
  });

  const targetMember = await members.get(
    { agendaUid, userUid: data.userUid },
    { roleAsSlug: false },
  );

  if (!targetMember) {
    throw new NotFound(
      { info: { agendaUid, userUid: data.userUid } },
      'target member not found',
    );
  }

  if (
    !compareRoles.isSuperiorToOrEqual(targetMember.role, 'contributor', {
      throwIfUnknown: false,
    })
  ) {
    throw new Forbidden(
      { info: { agendaUid, userUid: data.userUid } },
      'target cannot edit events',
    );
  }

  throw new Error('not implemented');
}
```

- [ ] **Step 4: Run tests, confirm new ones pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 new tests PASS. Happy path still FAILS.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership validates target member"
```

---

### Task 6: Acting authz check

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add two failing tests**

```js
it('throws Forbidden when no acting user is provided in context', async () => {
  await expect(
    core
      .agendas(AGENDA_UID)
      .events.transferOwnership(EVENT_UID, { userUid: TARGET_UID }, {}),
  ).rejects.toMatchObject({
    name: 'Forbidden',
    message: expect.stringContaining('not authorized to transfer ownership'),
  });
});

it('throws Forbidden when acting member is contributor but not the current owner', async () => {
  await expect(
    core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: SPARE_CONTRIBUTOR_UID } },
      ),
  ).rejects.toMatchObject({
    name: 'Forbidden',
    message: expect.stringContaining('not authorized to transfer ownership'),
  });
});
```

- [ ] **Step 2: Run tests, confirm they fail with `not implemented`**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 new tests FAIL.

- [ ] **Step 3: Implement acting authz**

Add the acting-context extraction and authz check between the target validation and the `throw new Error('not implemented')`:

```js
import extractActingFromContext from './lib/extractActingFromContext.js';

// ...inside the function, after target validation:

const { user: actingUser, member: actingMember } =
  await extractActingFromContext(core.services, agendaUid, options.context);

const isAdminOrMod =
  !!actingMember &&
  compareRoles.isSuperiorTo(actingMember.role, 'contributor', {
    throwIfUnknown: false,
  });
const isCurrentOwner =
  !!actingMember && actingMember.userUid === event.ownerUid;

if (!actingMember || (!isAdminOrMod && !isCurrentOwner)) {
  throw new Forbidden(
    { info: { agendaUid, eventUid } },
    'not authorized to transfer ownership',
  );
}

throw new Error('not implemented');
```

- [ ] **Step 4: Run tests, confirm new ones pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: 2 new tests PASS. Happy path still FAILS (acting admin passes authz now but hits `not implemented`).

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership enforces admin/mod-or-owner authz"
```

---

### Task 7: DB writes — happy path + owner-transfers

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add the "owner transfers" happy-path variant**

Add a second test next to the existing admin happy-path:

```js
it('current owner can transfer ownership to another member', async () => {
  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: TARGET_UID },
      { context: { userUid: CURRENT_OWNER_UID } },
    );

  const event = await core.services.events.get(EVENT_UID, {
    access: 'internal',
    private: null,
  });
  expect(event.ownerUid).toBe(TARGET_UID);

  const agendaEvent = await core.services
    .agendaEvents(AGENDA_UID)
    .get(EVENT_UID);
  expect(agendaEvent.userUid).toBe(TARGET_UID);
});
```

Note on test ordering: the two happy-path tests run sequentially. The admin test transfers `EVENT_UID` ownership to `TARGET_UID`. The second test then runs with `CURRENT_OWNER_UID` (`63170203`) as the acting user — but `63170203` is no longer the owner. Refactor: at the start of the second test, transfer back to `CURRENT_OWNER_UID` first (using the admin context) so the precondition holds:

```js
it('current owner can transfer ownership to another member', async () => {
  // Reset ownership to the original contributor so the owner-acting branch can be tested
  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: CURRENT_OWNER_UID },
      { context: { userUid: ADMIN_UID } },
    );

  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: TARGET_UID },
      { context: { userUid: CURRENT_OWNER_UID } },
    );

  const event = await core.services.events.get(EVENT_UID, {
    access: 'internal',
    private: null,
  });
  expect(event.ownerUid).toBe(TARGET_UID);

  const agendaEvent = await core.services
    .agendaEvents(AGENDA_UID)
    .get(EVENT_UID);
  expect(agendaEvent.userUid).toBe(TARGET_UID);
});
```

- [ ] **Step 2: Run tests, confirm both happy paths fail with `not implemented`**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: both happy-path tests FAIL with `not implemented`.

- [ ] **Step 3: Implement the writes**

Replace the `throw new Error('not implemented')` at the end of `transferOwnership.js` with:

```js
  log(
    'transferring ownership of event %s from %s to %s on agenda %s',
    eventUid,
    event.ownerUid,
    targetMember.userUid,
    agendaUid,
  );

  await events.patch(
    { uid: event.uid },
    { ownerUid: targetMember.userUid },
    { protected: false, access: 'internal' },
  );

  await agendaEvents(agendaUid).update(
    event.uid,
    { userUid: targetMember.userUid },
    {
      protected: false,
      context: {
        userUid: actingMember?.userUid,
        member: actingMember,
      },
    },
  );

  log.info('transferred event ownership', {
    agendaUid,
    eventUid,
    fromUserUid: event.ownerUid,
    toUserUid: targetMember.userUid,
    actingUserUid: actingMember?.userUid,
  });

  // TODO (task 9): refresh search index
  // TODO (task 10): write activity
  // TODO (task 11): feed follow/unfollow
}
```

- [ ] **Step 4: Run tests, confirm both happy paths pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: all current tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership writes event.ownerUid and agendaEvent.userUid"
```

---

### Task 8: No-op short-circuit

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add the failing test**

Add as the first happy-path-adjacent test (it makes no DB mutation, so order is flexible):

```js
it('is a no-op when the target is already the current owner', async () => {
  // Ensure the event's current owner matches a known value
  const before = await core.services.agendaEvents(AGENDA_UID).get(EVENT_UID);
  const beforeEvent = await core.services.events.get(EVENT_UID, {
    access: 'internal',
    private: null,
  });

  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: beforeEvent.ownerUid },
      { context: { userUid: ADMIN_UID } },
    );

  const after = await core.services.agendaEvents(AGENDA_UID).get(EVENT_UID);
  // updatedAt is the strongest signal of "no write happened"
  expect(after.updatedAt?.toISOString?.() ?? after.updatedAt).toBe(
    before.updatedAt?.toISOString?.() ?? before.updatedAt,
  );
});
```

- [ ] **Step 2: Run the test — it should currently PASS or FAIL depending on whether `agendaEvents.update` is a touch-write**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: test FAILS — `agendaEvents.update` will have refreshed `updated_at` because we did not short-circuit.

- [ ] **Step 3: Implement the short-circuit**

In `transferOwnership.js`, insert the short-circuit right before the writes (after authz):

```js
if (event.ownerUid === targetMember.userUid) {
  log.info('transferOwnership no-op: target is already the current owner', {
    agendaUid,
    eventUid,
    ownerUid: event.ownerUid,
  });
  return event;
}

log('transferring ownership of event %s from %s to %s on agenda %s' /* ... */);
// ...writes follow as before
```

The endpoint's return value matches `update.js`'s shape — for now we just return the loaded `event`. Once Task 9 introduces the payload pattern, the return value gets richer (and the no-op should also flow through the payload-based response).

- [ ] **Step 4: Run tests, confirm pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: no-op test PASSES. All previous tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership short-circuits when target is already owner"
```

---

### Task 9: Search index refresh

**Files:**

- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

- [ ] **Step 1: Add the failing test**

Add (after the happy-path tests):

```js
it('refreshes the search index with the new ownerUid', async () => {
  // Reset to known state first
  await core.services.agendaEvents(AGENDA_UID).get(EVENT_UID); // sanity load
  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: TARGET_UID },
      { context: { userUid: ADMIN_UID } },
    );

  const indexed = await core
    .agendas(AGENDA_UID)
    .events.search.get({ uid: EVENT_UID });
  expect(indexed.event.ownerUid).toBe(TARGET_UID);
});
```

(`events.search.get` returns `{ event, agenda, ... }` per `packages/cibul-node/core/agendas/events/search.js:141`.)

- [ ] **Step 2: Run the test, confirm it fails**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: FAIL — indexed `ownerUid` is stale.

- [ ] **Step 3: Implement the index refresh**

The implementation mirrors `update.js:333-339`. Add to the bottom of `transferOwnership.js`, after the writes:

```js
import createPayload from '../utils/createPayload.js';
import convertLocationAdditionalFields from '../utils/convertLocationAdditionalFields.js';
import formatError from '../utils/formatError.js';

// ...inside the function, after the writes:

const refreshedEvent = await events.get(eventUid, {
  access: 'internal',
  private: null,
});
const refreshedAgendaEvent = await agendaEvents(agendaUid).get(eventUid);

const payload = createPayload(core, agenda);
payload.setItem('event', event, refreshedEvent);
payload.setItem('agendaEvent', agendaEvent, refreshedAgendaEvent);

try {
  const formSchema = await payload.getFormSchema({ access: 'internal' });
  const response = await payload.getResponse('event', {
    access: 'internal',
    load: { valid: true },
  });
  const fullEventAfter = await payload.getCompiledEvent('after', null, null, {
    valid: true,
  });

  await core.services.eventSearch.update({
    ...response,
    formSchema,
    event: fullEventAfter.location
      ? convertLocationAdditionalFields(formSchema, fullEventAfter)
      : fullEventAfter,
  });
} catch (e) {
  log(
    'error',
    'could not update search indices for event %s.%s: %s',
    agendaUid,
    eventUid,
    formatError(e),
  );
}

return refreshedEvent;
```

Also update the no-op short-circuit's return to keep parity: the no-op already returns early before the index refresh — that's fine, the index was already correct in that case.

- [ ] **Step 4: Run tests, confirm pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: search-index test PASSES; all other tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cibul-node/test/core.agendas.events.transferOwnership.test.js packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership refreshes search index after the writes"
```

---

### Task 10: Activity log helper

**Files:**

- Create: `packages/cibul-node/core/agendas/events/lib/createTransferOwnershipActivity.js`
- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`
- Modify: `packages/cibul-node/test/core.agendas.events.transferOwnership.test.js`

- [ ] **Step 1: Create the helper**

Create `packages/cibul-node/core/agendas/events/lib/createTransferOwnershipActivity.js`:

```js
import logs from '@openagenda/logs';

const log = logs('core/agendas/events/lib/createTransferOwnershipActivity');

export default async function createTransferOwnershipActivity(
  services,
  { agenda, event, previousOwnerUid, newOwnerUid, actingUser, actingMember },
) {
  const { activities } = services;

  if (!activities) {
    log.warn('activities service not initialized');
    return;
  }

  await activities.addActivity(
    { entityType: 'event', entityUid: event.uid },
    {
      actor: actingUser ? `user:${actingUser.uid}` : `agenda:${agenda.uid}`,
      verb: 'event.transferOwnership',
      object: `event:${event.uid}`,
      target: `user:${newOwnerUid}`,
      store: {
        previousOwnerUid,
        newOwnerUid,
        agendaUid: agenda.uid,
        labels: {
          actor: actingMember?.custom?.contactName || actingUser?.name,
          object: event.title,
          target: agenda.title,
        },
      },
    },
  );

  log('added transferOwnership activity for event %s', event.uid);
}
```

- [ ] **Step 2: Add a test that the activity gets written**

```js
it('writes a transferOwnership activity entry', async () => {
  const before = await core.services.knex('activity').count({ count: '*' });
  const beforeCount = parseInt(before[0].count, 10);

  await core
    .agendas(AGENDA_UID)
    .events.transferOwnership(
      EVENT_UID,
      { userUid: TARGET_UID },
      { context: { userUid: ADMIN_UID } },
    );

  const after = await core.services
    .knex('activity')
    .count({ count: '*' })
    .where('verb', 'event.transferOwnership');
  expect(parseInt(after[0].count, 10)).toBeGreaterThan(0);
  // Sanity: total count grew (proves we didn't write zero rows then read zero)
  const total = await core.services.knex('activity').count({ count: '*' });
  expect(parseInt(total[0].count, 10)).toBeGreaterThan(beforeCount);
});
```

(This test uses `knex` because the `activities` service does not have a convenient list endpoint exposed at `core.services.activities` for arbitrary verbs. The intent is to verify the row exists.)

- [ ] **Step 3: Run the test, confirm it fails**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: FAIL — no activity row written.

- [ ] **Step 4: Wire the helper into the endpoint**

In `transferOwnership.js`, add the import and call. Place the call before the search-index refresh, after the writes:

```js
import createTransferOwnershipActivity from './lib/createTransferOwnershipActivity.js';

// ...inside the function, after the writes, before the search refresh:

const previousOwnerUid = event.ownerUid;

// (writes already happened above)

try {
  await createTransferOwnershipActivity(core.services, {
    agenda,
    event: refreshedEvent,
    previousOwnerUid,
    newOwnerUid: targetMember.userUid,
    actingUser,
    actingMember,
  });
} catch (e) {
  log('error', 'failed to write transferOwnership activity', { error: e });
}
```

Note: `previousOwnerUid` must be captured **before** the patch overwrites `event.ownerUid` (which it doesn't, since `event` is the local in-memory copy — `events.patch` does not mutate the closure variable). Capture it explicitly anyway to make the intent obvious.

- [ ] **Step 5: Run tests, confirm pass**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: activity test PASSES; all others PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cibul-node/core/agendas/events/lib/createTransferOwnershipActivity.js packages/cibul-node/core/agendas/events/transferOwnership.js packages/cibul-node/test/core.agendas.events.transferOwnership.test.js
git commit -m "feat(cibul-node): transferOwnership writes a dedicated activity entry"
```

---

### Task 11: Feed follow/unfollow

**Files:**

- Modify: `packages/cibul-node/core/agendas/events/transferOwnership.js`

No new test in this task. Feed follow/unfollow is best-effort and the existing `transferEvent.js` logic swallows errors. Behavioral parity is the goal.

- [ ] **Step 1: Add feed updates after the activity write**

Inside `transferOwnership.js`, after the activity call and before the search refresh, add:

```js
const { activities } = core.services;

if (activities) {
  if (previousOwnerUid && previousOwnerUid !== targetMember.userUid) {
    try {
      await activities
        .feed({ entityType: 'user', entityUid: previousOwnerUid })
        .unfollow({ entityType: 'event', entityUid: event.uid });
    } catch (e) {
      log('error', 'failed to update previous owner feed', { error: e });
    }
  }

  try {
    await activities
      .feed({ entityType: 'user', entityUid: targetMember.userUid })
      .follow({ entityType: 'event', entityUid: event.uid });
  } catch (e) {
    log('error', 'failed to update new owner feed', { error: e });
  }
}
```

- [ ] **Step 2: Run all tests, confirm green**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: all tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/cibul-node/core/agendas/events/transferOwnership.js
git commit -m "feat(cibul-node): transferOwnership updates owner feeds (best-effort)"
```

---

### Task 12: Refactor HTTP route + delete the now-unused lib

**Files:**

- Modify: `packages/cibul-node/services/members/plugApp.js`
- Delete: `packages/cibul-node/services/members/lib/transferEvent.js`

- [ ] **Step 1: Update the HTTP route to call the core endpoint**

In `packages/cibul-node/services/members/plugApp.js` around lines 158-210, replace the `app.post('/:agendaSlug/admin/members/transfer/:eventSlug', ...)` handlers. Remove the `mw.authorize.adminModOrEventOwner` middleware reference (the core endpoint now enforces authz), drop the `import transferEvent from './lib/transferEvent.js'` line, and rewrite the final handler:

```js
// at the top of plugApp.js: REMOVE this line
// import transferEvent from './lib/transferEvent.js';

// the route:
app.post(
  '/:agendaSlug/admin/members/transfer/:eventSlug',
  mw.loadAgenda.default,
  mw.loadEvent.default,
  mw.load.default,
  // NOTE: mw.authorize.adminModOrEventOwner removed — core enforces authz
  async (req, res, next) => {
    try {
      if (req.body.userUid) {
        req.targetMember = await members.get({
          agendaUid: req.agenda.uid,
          userUid: req.body.userUid,
        });
        if (req.targetMember) return next();
      }

      if (req.body.email) {
        req.targetMember = await members.get.byEmail({
          agendaUid: req.agenda.uid,
          email: req.body.email,
        });
        if (req.targetMember) return next();
      }

      next(new Error('Member not found'));
    } catch (e) {
      next(e);
    }
  },
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
);
```

- [ ] **Step 2: Delete the now-unused lib file**

```bash
git rm packages/cibul-node/services/members/lib/transferEvent.js
```

- [ ] **Step 3: Verify the middleware export is still used elsewhere**

```bash
grep -rn "adminModOrEventOwner\|authorizeAdminModOrEventOwner" packages/cibul-node | grep -v node_modules | grep -v "\.next/"
```

Expected output: references in `services/members/middleware/authorize.js` (definition), `services/members/index.js` (export), and `services/agendaEvents/plugApp.js` (consumer) — confirming the middleware is still needed for the other route.

- [ ] **Step 4: Run the transferOwnership test suite — confirm still green**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/core.agendas.events.transferOwnership.test.js
```

Expected: all tests PASS.

- [ ] **Step 5: Smoke-check the wider members/agendaEvents tests for incidental breakage**

```bash
NODE_OPTIONS="--experimental-vm-modules" yarn jest --maxWorkers=1 --workerIdleMemoryLimit=512MB --forceExit test/08_04_core.agendas.members.patch.test.js test/13_03_core.agendas.locations.merge.test.js
```

Expected: PASS. (Includes the regression test we just added.)

- [ ] **Step 6: Commit**

```bash
git add packages/cibul-node/services/members/plugApp.js
git commit -m "refactor(cibul-node): route admin/members/transfer through core endpoint, drop legacy lib"
```

---

## Out of scope (notes for future work)

- HTTP route end-to-end test — not added in this plan. Worth a follow-up file (`test/core.agendas.members.transfer.api.test.js` or similar) once a clear test pattern for the `/admin/members/transfer/:eventSlug` route exists.
- `canTransferOwnership` slot in `core/utils/authorizations.js` — only one consumer today; lift if a UI needs to ask "can I transfer this event?".
- `aggregators.notify` and `core.tasks.enqueue('eventUpdateSideEffects')` — deliberately skipped per the design.
