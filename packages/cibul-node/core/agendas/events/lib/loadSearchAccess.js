import logs from '@openagenda/logs';

const log = logs('core/agendas/events/loadSearchAccess');

export default async (core, agendaUid, options = {}) => {
  const { services } = core;
  const { members, simpleCache } = services;

  const { getRoleSlug } = members.utils;

  if (options.access) {
    log('using provided access: %s', options.access);
    return options.access;
  }

  if (options.agendaKey?.identifier === agendaUid) {
    return 'administrator';
  }

  if (!options.userUid) {
    return null;
  }

  const cached = await simpleCache
    .hash('members', `${agendaUid}.${options.userUid}`)
    .get('role');

  if (cached) {
    return cached;
  }

  const member = options.userUid
    ? await members.get({
      agendaUid,
      userUid: options.userUid,
    })
    : null;

  let role = 'public';

  if (member) {
    role = getRoleSlug(member.role);
    log('member is loaded, using role as access', role);
  }

  simpleCache
    .hash('members', `${agendaUid}.${options.userUid}`)
    .set('role', role);

  return role;
};
