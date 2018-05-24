"use strict";

/**
 * agenda stakeholder settings; field requirements, mainly.
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = require('@openagenda/utils'),
    logger = require('@openagenda/logs'),
    storeLib = require('@openagenda/mysql-table-store'),
    w = require('when'),
    validator = require('../iso/validator'),
    customFormat = require('./customFormat'),
    defaultFields = require('../iso/defaults').fields,
    legacyLib = require('./legacy');

var knex = void 0,
    schemas = void 0,
    log = void 0,
    store = void 0;

module.exports = Object.assign(settings, { init: init });

function settings(agendaId) {

  var legacy = legacyLib(agendaId);

  return {

    get: get,
    set: set,
    setDefault: setDefault,
    clear: clear,

    custom: {
      validate: validateCustomValues,
      toValues: toCustomValues,
      toFields: toCustomFields
    }

  };

  function get(cb) {

    store.get(agendaId, function (err, settings) {

      if (err) return cb(err);

      if (settings) return cb(null, settings);

      legacy.get(cb);
    });
  }

  function setDefault(cb) {

    store.set(agendaId, { fields: defaultFields }, function (err) {

      if (err) return cb(err);

      legacy.setDefault(cb);
    });
  }

  function set(settings, cb) {

    var errors = _validate(settings.fields);

    if (errors.length) return cb(err);

    store.set(agendaId, settings, cb);
  }

  function clear(clearLegacy, cb) {

    if (arguments.length !== 2) {

      cb = clearLegacy;
      clearLegacy = true;
    }

    store.set(agendaId, null, function (err) {

      if (err) return cb(err);

      if (clearLegacy) {

        legacy.clear(cb);
      } else {

        cb();
      }
    });
  }

  function toCustomFields(data, cb) {

    get(function (err, settings) {

      if (err) return cb(err);

      cb(null, customFormat.getFieldValues(data, settings), settings);
    });
  }

  function toCustomValues(data, cb) {

    get(function (err, settings) {

      if (err) return cb(err);

      cb(null, customFormat.getValues(data, settings));
    });
  }

  function validateCustomValues(values, cb) {

    _getCustomValidator(function (err, validator, settings) {

      if (err) return cb(err);

      var errors = [],
          clean = undefined;

      try {

        var dirty = {};

        Object.keys(values).map(function (k) {

          dirty[k] = _typeof(values[k]) === 'object' ? values[k].label : values[k];
        });

        clean = validator(dirty);
      } catch (e) {

        errors = e;
      };

      cb(null, {
        valid: !errors.length,
        clean: clean,
        errors: errors,
        settings: settings
      });
    });
  }

  /**
   * fields validator validates a stakeholder custom fields set
   */

  function _getCustomValidator(cb) {

    get(function (err, settings) {

      if (err) return cb(err);

      cb(null, validator(settings.fields), settings);
    });
  }
}

/**
 * yo dawg, you want to validate the validation data
 */
function _validate(fields) {

  var errors = [];

  fields.forEach(function (f, i) {

    try {

      if (f.field === undefined) {

        throw 'field attribute is not set at index ' + i;
      }

      if (f.type === undefined) {

        throw 'field type is not set at index ' + i;
      }
    } catch (e) {

      errors.push(e);
    }
  });

  return errors;
}

function init(config) {

  var d = w.defer();

  schemas = config.schemas;

  knex = config.knex;

  storeLib({
    table: config.schemas.stakeholderSettings,
    promisedQuery: function promisedQuery(query, values) {
      return knex.raw(query, values).then(function (result) {
        return result[0];
      });
    }
  }, function (err, s) {

    if (err) return d.reject(err);

    store = s;

    d.resolve();
  });

  return d.promise;
}
//# sourceMappingURL=settings.js.map