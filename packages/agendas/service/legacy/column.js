'use strict';

const logger = require('@openagenda/logs');

let knex;
let schemas;
let log = () => {};

function column(...args) {
  let schema;
  let agendaId;
  let columnName;
  let value;
  let cb;

  // schema is optional.
  if (arguments.length === 4) {
    schema = schemas.agenda;
    [agendaId, columnName, value, cb] = args;
  } else {
    [schema, agendaId, columnName, value, cb] = args;
  }

  if (!knex) return cb('legacy column not inited');

  log('updating column %s of schema %s at id %s', columnName, schema, agendaId);

  const updateData = {};

  updateData[columnName] = value;

  knex(schema)
    .where({ id: agendaId })

    .update(updateData)

    .then((affected) => {
      cb(null, { affected });
    }, cb);
}

function get(agendaId, columnName, cb) {
  if (!knex) return cb('legacy column not inited');

  knex(schemas.agenda)
    .select(columnName)

    .where({ id: agendaId })

    .then((rows) => {
      cb(null, rows.length ? rows[0][columnName] : null);
    }, cb);
}

function init(s, k) {
  knex = k;

  schemas = s;

  log = logger('agendas service.legacy.column');
}

module.exports = Object.assign(column, { init, get });
