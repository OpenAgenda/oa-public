'use strict';

const slug = require('slugify');
const { NotFound } = require('@openagenda/verror');
const log = require('@openagenda/logs')('create');
const cleanOptions = require('./lib/cleanSetOptions');
const defineUnique = require('./lib/defineUnique');
const filterFieldsByAccess = require('./lib/filterFieldsByAccess');
const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const legacy = require('./lib/legacy');

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

  const { endpointId, includeImagePath, autocomplete } = cleanOptions(
    options,
  );

  const clean = {
    ...validate(
      autocomplete && isDataIncomplete(data) ? await service.decorateWithGeocodeData(data) : data,
    ),
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    slug: await defineUnique(
      service,
      'slug',
      () => `${slug(data.name.substr(0, 90), {
        lower: true,
        strict: true,
      })}_${Math.ceil(Math.random() * 9999999)}`,
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (endpointId.agendaUid) {
    Object.assign(
      clean,
      await service.interfaces
        .getAgendaDetailsByUid(endpointId.agendaUid, ['id', 'locationSetUid'])
        .then(a => ({
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

  const entry = service.fieldUtils.fromItemToEntry(clean);

  const [insertedID] = await service.clients
    .knex(service.config.schema)
    .insert(legacy.patch(entry, null, null));

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  log('info', 'created with id %s and uid %s', insertedID, entry.uid, clean);

  if (service.interfaces.onLocationCreate) {
    await service.interfaces.onLocationCreate(clean, options.context);
  }

  return filterFieldsByAccess(clean);
}

module.exports.byAgendaUid = async (service, agendaUid, data, options = {}) => create(service, data, {
  ...options,
  endpointId: { agendaUid },
});

module.exports.bySetUid = async (service, setUid, data, options = {}) => {
  if (!await service.sets.get(setUid)) {
    throw new NotFound({ info: { setUid } }, 'set not found');
  }
  return create(service, data, {
    ...options,
    endpointId: { setUid },
  });
};
