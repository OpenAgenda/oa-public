'use strict';

const _ = require('lodash');
const agendas = require('../fixtures/agendas.json');

module.exports = async (total, decorate, query, lastId, limit) => {
  const updatedAtGreaterThan = _.get(query, 'updatedAtGreaterThan');

  const chunk = agendas
    .sort((a1, a2) => a1.id > a2.id ? 1 : -1)
    .filter(a => a.id > lastId)
    .filter((a, i) => i < limit)
    .filter(a => updatedAtGreaterThan ? a.updatedAt > updatedAtGreaterThan : true)
    .map(decorate)
    .map(a => _.pick(a, ['id', 'uid', 'title', 'description', 'official', 'updatedAt', 'createdAt']));

  return {
    items: chunk,
    lastId: chunk.length ? _.last(chunk).id : -1
  }
}
