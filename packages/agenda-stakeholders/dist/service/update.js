"use strict";

var _ = require('lodash');

var utils = require('@openagenda/utils');

var Process = require('@openagenda/process-service');

var get = require('./get');
var format = require('./format');
var settings = require('./settings');
var types = require('../iso/credentialTypes');
var validate = require('./lib/validate.process');
var validateContext = require('./lib/validateContext.process');

var log = require('@openagenda/logs')('update');

module.exports = _.extend(update, {
  init: init
});

var interfaces = void 0,
    knex = void 0,
    schemas = void 0;

var updateProcess = new Process({
  tasks: {
    get: get,
    validate: validate,
    validateContext: validateContext,
    _merge: _merge,
    _doUpdate: _doUpdate
  },
  process: [{
    task: 'get',
    in: ['base', 'identifiers'],
    out: [{
      condition: [{ $raw: null }],
      assign: [, 'result.errors', { $raw: { 'result.success': false } }],
      end: true
    }, {
      assign: ['stakeholder']
    }]
  }, {
    task: '_merge',
    in: ['stakeholder', 'data', 'options'],
    out: [{
      assign: ['merged']
    }]
  }, {
    task: 'validate',
    in: {
      data: 'merged',
      allowPartial: 'options.allowPartial',
      settings: 'settings'
    },
    out: [{
      assign: ['result.valid', 'result.success', 'result.errors']
    }, {
      condition: false,
      end: true
    }]
  }, {
    task: 'validateContext',
    in: 'options.context',
    out: [{
      assign: ['result.valid', 'result.context']
    }, {
      condition: false,
      assign: ['result.valid',, 'result.contextErrors'],
      end: true
    }]
  }, {
    task: '_doUpdate',
    in: ['base', 'stakeholder', 'merged', 'options'],
    out: [{
      condition: false,
      assign: ['result.success', 'result.errors']
    }]
  }, {
    task: 'get',
    in: ['base', { id: 'stakeholder.id' }],
    out: [{
      condition: [{ $raw: null }],
      assign: [{ $raw: { 'result.success': false } }, {}]
    }, {
      assign: 'result.stakeholder'
    }]
  }]
});

function update(base, identifiers, data, options, cb) {

  if (arguments.length === 4) {

    cb = arguments[3];
    options = {};
  }

  updateProcess.run({
    base: base,
    settings: settings(base.agendaId),
    identifiers: identifiers,
    stakeholder: null,
    data: data,
    merged: null,
    options: _.extend({
      allowPartial: false,
      credential: null,
      userId: null,
      deletedUser: null
    }, options),
    result: {
      success: null,
      stakeholder: null,
      errors: []
    }
  }, function (err, processResult) {

    if (err) {

      return cb(err.error, null, err);
    }

    if (interfaces && interfaces.onUpdate && processResult.values.result.success) {

      interfaces.onUpdate(processResult.values.stakeholder, processResult.values.result.stakeholder, processResult.values.result.context);
    }

    cb(null, processResult.values.result, processResult.report);
  });
}

function _doUpdate(base, stakeholder, merged, options, cb) {

  var toUpdate = {
    custom: merged,
    updatedAt: new Date()
  };

  if (options.credential !== null) {

    toUpdate.credential = options.credential;
  }

  if (options.deletedUser !== null) {

    toUpdate.deletedUser = options.deletedUser;
  }

  if (options.userId) {

    if (stakeholder.userId) return cb('cannot re-assign userId');

    toUpdate.userId = options.userId;
  }

  if (options.linkStore) {

    toUpdate.linkStore = options.linkStore;
  }

  knex(schemas.stakeholder).update(_.extend(format.objToDb(toUpdate, true), options.deletedUser === true ? {
    user_id: null
  } : {})).where({
    id: stakeholder.id
  }).asCallback(function (err, result) {

    if (err) return cb(err);

    cb(null, true, []);
  });
}

function _merge(stakeholder, data, options, cb) {

  var current = utils.toCamelCase(stakeholder.custom),
      update = utils.toCamelCase(data);

  if (options.allowPartial) {

    return cb(null, _.assign({}, current, update));
  }

  cb(null, update);
}

function init(config) {

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;
}
//# sourceMappingURL=update.js.map