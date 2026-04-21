import crypto from 'node:crypto';
import knexLib from 'knex';
import slugify from 'slugify';
import logger from '@openagenda/logs';
import Middleware from '../middleware.js';
import Agenda from './Agenda/index.js';
import get, { findOne } from './get.js';
import list from './list.js';
import remove from './remove.js';
import set from './set.js';
import omitInternals from './lib/omitInternals.js';
import filterByAccess from './validate/fields/filterByAccess.js';
import contributionTypes from './validate/contributionTypes.js';
import credentials from './validate/fields/credentials.js';
import Unicity from './lib/Unicity/index.js';

function Agendas(c) {
  const { schemas } = c;
  const config = c;

  const knex = c?.knex
    || knexLib({
      client: 'mysql2',
      connection: { ...c.mysql },
    });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  const slugUnicity = Unicity(`${schemas.agenda}.slug`, {
    setName: 'agendaSlugUnicity',
    expiry: 1000,
    client: knex,
    redis: c.redis,
    generate: (seed, randomize = false) => {
      const slug = slugify(seed || '', { lower: true, strict: true });
      return randomize ? `${slug}-${Math.ceil(Math.random() * 1000)}` : slug;
    },
    filter: (q) => q.whereNull('deleted_at'),
  });

  const uidUnicity = Unicity(`${schemas.agenda}.uid`, {
    setName: 'agendaUidUnicity',
    expiry: 1000,
    client: knex,
    redis: c.redis,
    generate: () => Math.floor(Math.random() * 10000000),
  });

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

  // Create service object with all methods
  const service = {
    list,
    get,
    isSlugAvailable: (slug) => slugUnicity.isAvailable(slug),
    findOne: get.findOne,
    Agenda,
    instanciate: (data) => new Agenda(data, service),
    set,
    remove,
    getConfig: () => config,
    contributionTypes,
    utils: {
      omitInternals,
      filterByAccess,
      credentials,
    },
  };

  // Create a single comprehensive internals object for all service functions
  const internals = {
    knex,
    schemas: config.schemas,
    slugUnicity,
    uidUnicity,
    interfaces: config.interfaces,
    upload: config.upload,
    service,
    imagePath: config.imagePath,
  };

  // Bind dependencies to all service functions using lodash pick for clean dependency loading
  service.list = list.bind(null, {
    service: internals.service,
    schemas: internals.schemas,
    imagePath: internals.imagePath,
    knex: internals.knex,
  });
  service.set = set.bind(null, {
    knex: internals.knex,
    schemas: internals.schemas,
    slugUnicity: internals.slugUnicity,
    uidUnicity: internals.uidUnicity,
    interfaces: internals.interfaces,
    upload: internals.upload,
    service: internals.service,
    imagePath: internals.imagePath,
  });
  service.remove = remove.bind(null, {
    knex: internals.knex,
    schemas: internals.schemas,
    service: internals.service,
    interfaces: internals.interfaces,
  });
  service.get = get.bind(null, {
    knex: internals.knex,
    schemas: internals.schemas,
    service: internals.service,
    imagePath: internals.imagePath,
  });
  service.findOne = findOne.bind(null, {
    knex: internals.knex,
    schemas: internals.schemas,
    service: internals.service,
    imagePath: internals.imagePath,
  });

  service.middleware = Middleware(service);

  // Add count method to the service
  service.count = async function count() {
    const { total } = await list({}, null, null, { total: true });
    return total;
  };

  return service;
}

export default Agendas;
