'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('search/resyncUpdated');
const bulk = require('./bulk');
const formatAgenda = require('./formatAgenda');

module.exports = async ({
  client,
  alias,
  listAgendas,
  getDetailedAgenda
}, since = null) => {
  let updated = 0;
  let indexed = 0;

  const updatedAtGreaterThan = _cleanTimestamp(since);

  log('info', 'launching update from %s', updatedAtGreaterThan);

  const {
    items: agendas
  } = await listAgendas({ updatedAtGreaterThan }, 0, 20);

  const formattedAgendas = [];
  for (const agenda of agendas) {
    formattedAgendas.push(
      await getDetailedAgenda(agenda).then(a => formatAgenda(a))
    );
  }

  log('info', '%s agendas to update since %s', agendas.length, updatedAtGreaterThan);

  if (!agendas.length) {
    return {
      updated,
      indexed
    };
  }

  const existing = await client.mget({
    index: alias,
    type: 'agenda',
    body: {
      ids: agendas.map(a => a.uid)
    }
  });

  const uids = _.get(existing, 'docs', [])
    .filter(item => item.found)
    .map(item => parseInt(item._id));

  const {
    toUpdate,
    toIndex
  } = agendas.reduce((split, agenda) => {
    split[uids.includes(agenda.uid) ? 'toUpdate' : 'toIndex'].push(agenda);

    return split;
  }, { toUpdate: [], toIndex: [] });

  if (toUpdate.length) {
    updated = await bulk({
      client,
      index: alias,
      operation: 'update'
    }, toUpdate);

    log('info', 'bulk updated %s agendas', updated);
  }

  if (toIndex.length) {
    indexed = await bulk({
      client,
      index: alias,
      operation: 'index'
    }, toIndex);

    log('info', 'bulk indexed %s agendas', indexed);
  }

  return {
    indexed,
    updated
  }
}


function _cleanTimestamp(since) {
  if (since) return since;

  const anHourAgo = new Date();

  anHourAgo.setHours(anHourAgo.getHours() -1);

  return anHourAgo;
}
