import _ from 'lodash';
import logs from '@openagenda/logs';
import get from '../get.js';
import map from '../databaseFieldMap.js';
import validate from '../validate/index.js';
import dbMapper from './dbMapper.js';
import profileImage from './profileImage.js';
import doUpdate from './doUpdate.js';
import verifyIfDifferent from './verifyIfDifferent.js';

const dbParse = dbMapper(map);
const log = logs('set');

function _filterProtected(protectedFlag, namespace, data) {
  if (!protectedFlag) return data;

  const filteredData = {};

  Object.keys(data).forEach((k) => {
    if (!dbParse.is('obj', k, 'protected')) {
      filteredData[k] = data[k];
    }
  });

  return filteredData;
}

function _merge(current, data) {
  return _.mergeWith({}, current, data, (obj, src, key) => {
    if (['filters', 'status'].includes(key)) {
      return src;
    }

    if (Array.isArray(src) && key === 'moderateOnChangeBy') {
      return src;
    }
  });
}

async function update(
  { knex, schemas, slugUnicity, interfaces, upload, service, imagePath },
  identifiers,
  data,
  options = {},
) {
  const params = {
    // option defaults
    protected: true, // protected fields cannot be tampered with
    internal: false, // retrieve internal fields when update is done
    private: false,
    includeImagePath: false,
    context: null,
    ...options,
  };

  const slugUnicityInstance = slugUnicity.clone();

  try {
    // Get current agenda
    const current = await get(
      { knex, schemas, service, imagePath },
      typeof identifiers === 'object' && identifiers.id
        ? { id: identifiers.id }
        : identifiers,
      {
        internal: true,
        includeImagePath: params.includeImagePath,
        private: params.private,
      },
    );

    if (!current) throw new Error('agenda not found');

    log('retrieved agenda of uid %s', current.uid);

    const { id } = current;

    // Merge and process
    const merged = Object.assign(_merge(current, data), {
      updatedAt: new Date(),
    });

    // Set officializedAt timestamp if becoming official
    if (!current.official && merged.official) {
      merged.officializedAt = new Date();
    }

    // Validate the merged data
    let clean;
    let errors = [];
    try {
      clean = validate(merged);
    } catch (validationErrors) {
      log(
        'validation failed with %s errors: %s',
        validationErrors.length,
        validationErrors,
      );
      errors = errors.concat(validationErrors);
    }

    const filteredClean = clean
      ? _filterProtected(params.protected, 'clean', clean)
      : null;

    // Prepare data for update
    const updateData = {
      id,
      current,
      merged,
      clean: filteredClean,
      data,
      errors,
      slugUnicity: slugUnicityInstance,
      context: params.context,
    };

    await verifyIfDifferent(slugUnicityInstance, updateData);
    await profileImage(upload, updateData);

    const updateResult = await doUpdate(knex, schemas, updateData);
    const { success } = updateResult;

    // Get updated agenda if successful
    let updated = null;
    if (success && !errors.length) {
      updated = await get(
        { knex, schemas, service, imagePath },
        { id },
        {
          internal: true,
          includeImagePath: params.includeImagePath,
          private: params.private,
        },
      );
    }

    // Final processing
    if (success && interfaces?.onUpdate) {
      interfaces.onUpdate(current, updated, params.context);
    }

    const result = {
      agenda: params.internal ? updated : dbParse.exclude(updated, 'internal'),
      valid: !errors.length,
      success,
      errors,
    };

    await slugUnicityInstance.destroy();

    return result;
  } catch (error) {
    await slugUnicityInstance.destroy();
    throw error;
  }
}

export default update;
