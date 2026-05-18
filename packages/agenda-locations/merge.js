import logger from '@openagenda/logs';

import { BadRequest } from '@openagenda/verror';
import list from './list.js';
import get from './get.js';
import update from './update.js';
import remove from './remove.js';
import authorize from './lib/authorize.js';

const log = logger('merge');

async function merge(
  { internals, endpoints },
  mergeInItem,
  items,
  data = null,
  options = {},
) {
  log('mergin ', items.length, 'location in ', mergeInItem.uid);

  await authorize(internals, 'merge', mergeInItem.uid, options);

  const toBeMerged = items.filter((i) => i.uid !== mergeInItem.uid);

  if (!toBeMerged.length) {
    throw new BadRequest('Nothing to merge');
  }

  if (internals.interfaces.beforeMerge) {
    await internals.interfaces.beforeMerge(
      mergeInItem,
      toBeMerged,
      options.context,
    );
  }

  const removeFromDuplicates = toBeMerged.map((l) => l.uid);

  log('updating merged location');
  const newDuplicateCandidates = (mergeInItem.duplicateCandidates ?? []).filter(
    (el) => !removeFromDuplicates.includes(el),
  );
  const updatedMerged = await update(
    { service: internals, isPatch: true },
    mergeInItem.uid,
    {
      ...data || {},
      duplicateCandidates: newDuplicateCandidates.length
        ? newDuplicateCandidates
        : null,
    },
    { ...options, fromMerge: true },
  );

  log('removing other locations');
  for (const location of toBeMerged) {
    await remove({ internals, endpoints }, location, {
      ...options,
      mergedIn: mergeInItem.uid,
    });
  }

  log('merge complete');

  return updatedMerged;
}

const mergeMain = async (
  { internals, endpoints },
  mergeInUid,
  query,
  data,
  options,
) =>
  merge(
    { internals, endpoints },
    await get({ internals, endpoints }, mergeInUid),
    await list(
      internals,
      query,
      {},
      { ...options, total: null, detailed: true },
    ),
    data,
  );

mergeMain.byAgendaUid = async (
  { internals, endpoints },
  agendaUid,
  mergeInUid,
  query,
  data,
  options = {},
) =>
  merge(
    { internals, endpoints },
    await get.byAgendaUid({ internals, endpoints }, agendaUid, mergeInUid),
    await list.byAgendaUid(
      internals,
      agendaUid,
      query,
      {},
      { ...options, total: null, detailed: true },
    ),
    data,
    options,
  );

mergeMain.bySetUid = async (
  { internals, endpoints },
  setUid,
  mergeInUid,
  query,
  data,
  options = {},
) =>
  merge(
    { internals, endpoints },
    await get.bySetUid({ internals, endpoints }, setUid, mergeInUid),
    await list.bySetUid(
      internals,
      setUid,
      query,
      {},
      { ...options, total: null, detailed: true },
    ),
    data,
    options,
  );

export default mergeMain;
