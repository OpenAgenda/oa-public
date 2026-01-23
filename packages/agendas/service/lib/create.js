import logs from '@openagenda/logs';
import get from '../get.js';
import map from '../databaseFieldMap.js';
import validate from '../validate/index.js';
import dbMapper from './dbMapper.js';
import profileImage from './profileImage.js';
import doCreate from './doCreate.js';
import createOrVerifySlug from './createOrVerifySlug.js';

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

function _setToNow(targetObj, field) {
  targetObj[field] = new Date();
  return targetObj;
}

async function create(
  {
    knex,
    schemas,
    slugUnicity,
    uidUnicity,
    interfaces,
    upload,
    service,
    imagePath,
  },
  data,
  options = {},
) {
  const params = {
    internal: false,
    includeImagePath: false,
    ...options,
  };

  const slugUnicityInstance = slugUnicity.clone();
  const uidUnicityInstance = uidUnicity.clone();

  try {
    // Initialize data object
    const createData = {
      id: false,
      data: { ...data },
      clean: null,
      created: null,
      errors: [],
      identifiers: null,
      success: false,
      slugUnicity: slugUnicityInstance,
      uidUnicity: uidUnicityInstance,
    };

    // Process creation steps
    createData.data.uid = await uidUnicityInstance.generateAndHold();
    await createOrVerifySlug(slugUnicityInstance, createData);

    // Check for errors after slug verification
    if (createData.errors.length > 0) {
      createData.success = false;
    } else {
      _setToNow(createData.data, 'updatedAt');
      _setToNow(createData.data, 'createdAt');

      const { clean, errors } = await _validate(createData.data, []);
      createData.clean = clean;
      createData.errors = errors;

      if (createData.errors.length === 0) {
        await profileImage(upload, createData);
        await doCreate(knex, schemas, createData);
      }
    }

    // Get created agenda if successful
    if (createData.success && !createData.errors.length) {
      createData.created = await get(
        { knex, schemas, service, imagePath },
        { id: createData.id },
        {
          internal: true,
          includeImagePath: params.includeImagePath,
        },
      );
    }

    // Final processing
    const response = {
      agenda: params.internal
        ? createData.created
        : dbParse.exclude(createData.created, 'internal'),
      valid: !createData.errors.length,
      success: createData.success,
      errors: createData.errors,
    };

    if (createData.success && interfaces?.onCreate) {
      try {
        await interfaces.onCreate(createData.created);
      } catch (e) {
        log('error', 'interface onCreate call errored', e);
      }
    }

    await slugUnicityInstance.destroy();
    await uidUnicityInstance.destroy();

    return response;
  } catch (error) {
    await slugUnicityInstance.destroy();
    await uidUnicityInstance.destroy();
    throw error;
  }
}

export default create;
