'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('rebuild');
const mapping  = require('./mapping.json');
const utils = require('@openagenda/utils');
const bulk = require('./bulk');

const LIMIT = 20;

module.exports = async ({ alias, client, timeout, listAgendas, formatForIndex }) => {
  log('rebuild');

  const newIndex = alias + '_' + _dateStr();

  let previousIndices = [];
  try {
    previousIndices = _.keys(await client.indices.getAlias({
      name: alias
    }).then(r => r.body));
  } catch (err) {
    if (err.meta.statusCode !== 404) {
      throw new VError('failed to retrieve previous indices', err);
    }
  }

  await client.indices.create({
    index: newIndex,
    timeout,
    body: {
      mappings: {
        dynamic: false,
        properties: mapping
      }
    }
  });

  log('info', 'populating index');

  let offset = 0, count = 0, agendas;

  while ((agendas = await listAgendas({}, offset, LIMIT, { detailed: false })).length) {
    const inserted = await bulk({
      client,
      index: newIndex,
      formatForIndex,
      operation: 'index'
    }, agendas);

    count += inserted;

    log('added %i items from offset %s', agendas.length, offset);

    offset += LIMIT;
  }

  log('info', 'indexed %s items', count);

  await client.indices.refresh({
    index: newIndex
  });

  await client.indices.putAlias({
    index: newIndex,
    name: alias
  });

  if (previousIndices.length) {
    await client.indices.delete({
      index: previousIndices.join(',')
    });
  }
}


function _dateStr(d) {
  const date = d ? new Date(d) : new Date();
  return [
    [ date.getFullYear(),
    utils.fZ(date.getMonth() + 1),
    utils.fZ(date.getDate()) ].join(''),
    [ utils.fZ(date.getHours()),
    utils.fZ(date.getMinutes()),
    utils.fZ(date.getSeconds()) ].join('')
  ].join('_');
}
