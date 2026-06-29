import _ from 'lodash';

const PAGE_SIZE = 25;

const normalizeEmail = (e) =>
  String(e ?? '')
    .trim()
    .toLowerCase();

// The legacy additional-info email. members.list/get never expose the raw
// `store`; fromDB parses it and camel-cases custom_fields under `member.custom`
// (so `custom_fields.email` → `custom.email`). Schema-form answers live in the
// custom table, not here, so this is the member's legacy contact email.
function memberEmailOf(member) {
  return member.custom?.email ?? null;
}

const toPublicUser = (u) =>
  u && {
    uid: u.uid,
    email: u.email,
    fullName: u.fullName,
    isRemoved: !!u.isRemoved,
    // Two user surfaces for the resolved account; both pages take the account
    // via the `userUid` query param.
    adminLink: `/admin/users?userUid=${u.uid}`,
    supervisorLink: `/supervisor/users?userUid=${u.uid}`,
  };

// Resolve agenda titles + each member's user for one page of member rows, and
// shape the response objects. `provenance(member)` supplies sources/matchedEmails.
async function decorateMembers({ users, agendas }, rows, provenance) {
  const agendaUids = _.uniq(rows.map((m) => m.agendaUid).filter(Boolean));
  const { agendas: agendaRows } = agendaUids.length
    ? await agendas.list({ uid: agendaUids }, 0, agendaUids.length, {
      private: null,
    })
    : { agendas: [] };
  const agendaByUid = _.keyBy(agendaRows, 'uid');

  const userUids = _.uniq(rows.map((m) => m.userUid).filter(Boolean));
  const { data: userRows } = userUids.length
    ? await users.find({
      query: { uid: { $in: userUids }, $limit: userUids.length },
    })
    : { data: [] };
  const userByUid = _.keyBy(userRows.map(toPublicUser), 'uid');

  return rows.map((m) => ({
    memberId: m.id,
    userUid: m.userUid ?? null,
    agendaUid: m.agendaUid ?? null,
    agendaTitle: agendaByUid[m.agendaUid]?.title ?? null,
    role: m.role ?? null,
    deletedUser: !!m.deletedUser,
    memberEmail: memberEmailOf(m),
    ...provenance(m),
    user: m.userUid ? userByUid[m.userUid] ?? null : null,
  }));
}

// Resolve the accounts owning any of the emails in a single batched query (an
// email maps to at most one account). Returns uid → { user, matchedEmails }.
async function resolveAccountsByEmail({ users }, emails) {
  const byUid = new Map();
  if (!emails.length) return byUid;
  const { data } = await users.find({
    query: { email: { $in: emails }, $limit: emails.length },
  });
  data.forEach((user) => {
    const matched = emails.filter((e) => normalizeEmail(user.email) === e);
    byUid.set(user.uid, { user, matchedEmails: new Set(matched) });
  });
  return byUid;
}

// Shape a page of member rows into the paginated response, seeking on member
// id. Shared by the account and legacy lists (the schema list seeks on the
// custom-record id instead).
async function finishMemberPage(deps, rows, provenance) {
  const members = await decorateMembers(deps, rows, provenance);
  const hasMore = rows.length === PAGE_SIZE;
  return {
    members,
    nextCursor: hasMore ? rows[rows.length - 1].id : null,
    hasMore,
  };
}

// Account-email user matches (plus the explicit uid) — an email maps to at most
// one account, so this list is tiny and returned unpaginated.
async function findDirectUsers({ users }, emails, uid) {
  const byUid = await resolveAccountsByEmail({ users }, emails);
  if (Number.isInteger(uid) && !byUid.has(uid)) {
    const u = await users.get(uid, { removed: null }).catch(() => null);
    if (u) byUid.set(uid, { user: u, matchedEmails: new Set() });
  }
  return [...byUid.values()].map(({ user, matchedEmails }) => ({
    ...toPublicUser(user),
    matchedEmails: [...matchedEmails],
  }));
}

// Members of the resolved accounts — the explicit uid plus any account whose
// email matches — paginated by member id cursor. This is the uid/account →
// memberships link the email-only searches below cannot provide.
async function accountPage({ members, users, agendas }, emails, uid, after) {
  const byUid = await resolveAccountsByEmail({ users }, emails);
  const uids = new Set(byUid.keys());
  if (Number.isInteger(uid)) uids.add(uid);
  if (!uids.size) return { members: [], nextCursor: null, hasMore: false };

  const rows = await members.list(
    { userUid: [...uids], deletedUser: null },
    { after: after ? [after] : undefined, size: PAGE_SIZE },
  );
  return finishMemberPage({ users, agendas }, rows, () => ({
    sources: ['account'],
    matchedEmails: [],
  }));
}

