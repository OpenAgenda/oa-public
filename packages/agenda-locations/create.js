import slug from 'slugify';
import { NotFound } from '@openagenda/verror';
import logger from '@openagenda/logs';
import cleanOptions from './lib/cleanSetOptions.js';
import defineUnique from './lib/defineUnique.js';
import filterFieldsByAccess from './lib/filterFieldsByAccess.js';
import validate from './lib/validate.js';
import authorize from './lib/authorize.js';
import * as fromatExtIds from './lib/formatExtIds.js';

const log = logger('create');

function isDataIncomplete(data) {
  if (!data.address || !data.countryCode || !data.latitude || !data.longitude) {
    return true;
  }
  if (!data.adminLevel1 || !data.adminLevel2 || !data.adminLevel4) {
    return true;
  }
  if (data.countryCode === 'FR' && !data.insee) {
    return true;
  }
  return false;
}

async function create(service, data, options = {}) {
  log('received %j payload with options %j', data.name, options);

  await authorize(service, 'create', null, options);

  const { endpointId, includeImagePath, autocomplete } = cleanOptions(options);

  let dataToValidate = autocomplete && isDataIncomplete(data)
    ? await service.decorateWithGeocodeData(data)
    : data;

  if (dataToValidate?.extId || dataToValidate.extId === null) {
    const { extId } = dataToValidate;
    dataToValidate = { ...dataToValidate };
    delete dataToValidate.extId;
    dataToValidate.extIds = [{ key: 'default', value: extId }];
  }

  const clean = {
    ...validate(dataToValidate),
    uid: await defineUnique(service, 'uid', () =>
      Math.ceil(Math.random() * 99999999)),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  clean.slug = await defineUnique(
    service,
    'slug',
    () =>
      `${slug(clean.name.substr(0, 90), {
        lower: true,
        strict: true,
      })}_${Math.ceil(Math.random() * 9999999)}`,
  );

  if (endpointId.agendaUid) {
    Object.assign(
      clean,
      await service.interfaces
        .getAgendaDetailsByUid(endpointId.agendaUid, ['id', 'locationSetUid'])
        .then((a) => ({
          agendaId: a.id,
          setUid: a.locationSetUid,
        })),
    );
  } else if (endpointId.setUid) {
    clean.setUid = endpointId.setUid;
  }

  if (clean.image) {
    const result = await service.imageTransformAndUpload(clean.image, {
      uid: clean.uid,
    });

    clean.image = result[0].filename;
  }

  const dataToInsert = fromatExtIds.beforeInsert(clean);

  const entry = service.fieldUtils.fromItemToEntry(dataToInsert);

  const [insertedID] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  // Prepare result: use dataToInsert which has extIds in correct format for afterRead
  const result = { ...dataToInsert };
  if (includeImagePath && result.image) {
    result.image = service.config.imagePath + result.image;
  }

  log('info', 'created with id %s and uid %s', insertedID, entry.uid, result);

  if (service.interfaces.onLocationCreate) {
    await service.interfaces.onLocationCreate(result, options.context);
  }

  // Apply afterRead formatting (adds legacy extId property from extIds array)
  return filterFieldsByAccess(fromatExtIds.afterRead(result));
}

export const byAgendaUid = async (service, agendaUid, data, options = {}) =>
  create(service, data, {
    ...options,
    endpointId: { agendaUid },
  });

export const bySetUid = async (service, setUid, data, options = {}) => {
  if (!await service.sets.get(setUid)) {
    throw new NotFound({ info: { setUid } }, 'set not found');
  }
  return create(service, data, {
    ...options,
    endpointId: { setUid },
  });
};

create.byAgendaUid = byAgendaUid;
create.bySetUid = bySetUid;

export default create;
