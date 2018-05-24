"use strict";

var _ = require('lodash');
var knexLib = require('knex');
var w = require('when');

var bulk = require('./bulk');
var create = require('./create');
var dbUtils = require('./dbUtils');
var get = require('./get');
var increment = require('./increment');
var instanciate = require('./instanciate');
var legacy = require('./legacy');
var logger = require('@openagenda/logs');
var list = require('./list');
var message = require('./message');
var remove = require('./remove');
var settings = require('./settings');
var stats = require('./stats');
var transferEvent = require('./transferEvent');
var update = require('./update');

var log = logger('index');

var knex = void 0,
    config = void 0,
    schemas = void 0;

module.exports = Object.assign(agenda, {
  init: init,
  user: user,
  agenda: agenda,
  tasks: {
    bulk: bulk.task,
    message: message.task
  },
  types: require('../iso/credentialTypes')
});

function agenda(agendaId) {

  if (!config) {

    throw new Error('service not initialized');
  }

  if (!Number.isInteger(agendaId)) {

    throw new Error('agendaId is not a number');
  }

  var s = settings(agendaId);

  // separate reference for re-use within service
  var agendaService = {},
      agendaStakeholderInstanciate = instanciate(agendaService);

  _.extend(agendaService, {
    get: instanciatedGet,
    list: list.bind(null, { agendaId: agendaId }),
    stats: stats.bind(null, { agendaId: agendaId }),
    remove: remove.bind(null, { agendaId: agendaId }),
    create: create.bind(null, { agendaId: agendaId }),
    update: update.bind(null, { agendaId: agendaId }),

    // increment stakeholder counter - optimized ( 'actions' only )..
    increment: increment.bind(null, { agendaId: agendaId }),

    bulk: bulk.bind(null, { agendaId: agendaId }),
    message: message.bind(null, { agendaId: agendaId }),

    transferEvent: transferEvent(agendaId),
    instanciate: agendaStakeholderInstanciate,
    new: newStakeholder,
    settings: {
      get: s.get,
      set: s.set,
      clear: s.clear,
      setDefault: s.setDefault,
      custom: {
        validate: s.custom.validate,
        toValues: s.custom.toValues,
        toFields: s.custom.toFields
      }
    }
  });

  return agendaService;

  function newStakeholder(options) {

    return agendaService.instanciate(_.extend({
      deletedUser: false,
      userId: null,
      credential: 1 // contributor
    }, options || {}, {
      agendaId: agendaId
    }));
  }

  function instanciatedGet(identifiers, options, cb) {

    if (arguments.length === 2) {

      cb = options;
      options = {};
    }

    get({ agendaId: agendaId }, identifiers, options, function (err, stakeholder) {

      if (err) return cb(err);

      cb(null, stakeholder && options.instanciate ? agendaService.instanciate(stakeholder) : stakeholder);
    });
  }
}

function user(userId) {

  if (!config) {

    throw 'service not initialized';
  }

  // exposed part of the service for a specific user
  var userService = {
    list: list.bind(null, { userId: userId }),
    get: get.bind(null, { userId: userId })
  };

  return userService;
}

function init(c, cb) {

  schemas = c.schemas;

  config = Object.assign({
    interfaces: false
  }, c);

  w().then(function () {

    if (c.logger) {

      logger.setModuleConfig(c.logger);
    }
  }).then(function () {

    if (knex) return;

    knex = knexLib({
      client: 'mysql',
      connection: c.mysql
      //debug: true
    });
  }).then(function () {

    legacy.init({
      knex: knex,
      schemas: schemas
    });
  }).then(function () {

    transferEvent.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    get.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    remove.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    create.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    increment.init({
      knex: knex,
      schemas: schemas
    });
  }).then(function () {

    bulk.init({
      queue: config.queue,
      interfaces: config.interfaces
    });
  }).then(function () {

    message.init({
      queue: config.queue,
      interfaces: config.interfaces
    });
  }).then(function () {

    list.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    stats.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    dbUtils.init({
      knex: knex,
      schemas: schemas
    });
  }).then(function () {

    update.init({
      knex: knex,
      schemas: schemas,
      interfaces: config.interfaces
    });
  }).then(function () {

    instanciate.init({
      knex: knex,
      schemas: schemas
    });
  }).then(function () {

    return settings.init({
      mysql: c.mysql,
      knex: knex,
      schemas: schemas
    });
  }).done(function (err) {

    log('init done');

    if (!cb) return;

    cb(err);
  });
}
//# sourceMappingURL=index.js.map