// Members whose legacy store carries one of the emails, cross-agenda, paginated
// by member id cursor (after).
async function legacyPage({ members, users, agendas }, emails, after) {
  if (!emails.length) return { members: [], nextCursor: null, hasMore: false };

  const rows = await members.list(
    { email: emails, deletedUser: null },
    { after: after ? [after] : undefined, size: PAGE_SIZE },
  );
  return finishMemberPage({ users, agendas }, rows, (m) => {
    const lower = memberEmailOf(m)?.toLowerCase() ?? null;
    return {
      sources: ['store'],
      matchedEmails: lower && emails.includes(lower) ? [lower] : [],
    };
  });
}

// Members whose schema-form answers carry one of the emails, paginated by the
// custom record id cursor. Each custom hit resolves to the member(s) on an
// agenda whose member schema produced the answer.
async function schemaPage({ members, users, agendas, custom }, emails, after) {
  if (!emails.length) return { members: [], nextCursor: null, hasMore: false };

  const customRows = await custom.searchByValue(emails, {
    afterId: after,
    limit: PAGE_SIZE,
  });
  const hasMore = customRows.length === PAGE_SIZE;
  const nextCursor = hasMore ? customRows[customRows.length - 1].id : null;

  const identifiers = _.uniq(customRows.map((r) => r.identifier));
  // Resolve the memberships of this page's matched accounts so we can keep only
  // the ones on the agenda whose member schema produced the custom answer. The
  // page is PAGE_SIZE custom rows, so identifiers (distinct accounts) is small;
  // size caps the rare power-account fan-out (a user on thousands of agendas).
  const candidates = identifiers.length
    ? await members.list(
      { userUid: identifiers, deletedUser: null },
      { size: 1000 },
    )
    : [];
  const candAgendaUids = _.uniq(
    candidates.map((m) => m.agendaUid).filter(Boolean),
  );
  const { agendas: candAgendas } = candAgendaUids.length
    ? await agendas.list({ uid: candAgendaUids }, 0, candAgendaUids.length, {
      private: null,
      // memberSchemaId is `list: false` (internal), so agendas.list omits it
      // unless explicitly requested — without this the schema join below never
      // matches and the whole list returns empty.
      includeFields: ['memberSchemaId'],
    })
    : { agendas: [] };
  const schemaByAgenda = _.keyBy(candAgendas, 'uid');

  // Member rows in custom-row order, deduped within the page.
  const seen = new Set();
  const ordered = [];
  customRows.forEach((cr) => {
    candidates
      .filter(
        (m) =>
          String(m.userUid) === String(cr.identifier)
          && String(schemaByAgenda[m.agendaUid]?.memberSchemaId)
            === String(cr.formSchemaId),
      )
      .forEach((m) => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          ordered.push(m);
        }
      });
  });

  const out = await decorateMembers({ users, agendas }, ordered, () => ({
    sources: ['custom'],
    matchedEmails: [],
  }));
  return { members: out, nextCursor, hasMore };
}

// Supervisor account-reconciliation lookup. Given the session email and/or the
// email the visitor typed into Crisp (and optionally a uid), find every user and
// member tied to those addresses — including emails buried in member additional
// info, both legacy (member store) and schema-form (custom store) — and surface
// the user behind each member with a link to /admin/users. Each list is fetched
// separately and paginated server-side by id cursor (kind + after), so the
// account and legacy lists stay complete however large (one shared contact
// email can match hundreds of thousands of members); the schema list pages on
// the custom-record id and resolves each page's accounts within a generous
// per-page bound. Orchestrated through the owning services. Guarded upstream by
// allowSuperAdmin.
export default async function supervisorLookup(req, res, next) {
  try {
    const { users, members, custom, agendas } = req.app.services;

    const emails = _.uniq(
      [req.query.sessionEmail, req.query.crispEmail]
        .map(normalizeEmail)
        .filter(Boolean),
    );
    // Strict digits only: Number.parseInt('12a') silently yields 12, resolving
    // the wrong account. A non-numeric uid is treated as absent.
    const uidRaw = String(req.query.uid ?? '').trim();
    const uid = /^\d+$/.test(uidRaw) ? Number.parseInt(uidRaw, 10) : null;
    const hasUid = Number.isInteger(uid);
    const kind = req.query.kind || 'users';
    const after = req.query.after ? Number.parseInt(req.query.after, 10) : 0;

    const empty = kind === 'users'
      ? { users: [] }
      : { members: [], nextCursor: null, hasMore: false };
    if (!emails.length && !hasUid) return res.json(empty);

    if (kind === 'users') {
      return res.json({ users: await findDirectUsers({ users }, emails, uid) });
    }
    if (kind === 'account') {
      return res.json(
        await accountPage({ members, users, agendas }, emails, uid, after),
      );
    }
    if (kind === 'legacy') {
      return res.json(
        await legacyPage({ members, users, agendas }, emails, after),
      );
    }
    if (kind === 'schema') {
      return res.json(
        await schemaPage({ members, users, agendas, custom }, emails, after),
      );
    }
    return res.json({ members: [], nextCursor: null, hasMore: false });
  } catch (err) {
    next(err);
  }
}
