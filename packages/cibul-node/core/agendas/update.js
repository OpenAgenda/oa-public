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

  const { success, errors } = await agendas.set({ uid: agendaUid }, data, {
    ...options,
  });

  if (errors?.length) {
    throw new BadRequest({ info: { errors } }, 'invalid data');
  }

  if (!success) throw new Error('could not update agenda');

  const updatedAgenda = await get(core, agendaUid, {
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
