'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('search/resyncUpdated');
const bulk = require('./bulk');

module.exports = async ({
  client,
  alias,
  listAgendas,
  formatForIndex
}, since = null) => {
  let updated = 0;
  let indexed = 0;

  const bulkConfig = {
    client,
    index: alias,
    formatForIndex
  };

  const updatedAtGreaterThan = _cleanTimestamp(since);

  log('info', 'launching update from %s', updatedAtGreaterThan);

  const agendas = await listAgendas({ updatedAtGreaterThan }, 0, 20, { detailed: true });

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
      ...bulkConfig,
      operation: 'update'
    }, toUpdate);

    log('info', 'bulk updated %s agendas', updated);
  }

  if (toIndex.length) {
    indexed = await bulk({
      ...bulkConfig,
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
