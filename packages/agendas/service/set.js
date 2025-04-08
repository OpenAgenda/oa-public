'use strict';

const _ = require('lodash');
const slugify = require('slugify');

const logs = require('@openagenda/logs');
const defineUnique = require('@openagenda/mysql-utils/defineUnique');
const verifyUnique = require('@openagenda/mysql-utils/verifyUnique');
const dbMapper = require('@openagenda/mysql-utils/mapper');

const get = require('./get');
const legacy = require('./legacy');
const map = require('./databaseFieldMap');
const validate = require('./validate');

const dbParse = dbMapper(map);
const log = logs('set');

let knex;
let schemas;
let mysqlConfig;
let interfaces;
let upload;

function _validate(target) {
  return (v) => {
    try {
      v.clean = validate(v[target]);
    } catch (e) {
      log('validation failed with %s errors: %s', e.length, e);

      v.errors = v.errors.concat(e);
    }

    return v;
  };
}

async function _profileImage(v) {
  const { image } = v.data;

  if (image && typeof image !== 'string') {
    try {
      log.info('start uploading the agenda profile image');

      const uid = v.current ? v.current.uid : v.data.uid;
      const result = await upload(image, { uid });

      v.clean.image = `${result[0].uploadValue.key}?__ts=${new Date().getTime()}`;

      log.info('upload completed');
    } catch (e) {
      log.error('upload error:', e);

      if (v.current) {
        v.clean.image = v.current.image;
      }

      v.errors.push({
        field: 'image',
        code: 'image.invalid',
        message: 'invalid image',
      });
    }
  } else if (image === null) {
    try {
      v.clean.image = null;

      if (v.current && v.current.image) {
        await upload.providers.s3.remove(v.current.image);
      }
    } catch (e) {
      log.error('error deleting the profile image:', e);

      v.errors.push({
        field: 'image',
        code: 'image.remove',
        message: 'invalid image',
      });
    }
  } else if (v.current) {
    v.clean.image = v.current.image;
  }

  return v;
}

function _doUpdate(v) {
  if (v.errors.length) return v;

  return knex(schemas.agenda)
    .where({
      id: v.id,
    })

    .update(dbParse.toDb(v.clean))

    .then((affected) => {
      v.success = !!affected;

      if (v.success) {
        log('info', 'updated agenda %s', v.id);
      }

      return v;
    });
}

function _applyToLegacy(v) {
  if (!v.success) return v;

  return new Promise((rs) => {
    legacy(v.id).applyToLegacy(v.clean, (err) => {
      if (err) {
        log('error', {
          message: 'agenda legacy save triggered error',
          error: err,
        });
      } else {
        log('applied agenda configuration to legacy data structure');
      }
      rs(v);
    });
  });
}

function _doCreate(v) {
  if (v.errors.length) {
    log('create will not proceed');

    return v;
  }

  _.set(v, 'clean.credentials.useContributeApp', true);
  // _.set(v, 'clean.credentials.useAgendaSchema', true);
  _.set(v, 'clean.credentials.useJSONBridge', true);

  return knex(schemas.agenda)
    .insert(dbParse.toDb(v.clean))

    .then((result) => {
      v.success = !!(result && result[0]);

      if (!v.success) return v;

      log(
        'info',
        'agenda of slug %s, uid %s, id %s successfully created',
        v.clean.slug,
        v.clean.uid,
        result[0],
      );

      [v.id] = result;

      v.identifiers = { id: v.id };

      return v;
    });
}

function _areIdentifiers(identifiers) {
  if (typeof identifiers === 'number') return true;

  return !Object.keys(identifiers)

    .filter((k) => ['id', 'uid', 'slug'].indexOf(k) === -1).length;
}

function _createUid(v) {
  return new Promise((rs, rj) => {
    defineUnique(
      {
        table: schemas.agenda,
        field: 'uid',
        mysql: mysqlConfig,
      },
      () => Math.ceil(Math.random() * 99999999),
      (err, uid) => {
        if (err) return rj(err);

        v.data.uid = uid;

        log('created uid %s', uid);

        rs(v);
      },
    );
  });
}

function _createSlugIfNotSet(v) {
  if (v.data.slug) return v;

  return new Promise((rs, rj) => {
    defineUnique(
      {
        table: schemas.agenda,
        field: 'slug',
        mysql: mysqlConfig,
      },
      (previousSlug) =>
        slugify(v.data.title || '', { lower: true, strict: true })
        + (previousSlug ? Math.ceil(Math.random() * 1000) : ''),
      (err, slug) => {
        if (err) return rj(err);

        log('created slug %s', slug);

        v.data.slug = slug;

        rs(v);
      },
    );
  });
}

function _verifyUnique(field) {
  return (v) => {
    log('verifying unique %s', field);

    return new Promise((rs, rj) => {
      // value checked for unicity is from data for create
      // from merged values in case of update
      const value = dbParse.toDb(v.id ? v.merged : v.data)[field];

      verifyUnique(
        {
          table: schemas.agenda,
          field,
          value,
          exclude: v.id ? { id: v.id } : false,
          mysql: mysqlConfig,
        },
        (err, is) => {
          if (err) return rj(err);

          if (is) {
            log('%s is unique', field);

            return rs(v);
          }

          log('%s is not unique', field);

          v.errors.push({
            field,
            code: 'duplicate',
            message: 'duplicate value found',
            origin: value,
          });

          return rs(v);
        },
      );
    });
  };
}

/**
 * filters out protected fileds from given object if protected option is set
 */
