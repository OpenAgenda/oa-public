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

async function get({ client, schemas }, id, options = {}) {
  const store = await client(schemas.formSchema)
    .first(['id', 'store'])
    .where({ id })
    .then((r) =>
      (r && r.store
        ? {
          ...JSON.parse(r.store),
          id,
        }
        : null));

  if (!store) {
    return null;
  }

  return options.instanciate ? new FormSchema(store) : store;
}

async function getMerged({ client, schemas }, ids, options = {}) {
  const { instanciate } = {
    instanciate: false,
    ...options,
  };

  const toBeMerged = [];

  for (const id of [].concat(ids)) {
    toBeMerged.push(await get({ client, schemas }, id));
  }

  const merged = merge(...toBeMerged);

  return instanciate ? new FormSchema(merged) : merged;
}

async function getValidator({ client, schemas }, id, options = {}) {
  const data = await get({ client, schemas }, id);

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

async function update({ client, schemas, reservedFields }, id, data) {
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

  log('updated form-schema %s', id);

  return {
    id,
    success: updatedId === id,
    formSchema: clean,
  };
}

async function remove({ client, schemas }, id) {
  const removedId = await client(schemas.formSchema).delete({ id });

  return {
    success: true,
    id: removedId,
  };
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
