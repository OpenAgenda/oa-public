import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import validateOptions from './validators/options.js';
import config from './config.js';
import get from './get.js';
import legacy from './legacy/index.js';

const log = logs('update');

export default async (formSchemaId, identifier, data, options = {}) => {
  const { knex, schemas, interfaces } = config;

  const cleanOptions = validateOptions(options);

  if (!knex) throw new Error('db connector needs to be specified at service init');

  if (!interfaces || !interfaces.getValidator) {
    throw new Error('getValidator interface is required at service init');
  }

  // verify pre-existing

  const before = cleanOptions.preloaded || await get(formSchemaId, identifier);

  if (!before) {
    throw new VError(
      'entry was not found for %s / %s',
      formSchemaId,
      identifier,
    );
  }

  let clean = data;

  if (cleanOptions.validate) {
    const validate = await interfaces.getValidator(formSchemaId);

    // clean

    try {
      clean = cleanOptions.partial
        ? validate.part(_.keys(data), data)
        : validate(data);
    } catch (validationErrors) {
      return {
        success: false,
        valid: false,
        errors: validationErrors,
      };
    }
  }

  // update

  try {
    const completeClean = cleanOptions.partial
      ? _.assign({}, before, clean)
      : clean;

    const updated = !!await knex(schemas.custom)
      .update({
        updated_at: new Date(),
        store: JSON.stringify(completeClean),
      })

      .where({
        form_schema_id: formSchemaId,
        identifier,
      });

    if (cleanOptions.transferToLegacy) {
      try {
        await legacy(formSchemaId, identifier, completeClean, cleanOptions);
      } catch (e) {
        log(
          'error',
          'did not sync legacy on update %s.%s',
          formSchemaId,
          identifier,
          e,
        );
      }
    }

    if (updated && interfaces.onUpdate) {
      interfaces.onUpdate(
        before,
        await get(formSchemaId, identifier),
        cleanOptions,
      );
    }

    return {
      success: true,
      custom: completeClean,
      before,
    };
  } catch (e) {
    throw new VError(
      e,
      'could not update for %s / %s',
      formSchemaId,
      identifier,
    );
  }
};
