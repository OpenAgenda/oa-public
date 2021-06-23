'use strict';

const log = require('@openagenda/logs')('set');
const formatAgenda = require('./formatAgenda');

module.exports = async ({
  getDetailedAgenda,
  client,
  alias
}, agenda) => {
  const body = await getDetailedAgenda(agenda).then(a => formatAgenda(a));
  return client.index({
    index: alias,
    id: agenda.uid,
    body
  });
}