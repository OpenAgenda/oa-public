import logs from '@openagenda/logs';

const log = logs('core/agendas/events/removeByExtId');

export default async (core, agendaUid, key, value, options = {}) => {
  let resp = null;
  log('info', 'getting', { agendaUid, extId: { key, value } });
  const extId = { key, value };
  const event = await core
    .agendas(agendaUid)
    .events.search.get({ extId }, options.context);
  if (event) {
    log('info', 'removing', { agendaUid, extId });
    resp = await core.agendas(agendaUid).events.remove(event.uid, options);
  }
  return resp;
};
