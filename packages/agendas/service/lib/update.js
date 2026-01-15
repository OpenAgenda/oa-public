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

async function _validate(targetData, errors = []) {
  try {
    const clean = validate(targetData);
    return { clean, errors };
  } catch (e) {
    log('validation failed with %s errors: %s', e.length, e);
    return { clean: null, errors: errors.concat(e) };
  }
}

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

function _setToNow(targetObj, field) {
  targetObj[field] = new Date();
  return targetObj;
}

function _timestampOfficial(current, merged) {
  if (!current.official && merged.official) {
    merged.officializedAt = new Date();
  }
  return merged;
}

async function update(
  { knex, schemas, slugUnicity, interfaces, upload, service, imagePath },
  identifiers,
  data,
  o,
  c,
) {
  const options = o instanceof Function ? {} : o;
  const cb = o instanceof Function ? o : c;

  const params = _.extend(
    {
      // option defaults
      protected: true, // protected fields cannot be tampered with
      internal: false, // retrieve internal fields when update is done
      private: false,
      includeImagePath: false,
      context: null,
    },
    options,
  );

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
    let merged = _merge(current, data);
    merged = _setToNow(merged, 'updatedAt');
    merged = _timestampOfficial(current, merged);

    const { clean, errors } = await _validate(merged, []);

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
    if (success && interfaces) {
      interfaces.onUpdate(current, updated, params.context);
    }

    const result = {
      agenda: params.internal ? updated : dbParse.exclude(updated, 'internal'),
      valid: !errors.length,
      success,
      errors,
    };

    await slugUnicityInstance.destroy();

    if (cb) {
      cb(null, result);
    } else {
      return result;
    }
  } catch (error) {
    await slugUnicityInstance.destroy();
    if (cb) {
      return cb(error);
    }
    throw error;
  }
}

export default update;
