import logs from '@openagenda/logs';
import extractUserUid from '../utils/extractUserUid.js';
import cleanEvent from '../utils/cleanEvent/index.js';
import getAgenda from '../utils/getAgenda.js';

const log = logs('core/agendas/events/validate');

export default async (core, agendaUid, data, options = {}) => {
  log('info', 'validating event on agenda %s', agendaUid);

  const { services } = core;

  const { members } = services;

  const { access, draft, defaultLang } = {
    access: 'public', // read or write?
    draft: false,
    defaultLang: 'en',
    returnPayload: false,
    ...options,
  };

  const userUid = extractUserUid(data, options);

  const member = userUid ? await members.get({ agendaUid, userUid }) : null;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });
  log('  loaded agenda %s', agenda.slug);

  return cleanEvent(services, agenda, data, {
    draft,
    defaultLang,
    member,
    access,
  });
};

export const { eventFields } = cleanEvent;
