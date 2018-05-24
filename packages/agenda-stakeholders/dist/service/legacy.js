"use strict";

var _ = require('lodash');
var w = require('when');

var defaultFields = require('../iso/defaults').fields;

var defaultSettings = {
  fields: []
};

var knex = void 0,
    schemas = void 0;

module.exports = Object.assign(function (agendaId) {

  return {
    get: get,
    setDefault: setDefault,
    clear: clear
  };

  function get(cb) {

    w().then(function () {

      return knex(schemas.agenda).where({
        id: agendaId
      }).limit(1).offset(0);
    }).then(function (rows) {

      var store = {},
          s = _.extend({}, defaultSettings);

      if (!rows.length) {

        return s;
      }

      try {

        store = JSON.parse(rows[0].store || '{}');
      } catch (e) {

        log('error', 'could not parse store: %s', rows[0].store);

        return s;
      }

      if (!store.cFields) {

        return s;
      }

      return _.extend({}, defaultSettings, {

        fields: Object.keys(store.cFields).map(function (f) {
          return defaultFields.filter(function (lf) {
            return lf.field == f;
          })[0];
        })

      });
    }).done(function (settings) {
      return cb(null, settings);
    }, cb);
  }

  function clear(cb) {

    w().then(function () {

      return knex(schemas.agenda).select('store').where({
        id: agendaId
      });
    }).then(function (rows) {

      var store = void 0;

      if (!rows.length) {

        throw new Error('agenda not found: ' + agendaId);
      }

      try {

        store = JSON.parse(rows[0].store);
      } catch (e) {

        throw new Error('could not parse store of agenda ' + agendaId);
      }

      return store;
    }).then(function (store) {

      store.cFields = undefined;

      return knex(schemas.agenda).update({ store: JSON.stringify(store) }).where({ id: agendaId });
    }).then(function (affected) {

      if (!affected) {

        throw new Error('could not complete store update of agenda ' + agendaId);
      }
    }).done(function () {
      return cb();
    }, cb);
  }

  function setDefault(cb) {

    w().then(function () {

      return knex(schemas.agenda).select('store').where({ id: agendaId }).then(function (rows) {

        if (!rows.length) {

          throw new Error('did not find agenda ' + agendaId);
        }

        try {

          return JSON.parse(rows[0].store || '{}');
        } catch (e) {

          throw new Error('could not parse store of agenda ' + agendaId);
        }
      });
    }).then(function (store) {

      store.cFields = {};

      defaultFields.forEach(function (d) {

        store.cFields[d.field] = [];
      });

      return store;
    }).then(function (store) {

      return knex(schemas.agenda).update({ store: JSON.stringify(store) }).where({ id: agendaId });
    }).then(function (affected) {

      if (!affected) throw new Error('could not update store of agenda ' + agendaId);
    }).done(function () {
      return cb();
    }, cb);
  }
}, { init: init });

function init(c) {

  knex = c.knex;

  schemas = c.schemas;
}
//# sourceMappingURL=legacy.js.map