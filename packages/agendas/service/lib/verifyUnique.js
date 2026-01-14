'use strict';

const logs = require('@openagenda/logs');
const map = require('../databaseFieldMap');
const dbMapper = require('./dbMapper');

const dbParse = dbMapper(map);
const log = logs('verifyUnique');

function verifyUnique(knex, schemas, field) {
  return async (v) => {
    log('verifying unique %s', field);

    const dataToParse = v.id ? v.merged : v.data;
    const value = dbParse.toDb(dataToParse)[field];

    if (value === undefined || value === null) {
      return v;
    }

    const query = knex(schemas.agenda).where(field, value);

    if (v.id) {
      query.whereNot('id', v.id);
    }

    const existing = await query.first();

    if (existing) {
      log('%s is not unique', field);
      v.errors.push({
        field,
        code: 'duplicate',
        message: 'duplicate value found',
        origin: value,
      });
    } else {
      log('%s is unique', field);
    }

    return v;
  };
}

module.exports = verifyUnique;
