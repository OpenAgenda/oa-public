'use strict';

const _ = require('lodash');

let knex;
let schemas;
let service;
let config;


async function slugToUid(slug) {
  if (!slug) {
    return null;
  }

  const row = await knex(schemas.event)
    .select('uid')
    .where({ slug })
    .first();

  return row ? row.uid : null;
}

function init( svc, c ) {

  config = c;

  knex = c.knex;

  schemas = c.schemas;

  service = svc;

}

module.exports = _.extend( slugToUid, { init } );
