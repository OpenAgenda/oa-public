import _ from 'lodash';
import getAgenda from '../utils/getAgenda.js';

const is = async (requested, services, agendaOrUid) =>
  _.get(
    await getAgenda(services, agendaOrUid),
    'settings.contribution.type',
  ) === services.agendas.contributionTypes[requested];

export const isOpen = is.bind(null, 'OPEN');
export const isClosed = is.bind(null, 'CLOSED');
export const isMembersOnly = is.bind(null, 'MEMBERS_ONLY');

export async function isMemberDataRequired(services, agendaOrUid) {
  return getAgenda(services, agendaOrUid).then(
    (agenda) => !!agenda?.settings?.contribution?.useFields,
  );
}
