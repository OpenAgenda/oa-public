import { NotFound } from '@openagenda/verror';
import logger from '@openagenda/logs';
import removeCandidate from './duplicates/removeCandidate.js';
import get from './get.js';
import authorize from './lib/authorize.js';

const log = logger('remove');

async function remove({ endpoints, internals }, current, options = {}) {
  log('received %j payload with options %j', current.uid, options);

  const isFromMerge = !!options?.mergedIn;

  await authorize(
    internals,
    isFromMerge ? 'merge' : 'delete',
    current.uid,
    options,
  );

  if (internals.interfaces.beforeRemove) {
    await internals.interfaces.beforeRemove(current, options);
  }
  await internals.clients
    .knex(internals.config.schema)
    .where('uid', current.uid)
    .update({
      deleted: 1,
      updated_at: new Date(),
      merged_in: options?.mergedIn,
    });
  if (current?.duplicateCandidates?.length > 0) {
    await removeCandidate(
      endpoints,
      current.duplicateCandidates,
      current.uid,
    ).then(
      (res) => res,
      (err) => {
        log(err);
      },
    );
  }
  return current;
}

remove.byAgendaUid = async (
  { endpoints, internals },
  agendaUid,
  identifiers,
  options = {},
) => {
  const current = await get.byAgendaUid(
    { internals, endpoints },
    agendaUid,
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound(
      { info: { identifiers, agendaUid } },
      'location not found',
    );
  }

  return remove({ endpoints, internals }, current, options);
};

remove.bySetUid = async (
  { endpoints, internals },
  setUid,
  identifiers,
  options = {},
) => {
  const current = await get.bySetUid(
    { internals, endpoints },
    setUid,
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound({ info: { identifiers, setUid } }, 'location not found');
  }

  return remove({ endpoints, internals }, current, options);
};

export default remove;
