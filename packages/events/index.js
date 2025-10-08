import knex from 'knex';
import logs from '@openagenda/logs';
import fromItemToEntry from '@openagenda/utils/fields/fromItemToEntry.js';
import fromEntryToItem from '@openagenda/utils/fields/fromEntryToItem.js';
import getFieldsByAccess from '@openagenda/utils/fields/getFieldsByAccess.js';
import create from './create.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';
import countByLocationUids from './countByLocationUids.js';
import imageVariants from './lib/imageVariants.js';
import utils from './utils/index.js';
import fields from './lib/fields.js';

const createService = (c) => {
  const config = Object.keys(c).reduce(
    (carriedConfig, key) =>
      (carriedConfig[key] !== undefined && c[key] !== undefined
        ? {
          ...carriedConfig,
          [key]: c[key],
        }
        : carriedConfig),
    {
      imagePath: '',
      defaultImage: null,
      Files: null,
      schema: 'event_2',
      maxImageSize: 20971520, // 20MB
      interfaces: null,
    },
  );

  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  const service = {
    config,
    clients: {
      knex:
        c.knex
        || knex({
          client: 'mysql2',
          connection: { ...config.mysql },
        }),
    },
    imageTransformAndUpload:
      config.Files
      && config.Files({
        key: 'image',
        variants: imageVariants(config.Files),
      }),
    interfaces: config.interfaces,
    fieldUtils: {
      fromItemToEntry: fromItemToEntry.bind(null, fields),
      fromEntryToItem: fromEntryToItem.bind(null, fields),
      getFieldsByAccess: getFieldsByAccess.bind(null, fields),
    },
  };

  return {
    create: create.bind(null, service),
    get: get.bind(null, service),
    list: list.bind(null, service),
    countByLocationUids: countByLocationUids.bind(null, service),
    patch: update.bind(null, { service, isPatch: true }),
    remove: remove.bind(null, service),
    update: update.bind(null, { service }),
    middleware: {
      imageTransformAndUpload: service.imageTransformAndUpload?.middleware,
    },
    utils,
  };
};

export default Object.assign(createService, { utils });
