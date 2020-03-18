'use strict';

const _ = require('lodash');
const cleanRules = require('./rules/clean');
const limit = require('./limit');

module.exports.toEntry = agg => {
  const entry = { review_id: agg.agendaId };

  ['createdAt', 'updatedAt', 'limit'].forEach(af => {
    if (af in agg) entry[_.snakeCase(af)] = agg[af];
  });

  if (agg.rules) {
    entry.store = JSON.stringify({ rules: agg.rules });
  }

  if (agg.agendaId) entry.review_id = agg.agendaId;

  return entry;
};

module.exports.fromEntry = entry => {
  const agg = {};

  ['created_at', 'updated_at', 'limit'].forEach(ef => {
    if (ef in entry) agg[_.camelCase(ef)] = entry[ef];
  });

  agg.rules = entry.store ? cleanRules(JSON.parse(entry.store).rules) : [];
  agg.limit = limit.get(agg);

  return agg;
};
