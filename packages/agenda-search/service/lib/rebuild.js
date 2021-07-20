'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('rebuild');
const mapping = require('./mapping.json');
const analysis = require('./analysis.json');
const { fZ } = require('@openagenda/utils');
const bulk = require('./bulk');
const formatAgenda = require('./formatAgenda');

const LIMIT = 20;

const dateStr = d => {
  const date = d ? new Date(d) : new Date();
  return [
    [date.getFullYear(), fZ(date.getMonth() + 1), fZ(date.getDate())].join(''),
    [fZ(date.getHours()), fZ(date.getMinutes()), fZ(date.getSeconds()), fZ(date.getMilliseconds())].join('')
  ].join('_');
};

module.exports = async ({ alias, client, timeout, listAgendas, getDetailedAgenda }) => {
  log('rebuild');

  const newIndex = alias + '_' + dateStr();

  let previousIndices = [];
  try {
    previousIndices = _.keys(await client.indices.getAlias({
      name: alias
    }).then(r => r.body));
  } catch (err) {
    if (err.meta.statusCode !== 404) {
      throw new Error('failed to retrieve previous indices', err);
    }
  }

  await client.indices.create({
    index: newIndex,
    timeout,
    body: {
      settings: {
        analysis
      },
      mappings: {
        dynamic: false,
        properties: mapping
      }
    }
  });

  log('info', 'populating index');

  let lastId = 0, count = 0;

  while (lastId !== -1) {
    const {
      lastId: newLastId,
      items: agendas
    } = await listAgendas({}, lastId, LIMIT);

    const formattedAgendas = [];
    for (const agenda of agendas) {
      formattedAgendas.push(await getDetailedAgenda(agenda).then(a => formatAgenda(a)));
    }

    const inserted = await bulk({
      client,
      index: newIndex,
      operation: 'index'
    }, formattedAgendas);

    count += inserted;

    log('info', 'added %s items from lastId %s', agendas.length, lastId);

    lastId = newLastId;
  }

  log('info', 'indexed %s items', count);

  await client.indices.refresh({
    index: newIndex
  });

  log('pointing alias %s to index %s', alias, newIndex);

  if (
    await client.indices.exists({ index: alias }).then(r => r.body)
    && !await client.indices.existsAlias({ name: alias }).then(r => r.body)
  ) {
    log('info', 'agendas index exists.. deleting');
    await client.indices.delete({ index: alias })
  }
  
  await client.indices.putAlias({
    index: newIndex,
    name: alias
  });

  if (previousIndices.length) {
    await client.indices.delete({
      index: previousIndices.join(',')
    });
    log('previous indices have been deleted (%s)', previousIndices.length);
  }
};
