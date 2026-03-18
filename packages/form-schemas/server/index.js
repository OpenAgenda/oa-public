import knex from 'knex';
import logger from '@openagenda/logs';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import merge from '@openagenda/form-schemas/iso/merge.js';
import filterByAccess from '@openagenda/form-schemas/iso/filterByAccess.js';
import flattenSchema from '@openagenda/form-schemas/iso/flattenSchema.js';
import filesMw from './middleware/files.js';

const log = logger('index');

const utils = {
  merge,
  filterByAccess,
  flattenSchema,
};

async function fetchFromDB({ client, schemas }, id) {
  return client(schemas.formSchema)
    .first(['id', 'store'])
    .where({ id })
    .then((r) =>
      (r && r.store
        ? {
          ...JSON.parse(r.store),
          id,
        }
        : null));
}

async function get(
  { client, schemas, redis, cachePrefix, cacheTTL },
  id,
  options = {},
) {
  if (!id || options?.instanciate || !redis) {
    const store = await fetchFromDB({ client, schemas }, id);
    if (!store) return null;
    return options?.instanciate ? new FormSchema(store) : store;
  }

  const cacheKey = `${cachePrefix}:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const store = await fetchFromDB({ client, schemas }, id);
  if (store) {
    await redis.set(
      cacheKey,
      JSON.stringify(store),
      'EX',
      Math.ceil(cacheTTL / 1000),
    );
  }
  return store;
}

async function getMerged(ctx, ids, options = {}) {
  const { instanciate } = {
    instanciate: false,
    ...options,
  };

  const toBeMerged = [];

  for (const id of [].concat(ids)) {
    toBeMerged.push(await get(ctx, id));
  }

  const merged = merge(...toBeMerged);

  return instanciate ? new FormSchema(merged) : merged;
}

async function getValidator(ctx, id, options = {}) {
  const data = await get(ctx, id);

  return data ? new FormSchema(data).getValidate(options) : null;
}

async function create({ client, schemas, reservedFields }, data) {
  let clean;
  try {
    clean = FormSchema.validate(data, { reservedFields });
  } catch (errors) {
    log('failed creating form-schema', JSON.stringify(data));

    return {
      success: false,
      errors,
    };
  }

  const id = await client(schemas.formSchema)
    .insert({
      store: JSON.stringify(clean),
    })
    .then((ids) => ids[0]);

  log('created form-schema %s', id);

  return {
    success: true,
    id,
    formSchema: clean,
  };
}

async function update(
  { client, schemas, reservedFields, redis, cachePrefix },
  id,
  data,
) {
  let clean;
  try {
    clean = FormSchema.validate(data, { reservedFields });
  } catch (errors) {
    log('failed updating form-schema %s', id, JSON.stringify(data));

    return {
      id,
      success: false,
      errors,
    };
  }

  const updatedId = await client(schemas.formSchema)
    .update({
      store: JSON.stringify(clean),
    })
    .where({ id });

  if (redis) await redis.del(`${cachePrefix}:${id}`);

  log('updated form-schema %s', id);

  return {
    id,
    success: updatedId === id,
    formSchema: clean,
  };
}

async function remove({ client, schemas, redis, cachePrefix }, id) {
  const removedId = await client(schemas.formSchema).delete({ id });

  if (redis) await redis.del(`${cachePrefix}:${id}`);

  return {
    success: true,
    id: removedId,
  };
}

async function clearCache({ redis, cachePrefix }) {
  if (!redis) return;
  const keys = await redis.keys(`${cachePrefix}:*`);
  if (keys.length) await redis.del(...keys);
}

export default Object.assign(
  (config) => {
    if (config.logger) {
      logger.setModuleConfig(config.logger);
    }

    log('initializing');

    const c = {
      client:
        config.knex
        || knex({
          client: 'mysql2',
          connection: { ...config.mysql },
        }),
      schemas: config.schemas,
      reservedFields: config.reservedFields || [],
      redis: config.redis || null,
      cachePrefix: config.cachePrefix || 'formschema',
      cacheTTL: config.cacheTTL || 60_000,
    };

    filesMw.init({
      tmpFolder: config.tmpFolder,
      s3: config.s3,
      imagePath: config.imagePath,
    });

    const svc = {
      get: get.bind(null, c),
      getMerged: getMerged.bind(null, c),
      getValidator: getValidator.bind(null, c),
      create: create.bind(null, c),
      update: update.bind(null, c),
      remove: remove.bind(null, c),
      clearCache: clearCache.bind(null, c),
      shutdown: async (options = {}) => {
        if (options.clear) await clearCache(c);
      },
      internals: {
        client: c.client,
      },
      utils,
      middleware: {
        files: filesMw,
      },
    };

    return svc;
  },
  {
    utils,
  },
);
