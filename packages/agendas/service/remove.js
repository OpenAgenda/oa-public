'use strict';

const w = require('when');
const sUtils = require('./lib/utils');

let knex;
let interfaces;
let service;
let schemas;

function _get(v) {
  const d = w.defer();

  service.get(
    v.identifiers,
    { internal: true, private: null },
    (err, agenda) => {
      if (err) return d.reject(err);

      v.agenda = agenda;

      d.resolve(v);
    },
  );

  return d.promise;
}

function _doRemove(v) {
  if (!v.agenda) {
    return v;
  }

  return knex(schemas.agenda)
    .where('id', v.agenda.id)

    .del()

    .then((removedRows) => {
      v.success = !!removedRows;

      return v;
    });
}

function _before(v) {
  if (!interfaces || !interfaces.beforeRemove || !v.agenda) {
    return v;
  }

  const d = w.defer();

  interfaces.beforeRemove(v.agenda, (err) => {
    if (err) return d.reject(err);

    d.resolve(v);
  });

  return d.promise;
}

function init(s, k) {
  const config = s.getConfig();

  service = s;

  knex = k;

  schemas = config.schemas;

  interfaces = config.interfaces;
}

module.exports = Object.assign(
  (identifiers, cb) => {
    w({
      identifiers: sUtils.identifiers.clean(identifiers),
      agenda: null,
      success: null,
    })
      .then(sUtils.identifiers.check)

      .then(_get)

      .then(_before)

      .then(_doRemove)

      .done((v) => {
        if (v.success && interfaces && interfaces.onRemove) {
          interfaces.onRemove(v.agenda);
        }

        cb(null, {
          success: v.success,
        });
      }, cb);
  },
  { init },
);
