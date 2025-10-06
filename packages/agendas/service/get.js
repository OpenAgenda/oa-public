'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const utils = require('@openagenda/utils');
const map = require('./databaseFieldMap');
const validate = require('./validate');
const validateOptions = require('./validate/getOptions');
const mapper = require('./lib/dbMapper');
const sUtils = require('./lib/utils');

const dbParse = mapper(map);

let knex;
let service;
let schemas;
let imagePath;

/**
 * in db, values are null when they are not defined.
 * In those cases, default value should apply.
 */

function _applyDefaults(data) {
  const defaulted = utils.extend({}, validate.default);

  Object.keys(data).forEach((k) => {
    defaulted[k] = _.includes(['null', '{}'], JSON.stringify(data[k]))
      ? defaulted[k]
      : data[k];
  });

  return defaulted;
}

async function promise(identifiers, options = {}) {
  if (!_.keys(identifiers).length) {
    throw new Error(
      `No known identifiers specified for get: ${JSON.stringify(identifiers)}`,
    );
  }

  const k = knex(schemas.agenda)
    .first(dbParse.fields('db', options.internal, ['id']))
    .where(identifiers);

  if (options.private !== null) k.andWhere('private', options.private);

  let rawAgenda;

  try {
    const result = await k;

    rawAgenda = result ? _applyDefaults(dbParse.toObj(result, false)) : null;
  } catch (e) {
    throw new VError(e, 'failed to parse agenda %j values', identifiers);
  }

  if (!rawAgenda) return null;

  const agenda = _.keys(rawAgenda).reduce((filtered, field) => {
    if (options.internal || !dbParse.is('obj', field, 'internal')) {
      filtered[field] = rawAgenda[field];
    }

    return filtered;
  }, {});

  if (options.includeImagePath && agenda.image) {
    agenda.image = imagePath + agenda.image;
  } else if (options.useDefaultImage && !agenda.image) {
    agenda.image = service.getConfig().defaultImagePath;
  }

  return options.instanciate ? new service.Agenda(agenda) : agenda;
}

function _parseGetArguments(identifiers, options, cb) {
  if (typeof cb === 'function') {
    return {
      identifiers: sUtils.identifiers.clean(identifiers),
      options: validateOptions(options),
      cb,
    };
  }

  if (typeof options === 'function') {
    return {
      identifiers: sUtils.identifiers.clean(identifiers),
      options: validateOptions(),
      cb: options,
    };
  }

  return {
    identifiers: sUtils.identifiers.clean(identifiers),
    options: validateOptions(options),
    cb: null,
  };
}

function get(i, o, c) {
  const { identifiers, options, cb } = _parseGetArguments(i, o, c);

  const p = promise(identifiers, options);

  if (cb) return p.then((agenda) => cb(null, agenda), cb);

  return p;
}

function findOne(...args) {
  let search;
  let options = {};
  let cb;

  if (arguments.length === 2) {
    [search, cb] = args;
  } else {
    [search, options, cb] = args;
  }

  const query = knex(schemas.agenda)
    .select('id')
    .where('title', 'like', `%${search}%`)
    .limit(1)
    .then((rows) => {
      if (!rows.length) return null;
      return get(rows[0].id, options);
    });

  if (typeof cb === 'function') {
    query.then((result) => cb(null, result)).catch(cb);
  } else {
    return query;
  }
}

function init(svc, k) {
  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;
}

module.exports = get;
module.exports.init = init;
module.exports.findOne = findOne;
