import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

import get from './get.js';

const log = logs('core/agendas/update');

export default async (core, agendaOrUid, data, options = {}) => {
  const { agendas, agendaSearch } = core.services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  log('updating agenda of uid %s', agendaUid, data);

  const agendaBefore = await agendas.get({ uid: agendaUid }, options);

  let updateResult;
  try {
    updateResult = await agendas.set({ uid: agendaUid }, data, {
      ...options,
    });
  } catch (errors) {
    if (Array.isArray(errors)) {
      throw new BadRequest({ info: { errors } }, 'invalid data');
    }
    throw new Error('could not update agenda');
  }

  // Use the agenda from the update result if available, otherwise fetch it
  const updatedAgenda = updateResult.agenda
    ? updateResult.agenda
    : await get(core, agendaUid, {
      ...options,
      detailed: true,
    });

  try {
    if (!agendaBefore.private && updatedAgenda.private) {
      await agendaSearch.remove(updatedAgenda);
    } else if (!updatedAgenda.private) {
      await agendaSearch.set(updatedAgenda);
    }
  } catch (e) {
    log(
      'error',
      'could not update search index for agenda %s',
      agendaUid,
      e?.meta?.body?.error ?? e,
    );
  }

  return updatedAgenda;
};
