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
    // Public ES alias must not hold private or unindexed agendas.
    // Previously only `private` flips were gated here, which let an
    // indexed:true→false flip leave a stale public doc behind that
    // could only be cleaned up by the periodic rebuild. Symmetric
    // handling for both `private` and `indexed` flips:
    //   - was publishable, no longer publishable → remove
    //   - publishable now                        → upsert via set
    //   - was not publishable, still not         → no-op
    const wasPublishable = !agendaBefore.private && agendaBefore.indexed;
    const isPublishable = !updatedAgenda.private && updatedAgenda.indexed;

    if (wasPublishable && !isPublishable) {
      await agendaSearch.remove(updatedAgenda);
    } else if (isPublishable) {
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
