"use strict";

var validators = require('@openagenda/validators'),
    _ = require('lodash'),
    w = require('when'),
    slug = require('slug'),
    logger = require('@openagenda/logs'),
    format = require('./format');

var knex = void 0,
    schemas = void 0,
    log = void 0;

module.exports = instanciate;

module.exports.init = init;

function instanciate(agendaService) {

  return function (data) {

    var stakeholder = _.extend({
      custom: {}
    }, data);

    return {

      // get current stakeholder validity state with eventual validation errors
      isValid: isValid,

      // retrieve field values
      getFieldValues: getFieldValues,

      // set field values
      setFieldValues: setFieldValues,

      save: save

    };

    function isValid(cb) {

      getFieldValues(function (err, fields, result) {

        if (err) return cb(err);

        cb(null, result.valid, result.errors);
      });
    }

    /**
     * set field values
     */
    function setFieldValues(fieldValues, options, cb) {

      if (arguments.length === 2) {

        cb = options;
        options = {};
      }

      var params = Object.assign({
        force: false, // force set of field values and ignore validation
        save: true
      }, options);

      var underscored = _.mapKeys(fieldValues, function (v, k) {
        return _.snakeCase(k);
      });

      agendaService.settings.custom.validate(underscored, function (err, result) {

        if (err) return cb(err);

        if (!params.force && !result.valid) {

          return cb(null, {
            success: false,
            valid: false,
            errors: result.errors
          });
        }

        // no clean values is returned if data is not validated
        var toCommit = params.force && !result.valid ? fieldValues : result.clean;

        agendaService.settings.custom.toValues(toCommit, function (err, values) {

          if (err) return cb(err);

          stakeholder.custom = values;

          if (!params.save) return cb(null);

          save({ force: true }, function (err) {

            if (err) return cb(err);

            cb(null, {
              success: true,
              valid: result.valid,
              errors: result.errors,
              data: values
            });
          });
        });
      });
    }

    /**
     * extract field values from custom data
     */

    function getFieldValues(cb) {

      agendaService.settings.custom.toFields(stakeholder.custom, function (err, fieldValues, settings) {

        if (err) return cb(err);

        agendaService.settings.custom.validate(fieldValues, function (err, result) {

          if (err) return cb(err);

          cb(null, fieldValues, result);
        });
      });
    }

    /**
     * commit to db current stakeholder state
     */
    function save(options, cb) {

      if (arguments.length == 1) {

        cb = options;

        options = {};
      }

      w(_.extend({
        force: false,
        valid: null,
        saved: false
      }, options))

      // validate custom fields
      .then(function (v) {

        if (v.force) return v;

        var d = w.defer();

        isValid(function (err, is, errors) {

          if (err) return d.reject(err);

          v.valid = is;

          v.errors = errors;

          d.resolve(v);
        });

        return d.promise;
      })

      // execute update
      .done(function (v) {

        if (!v.force && !v.valid) {

          return cb(null, {
            saved: false,
            valid: false,
            errors: v.errors
          });
        }

        stakeholder.updatedAt = new Date();

        if (_isNew()) {

          stakeholder.createdAt = new Date();
        }

        var op = knex.from(schemas.stakeholder);

        if (_isNew()) {

          op.insert(format.objToDb(stakeholder));
        } else {

          op.update(format.objToDb(stakeholder)).where({ id: stakeholder.id });
        }

        op.asCallback(function (err, result) {

          if (err) return cb(err);

          if (_isNew()) {

            stakeholder.id = result[0];
          }

          cb(null, {
            saved: true,
            valid: v.valid,
            errors: v.errors,
            stakeholder: stakeholder
          });
        });
      }, cb);
    }

    function _isNew() {

      return !stakeholder.id;
    }

    /**
     * prepare field values for a commit to db
     * ( camel cased, with slugs when required )
     */
    function _prepareFieldValues(cb) {

      getFieldValues(function (err, fieldValues, valid, settings) {

        if (err) return cb(err);

        var decorated = {};

        Object.keys(fieldValues).forEach(function (k) {

          var fieldSettings = settings.fields.filter(function (f) {
            return f.field === k;
          });

          if (!fieldSettings.length) return;

          if (fieldSettings[0].slugged) {

            decorated[k] = {
              label: fieldValues[k],
              slug: slug(fieldValues[k], { lower: true })
            };
          } else {

            decorated[k] = fieldValues[k];
          }
        });

        cb(null, decorated);
      });
    }
  };
}

function init(config) {

  log = logger('instanciate');

  schemas = config.schemas;

  knex = config.knex;
}
//# sourceMappingURL=instanciate.js.map