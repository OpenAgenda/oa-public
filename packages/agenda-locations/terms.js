'use strict';

const log = require('@openagenda/logs')('terms');

const addListQuery = require('./lib/addListQuery');
const BadRequestError = require('./lib/BadRequestError');
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const termFields = require('./lib/fields.json').filter(f => f.read.includes('terms'));
const pickContextIdentifiers = require('./lib/pickContextIdentifiers');

const { getMatchingDatabaseField } = require('./lib/addSelect');

async function terms(service, requestedTerms, query = {}, options = {}) {
  log('received %j %j', requestedTerms, query);

  const {
    context,
    filterNulls
  } = {
    filterNulls: false,
    context: {},
    ...options
  };

  const k = service.clients.knex(service.config.schema);

  const requestedTermFields = termFields
    .filter(f => requestedTerms.indexOf(f.field) !== -1)
    .sort((a, b) => requestedTerms.indexOf(a.field) > requestedTerms.indexOf(b.field) ? 1 : -1);

  const requestedTermFieldNames = termFields.map(f => f.field);

  if (!requestedTermFields.length) {
    throw new BadRequestError('No valid term was requested');
  }

  await addListQuery(service, k, {
    ...query,
    ...pickContextIdentifiers(context, ['agendaUid', 'setUid'])
  });

  const dbFields = requestedTermFields.map(getMatchingDatabaseField);

  if (filterNulls) {
    for (const dbField of dbFields) {
      k.whereNotNull(dbField);
    }
  }

  return k.select(dbFields)
    .groupBy(dbFields)
    .orderBy(dbFields[dbFields.length -1], 'asc')
    .then(rows => rows.map(r => fromDbEntryToItem(r, {
      includeFields: requestedTermFieldNames,
      omitUndefinedFields: true
    })));
}

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  requestedTerms = [],
  query = {},
  options = {}
) => terms(service, requestedTerms, query, {
  ...options,
  context: { agendaUid }
});

module.exports.bySetUid = async (
  service,
  setUid,
  requestedTerms = [],
  query = {},
  options = {}
) => terms(service, requestedTerms, query, {
  ...options,
  context: { setUid }
});
