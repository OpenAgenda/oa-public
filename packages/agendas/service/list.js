'use strict';

const _ = require('lodash');
const mapper = require('@openagenda/mysql-utils/mapper');
const parseListArguments = require('@openagenda/service-utils/parseListArguments');
const map = require('./databaseFieldMap');

const dbParse = mapper(map);

const validateQuery = require('./validate/listQuery');
const validateOptions = require('./validate/listOptions');
const fields = require('./validate/fields');

const credentialFields = fields.find((f) => f.field === 'credentials').fields;

let service;
let schemas;
let imagePath;
let knex;

function _includeLegacyQuery(clean, options, query) {
  _.keys(clean).forEach((k) => {
    if (options[k] === undefined && query[k] !== undefined) {
      console.log('%s in query is DEPRECATED. set in options instead', k);
      clean[k] = query[k];
      query[k] = undefined;
    }
  });

  return options;
}

function _search(k, query, options) {
  if (options.private !== null) {
    k.where('private', options.private);
  }
  if (options.indexed !== null) {
    k.where('indexed', options.indexed);
  }
  if (query.ids || query.id) {
    k.whereIn('id', query.id || query.ids);
  }
  if (query.uid) {
    k.whereIn(
      'uid',
      query.uid.filter((uid) => !!uid),
    );
  }
  if (query.slug) {
    k.whereIn(
      'slug',
      query.slug.filter((slug) => !!slug),
    );
  }
  if (query.networkUid) {
    k.where('network_uid', query.networkUid);
  }
  if (query.updatedAtGreaterThan) {
    k.where('updated_at', '>', query.updatedAtGreaterThan);
  }
  if (query.idGreaterThan) {
    k.where('id', '>', query.idGreaterThan);
  }
  if (query.credentials) {
    // Only to remove eslint error "no-loop-func" on knex
    const safeKnex = knex;

    for (const key in query.credentials) {
      if (!Object.hasOwn(query.credentials, key)) {
        continue;
      }
      const value = query.credentials[key];
      if (typeof value !== 'boolean') {
        continue;
      }
      k.where((builder) => {
        builder.whereRaw('JSON_CONTAINS(credentials, ?, ?)', [
          query.credentials[key].toString(),
          `$.${key}`,
        ]);

        const defaultValue = credentialFields.find(
          (field) => field.field === key,
        ).default;

        if (query.credentials[key] === defaultValue) {
          builder.orWhereNot(
            safeKnex.raw("JSON_CONTAINS_PATH(credentials, 'all', ?)", [
              `$.${key}`,
            ]),
          );
        }
      });
    }
  }

  if (query.memberUserUid) {
    k.whereExists(function () {
      this.select(1)
        .from({ r: schemas.stakeholder })
        .whereColumn('r.agenda_uid', `${schemas.agenda}.uid`)
        .where('r.user_uid', query.memberUserUid);
    });
  }

  if (!query.search) return k;

  k[query.ids || query.id ? 'andWhere' : 'where'](function () {
    this.where('title', 'like', `%${query.search}%`)
      .orWhere('description', 'like', `%${query.search}%`)
      .orWhere('slug', 'like', `%${query.search}%`);
  });

  return k;
}

async function _total(k) {
  return knex
    .transaction((trx) => k.clone().count('id as total').transacting(trx))
    .then((r) => _.get(r, '0.total'));
}

function _listFields(options) {
  return map
    .filter((field) => {
      if (field?.db === 'id') {
        return true;
      }

      if (
        options.onlyIncludeFields.length
        && !options.onlyIncludeFields.includes(field.obj || field)
      ) {
        return false;
      }

      if (typeof field === 'string') {
        return true;
      }

      if (options.includeFields.includes(field.obj)) {
        return true;
      }

      if (field.list === false) {
        return false;
      }

      if (field.internal && options.internal === false) {
        return false;
      }

      return true;
    })
    .map((f) => (typeof f === 'string' ? f : f.db));
}

function _parseDbEntry(options, config, row) {
  const agenda = dbParse.toObj(row);

  if (options.includeImagePath && agenda.image) {
    agenda.image = imagePath + agenda.image;
  } else if (options.useDefaultImage && !agenda.image) {
    agenda.image = config.defaultImagePath;
  }

  return agenda;
}

async function promise(query, offset, limit, options = {}) {
  const config = service.getConfig();

  const cleanOptions = validateOptions(options);

  _includeLegacyQuery(cleanOptions, options, query);

  const cleanQuery = validateQuery(query);

  if (!knex) throw new Error('service is not initialized');

  const k = _search(knex(schemas.agenda), cleanQuery, cleanOptions);

  const total = cleanOptions.total ? await _total(k) : null;

  if (cleanQuery.order) {
    k.orderBy(...cleanQuery.order.split('.').map(_.snakeCase)).orderBy(
      'id',
      'desc',
    );
  } else if (cleanOptions.offsetAsLastId) {
    k.orderBy('id', 'asc');
  } else {
    k.orderBy('updated_at', 'desc').orderBy('id', 'desc');
  }

  k.limit(limit || 0);

  if (cleanOptions.offsetAsLastId && cleanQuery.order === 'id.desc') {
    k.where('id', '<', offset);
  } else if (cleanOptions.offsetAsLastId) {
    k.where('id', '>', offset);
  } else {
    k.offset(offset || 0);
  }

  const agendas = await k
    .select(_listFields(cleanOptions))
    .then((r) => r.map(_parseDbEntry.bind(null, cleanOptions, config)));

  const lastId = _.get(_.last(agendas), 'id', -1);

  for (const agenda of agendas) {
    if (!cleanOptions.internal) {
      delete agenda.id;
    }
  }

  return {
    agendas,
    total,
    ...cleanOptions.offsetAsLastId ? { lastId } : {},
  };
}

function list(...args) {
  const { query, offset, limit, options, cb } = parseListArguments(...args);

  const p = promise(query, offset, limit, options);

  if (cb) {
    return p.then(({ agendas, total }) => cb(null, agendas, total), cb);
  }

  return p;
}

function init(svc, k) {
  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;
}

module.exports = Object.assign(list, {
  init,
});
