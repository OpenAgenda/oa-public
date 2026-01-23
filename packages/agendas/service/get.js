import _ from 'lodash';
import VError from '@openagenda/verror';
import utils from '@openagenda/utils';
import map from './databaseFieldMap.js';
import validate from './validate/index.js';
import validateOptions from './validate/getOptions.js';
import mapper from './lib/dbMapper.js';
import * as sUtils from './lib/utils.js';

const dbParse = mapper(map);

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

function _parseGetArguments(identifiers, options) {
  return {
    identifiers: sUtils.identifiers.clean(identifiers),
    options: validateOptions(options),
  };
}

async function get({ knex, schemas, service, imagePath }, i, o) {
  const { identifiers, options } = _parseGetArguments(i, o);

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

  return options.instanciate ? new service.Agenda(agenda, service) : agenda;
}

async function findOne(
  { knex, schemas, service, imagePath },
  search,
  options = {},
) {
  const rows = await knex(schemas.agenda)
    .select('id')
    .where('title', 'like', `%${search}%`)
    .limit(1);

  if (!rows.length) return null;
  return get({ knex, schemas, service, imagePath }, rows[0].id, options);
}

export default get;
export { findOne };
