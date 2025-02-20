import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import validateOptions from './validators/options.js';
import config from './config.js';
import get from './get.js';

const log = logs('create');

export default async (formSchemaId, identifier, data, options = {}) => {
  const { knex, schemas, interfaces } = config;

  const cleanOptions = validateOptions(options);

  if (!knex) throw new Error('db connector needs to be specified at service init');

  if (!interfaces || !interfaces.getValidator) {
    throw new Error('getValidator interface is required at service init');
  }

  let clean = data;

  if (cleanOptions.validate) {
    const validate = await interfaces.getValidator(formSchemaId, cleanOptions);

    try {
      clean = validate(data);
    } catch (validationErrors) {
      return {
        success: false,
        valid: false,
        errors: validationErrors,
      };
    }
  }

  // verify pre-existing

  if (await get(formSchemaId, identifier)) {
    throw new VError(
      'entry already exists for %s / %s',
      formSchemaId,
      identifier,
    );
  }

  // insert

  try {
    log('info', 'creating custom entry with %j', clean, {
      formSchemaId,
      identifier,
    });

    const insertId = await knex(schemas.custom).insert({
      form_schema_id: formSchemaId,
      identifier,
      created_at: new Date(),
      updated_at: new Date(),
      store: JSON.stringify(clean),
    });

    const created = await get(formSchemaId, identifier);

    if (interfaces.onCreate) {
      log('info', 'calling onCreate');

      interfaces.onCreate(created, cleanOptions); // context is same as options here
    }

    log('info', 'create successful');

    return {
      success: true,
      insertId,
      custom: created,
    };
  } catch (e) {
    log('error', e);

    throw new VError(
      e,
      'could not insert for %s / %s',
      formSchemaId,
      identifier,
    );
  }
};
