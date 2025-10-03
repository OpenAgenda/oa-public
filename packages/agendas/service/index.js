'use strict';

const crypto = require('node:crypto');
const _ = require('lodash');
const knexLib = require('knex');
const logger = require('@openagenda/logs');
const middleware = require('../middleware');
const Agenda = require('./Agenda');
const get = require('./get');
const legacy = require('./legacy');
const list = require('./list');
const remove = require('./remove');
const set = require('./set');
const slugs = require('./slugs');
const omitInternals = require('./lib/omitInternals');
const filterByAccess = require('./validate/fields/filterByAccess');
const contributionTypes = require('./validate/contributionTypes');
const credentials = require('./validate/fields/credentials');

let knex;
let config;
let schemas;

const service = {
  // init,
  list,
  get,
  findOne: get.findOne,
  Agenda,
  instanciate: (data) => new Agenda(data),
  middleware, // deprecated
  set,
  remove,
  // count,
  slugs: {
    isTaken: slugs.isTaken,
    generate: slugs.generate,
  },
  getConfig: () => config,
  contributionTypes,
  utils: {
    omitInternals,
    filterByAccess,
    credentials,
  },
};

function init(c) {
  schemas = c.schemas;

  config = c;

  knex = _.get(c, 'knex')
    || knexLib({
      client: 'mysql2',
      connection: c.mysql,
    });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  const { gm } = c.Files;

  config.upload = c.Files({
    key: 'image',
    variants: [
      {
        getFilename: (info, context) =>
          `agenda${context.uid}.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
        transform: (info, context) => {
          context.providerParams.ContentType = 'image/jpeg';

          return gm(info.stream, context.originalname)
            .autoOrient()
            .noProfile()
            .resize(300, 300, '^')
            .gravity('Center')
            .crop(300, 300)
            .stream('jpg');
        },
      },
      {
        getFilename: (info, context) =>
          `rwtbagenda${context.uid}.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
        transform: (info, context) => {
          context.providerParams.ContentType = 'image/jpeg';

          return gm(info.stream, context.originalname)
            .autoOrient()
            .noProfile()
            .resize(100, 100, '^')
            .gravity('Center')
            .crop(100, 100)
            .stream('jpg');
        },
      },
      {
        getFilename: (info, context) =>
          `agenda${context.uid}_o.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
        transform: (info, context) => {
          context.providerParams.ContentType = 'image/jpeg';

          return gm(info.stream, context.originalname)
            .autoOrient()
            .noProfile()
            .stream('jpg');
        },
      },
    ],
  });

  get.init(service, knex);

  set.init(service, knex);

  remove.init(service, knex);

  list.init(service, knex);

  Agenda.init(service);

  slugs.init(schemas, knex);

  legacy.init(schemas, knex);

  middleware.init(c, service);
}

function count(cb) {
  list({}, null, null, { total: true }, (err, agendas, total) => {
    if (err) cb(err);

    cb(null, total);
  });
}

service.init = init;
service.count = count;

module.exports = service;
