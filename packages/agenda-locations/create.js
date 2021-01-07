'use strict';

const log = require('@openagenda/logs')('create');
const slug = require('slugify');

const cleanOptions = require('./lib/cleanSetOptions');
const defineUnique = require('./lib/defineUnique');
const filterFieldsByAccess = require('./lib/filterFieldsByAccess');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const NotFoundError = require('./lib/NotFoundError');
const validate = require('./lib/validate');

async function create(service, data, options = {}) {
  log('received %j payload', data.name);

  const { context, includeImagePath, geocodeIfUndefined } = cleanOptions(
    options
  );

  const clean = {
    ...validate(
      geocodeIfUndefined ? await service.decorateWithGeocodeData(data) : data
    ),
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    slug: await defineUnique(
      service,
      'slug',
      () => `${slug(data.name.substr(0, 90), {
        lower: true,
        strict: true,
      })}_${Math.ceil(Math.random() * 9999999)}`
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (context.agendaUid) {
    Object.assign(
      clean,
      await service.interfaces
        .getAgendaDetailsByUid(context.agendaUid, ['id', 'locationSetUid'])
        .then(a => ({
          agendaId: a.id,
          setUid: a.locationSetUid,
        }))
    );
  } else if (context.setUid) {
    clean.setUid = context.setUid;
  }

  if (clean.image) {
    const result = await service.imageTransformAndUpload(clean.image, {
      uid: clean.uid,
    });

    clean.image = result[0].filename;
  }

  const entry = fromItemToDbEntry(clean);

  const [insertedID] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  return filterFieldsByAccess(clean);
}

module.exports.byAgendaUid = async (service, agendaUid, data, options = {}) => create(service, data, {
  ...options,
  context: { agendaUid },
});

module.exports.bySetUid = async (service, setUid, data, options = {}) => {
  if (!(await service.sets.get(setUid))) {
    throw new NotFoundError('location set', { setUid });
  }
  return create(service, data, {
    ...options,
    context: { setUid },
  });
};
