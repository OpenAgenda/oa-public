'use strict';

const utils = require('@openagenda/utils');
const generate = require('./generate');
const validateSlug = require('./validator')();

let schemas;
let knex;

function isTaken(...args) {
  let slug;
  let options;
  let cb;

  if (arguments.length === 2) {
    [slug, cb] = args;
    options = {};
  } else {
    [slug, options, cb] = args;
  }

  const params = utils.extend(
    {
      excludeUid: false,
    },
    options,
  );

  let cleanSlug = null;

  let errors = [];

  if (!knex) {
    return cb('service was not initialized');
  }

  try {
    cleanSlug = validateSlug(slug);
  } catch (e) {
    errors = e;
  }

  if (errors.length) {
    return cb(null, {
      taken: null,
      valid: false,
      errors,
    });
  }

  // look up in db

  const knexQuery = knex(schemas.agenda)
    .select('id')

    .where({ slug: cleanSlug });

  if (params.excludeUid) {
    knexQuery.andWhereNot({
      uid: params.excludeUid,
    });
  }

  knexQuery.then((rows) => {
    cb(null, {
      taken: !!rows.length,
      valid: true,
      errors: [],
    });
  }, cb);
}

module.exports = {
  init(s, k) {
    schemas = s;
    knex = k;
  },
  isTaken,
  generate,
};