function _filterProtected(namespace, v) {
  if (!v.protected) return v;

  const data = v[namespace] || {};

  v[namespace] = {};

  Object.keys(data).forEach((k) => {
    if (!dbParse.is('obj', k, 'protected')) {
      v[namespace][k] = data[k];
    }
  });

  return v;
}

function _merge(v) {
  v.merged = _.mergeWith({}, v.current, v.data, (obj, src, key) => {
    if (key === 'filters') {
      return src;
    }

    if (Array.isArray(src) && key === 'moderateOnChangeBy') {
      return src;
    }
  });

  return v;
}

function _setToNow(target, field) {
  return (v) => {
    v[target][field] = new Date();

    return v;
  };
}

function _get(options) {
  const params = _.extend(
    {
      clean: false,
      target: 'agenda',
      internal: false,
      private: false,
      prerequisite: () => true,
    },
    options,
  );

  return (v) => {
    if (!params.prerequisite(v)) {
      log('get will not proceed for target %s', params.target);

      return v;
    }

    return new Promise((rs, rj) => {
      get(
        v.id ? { id: v.id } : v.identifiers,
        {
          internal: params.internal,
          includeImagePath: params.includeImagePath,
          private: params.private,
        },
        (err, data) => {
          if (err) return rj(err);

          if (!data) return rj(new Error('agenda not found'));

          log('retrieved agenda of uid %s', data.uid);

          v.id = data.id;

          v[params.target] = data;

          rs(v);
        },
      );
    });
  };
}

function _timestampOfficial(v) {
  if (!v.current.official && v.merged.official) {
    v.merged.officializedAt = new Date();
  }

  return v;
}

function _update(identifiers, data, o, c) {
  const options = o instanceof Function ? {} : o;
  const cb = o instanceof Function ? o : c;

  const params = _.extend(
    {
      // option defaults
      protected: true, // protected fields cannot be tampered with
      internal: false, // retrieve internal fields when update is done
      private: false,
      includeImagePath: false,
      context: null,
    },
    options,
  );

  return (
    new Promise((rs) =>
      rs(
        _.extend({}, params, {
          // unoptionables
          identifiers,
          id: false,
          data: { ...data },
          filteredData: null, // after protected values have been removed from input
          current: false, // what is in db before update
          merged: false, // merge of input and current db values
          clean: null, // after validation
          updated: null,
          errors: [], // validation errors
        }),
      ))

      .then(
        _get({ target: 'current', internal: true, private: params.private }),
      )

      .then(_merge)

      .then(_setToNow('merged', 'updatedAt'))

      .then(_timestampOfficial)

      .then(_validate('merged'))

      // filter must happen after validate to avoid
      // incomplete data validation errors
      .then(_filterProtected.bind(null, 'clean'))

      .then(_verifyUnique('slug'))

      .then(_profileImage)

      .then(_doUpdate)

      .then(_applyToLegacy)

      .then(
        _get({
          target: 'updated',
          internal: true,
          prerequisite: (v) => v.success && !v.errors.length,
          includeImagePath: params.includeImagePath,
          private: params.private,
        }),
      )

      .then(
        (v) => {
          if (v.success && interfaces) {
            interfaces.onUpdate(v.current, v.updated, v.context);
          }

          const result = {
            agenda: params.internal
              ? v.updated
              : dbParse.exclude(v.updated, 'internal'),
            valid: !v.errors.length,
            success: v.success,
            errors: v.errors,
          };

          if (cb) {
            cb(null, result);
          } else {
            return result;
          }
        },
        (error) => {
          if (cb) {
            return cb(error);
          }
          throw error;
        },
      )
  );
}

function _create(data, o, c) {
  const options = o instanceof Function ? {} : o;
  const cb = o instanceof Function ? o : c;

  const params = _.extend(
    {
      internal: false,
      includeImagePath: false,
    },
    options,
  );

  return new Promise((rs) =>
    rs(
      _.extend({}, params, {
        id: false,
        data: { ...data },
        clean: null,
        created: null,
        errors: [],
        identifiers: null,
        success: false,
      }),
    ))

    .then(_createUid)

    .then(_createSlugIfNotSet)

    .then(_verifyUnique('slug'))

    .then(_setToNow('data', 'updatedAt'))

    .then(_setToNow('data', 'createdAt'))

    .then(_validate('data'))

    .then(_profileImage)

    .then(_doCreate)

    .then(_applyToLegacy)

    .then(
      _get({
        target: 'created',
        internal: true,
        prerequisite: (v) => v.success && !v.errors.length,
        includeImagePath: params.includeImagePath,
      }),
    )

    .then(
      async (v) => {
        const response = {
          agenda: params.internal
            ? v.created
            : dbParse.exclude(v.created, 'internal'),
          valid: !v.errors.length,
          success: v.success,
          errors: v.errors,
        };

        if (v.success && _.get(interfaces, 'onCreate')) {
          try {
            await interfaces.onCreate(v.created);
          } catch (e) {
            log('error', 'interface onCreate call errored', e);
          }
        }

        if (cb) {
          cb(null, response);
        } else {
          return response;
        }
      },
      (error) => {
        if (cb) {
          return cb(error);
        }
        throw error;
      },
    );
}

function init(s, k) {
  schemas = s.getConfig().schemas;

  knex = k;

  mysqlConfig = s.getConfig().mysql;

  interfaces = s.getConfig().interfaces;

  upload = s.getConfig().upload;
}

function set(...args) {
  if (_areIdentifiers(args[0])) {
    return _update(...args);
  }

  return _create(...args);
}

module.exports = Object.assign(set, { init });
