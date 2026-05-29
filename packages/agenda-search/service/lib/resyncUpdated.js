import _ from 'lodash';
import logs from '@openagenda/logs';
import bulk from './bulk.js';
import formatAgenda from './formatAgenda.js';

const log = logs('resyncUpdated');

const LIMIT = 20;

function _cleanTimestamp(since) {
  if (since) return since;

  const anHourAgo = new Date();

  anHourAgo.setHours(anHourAgo.getHours() - 1);

  return anHourAgo;
}

function _isPublishable(agenda) {
  // Mirrors the gates at services/agendas/onCreate.js and
  // core/agendas/update.js. An agenda that is private or has been
  // flipped to indexed:false must not live in the public ES alias.
  return !agenda.private && agenda.indexed !== false;
}

async function processBatch({ client, alias }, formattedAgendas) {
  if (!formattedAgendas.length) {
    return { updated: 0, indexed: 0, removed: 0 };
  }

  const existing = await client.mget({
    index: alias,
    type: 'agenda',
    body: {
      ids: formattedAgendas.map((a) => a.uid),
    },
  });

  const uids = _.get(existing, 'docs', [])
    .filter((item) => item.found)
    .map((item) => parseInt(item._id, 10));

  // Split into three buckets:
  //  - toRemove: agenda is private/!indexed AND currently lives in ES;
  //              must be deleted. If it's not in ES, nothing to do.
  //  - toUpdate: publishable and already in ES.
  //  - toIndex:  publishable and not yet in ES.
  // The toRemove bucket is the in-window orphan sweep — it catches
  // private flips and indexed:true→false flips that no other code path
  // funnels through agendaSearch.remove.
  const { toUpdate, toIndex, toRemove } = formattedAgendas.reduce(
    (split, agenda) => {
      const inEs = uids.includes(agenda.uid);
      if (!_isPublishable(agenda)) {
        if (inEs) split.toRemove.push(agenda);
      } else if (inEs) {
        split.toUpdate.push(agenda);
      } else {
        split.toIndex.push(agenda);
      }
      return split;
    },
    { toUpdate: [], toIndex: [], toRemove: [] },
  );

  let updated = 0;
  let indexed = 0;
  let removed = 0;

  if (toUpdate.length) {
    updated = await bulk(
      { client, index: alias, operation: 'update' },
      toUpdate,
    );

    log('info', 'bulk updated %s agendas', updated);
  }

  if (toIndex.length) {
    indexed = await bulk({ client, index: alias, operation: 'index' }, toIndex);

    log('info', 'bulk indexed %s agendas', indexed);
  }

  if (toRemove.length) {
    removed = await bulk(
      { client, index: alias, operation: 'delete' },
      toRemove,
    );

    log('info', 'bulk removed %s stale (private / unindexed) agendas', removed);
  }

  return { updated, indexed, removed };
}

export default async (
  { client, alias, listAgendas, getDetailedAgenda },
  since = null,
) => {
  const updatedAtGreaterThan = _cleanTimestamp(since);

  log('info', 'launching update from %s', updatedAtGreaterThan);

  let updated = 0;
  let indexed = 0;
  let removed = 0;
  let lastId = 0;

  // Page through every agenda updated since `updatedAtGreaterThan`. The
  // previous implementation fetched a single non-paginated batch of LIMIT
  // and silently dropped the rest — see rebuild.js for the loop pattern.
  while (lastId !== -1) {
    // eslint-disable-next-line no-await-in-loop
    const { items: agendas, lastId: nextLastId } = await listAgendas(
      { updatedAtGreaterThan },
      lastId,
      LIMIT,
    );

    if (!agendas.length) {
      lastId = nextLastId;
      break;
    }

    const formattedAgendas = [];
    for (const agenda of agendas) {
      // eslint-disable-next-line no-await-in-loop
      const formatted = await getDetailedAgenda(agenda).then((a) =>
        formatAgenda(a));
      formattedAgendas.push(formatted);
    }

    log(
      'info',
      '%s agendas to update in batch since %s (lastId %s)',
      agendas.length,
      updatedAtGreaterThan,
      lastId,
    );

    // eslint-disable-next-line no-await-in-loop
    const batchCounts = await processBatch({ client, alias }, formattedAgendas);

    updated += batchCounts.updated;
    indexed += batchCounts.indexed;
    removed += batchCounts.removed;

    lastId = nextLastId;
  }

  return { indexed, updated, removed };
};
