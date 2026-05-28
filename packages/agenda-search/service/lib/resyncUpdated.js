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

async function processBatch({ client, alias }, formattedAgendas) {
  if (!formattedAgendas.length) {
    return { updated: 0, indexed: 0 };
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

  const { toUpdate, toIndex } = formattedAgendas.reduce(
    (split, agenda) => {
      split[uids.includes(agenda.uid) ? 'toUpdate' : 'toIndex'].push(agenda);

      return split;
    },
    { toUpdate: [], toIndex: [] },
  );

  let updated = 0;
  let indexed = 0;

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

  return { updated, indexed };
}

export default async (
  { client, alias, listAgendas, getDetailedAgenda },
  since = null,
) => {
  const updatedAtGreaterThan = _cleanTimestamp(since);

  log('info', 'launching update from %s', updatedAtGreaterThan);

  let updated = 0;
  let indexed = 0;
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

    lastId = nextLastId;
  }

  return { indexed, updated };
};
