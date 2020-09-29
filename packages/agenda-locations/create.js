'use strict';

const log = require('@openagenda/logs')('create');
const slug = require('slugify');

const cleanOptions = require('./lib/cleanSetOptions');
const validate = require('./lib/validate');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const defineUnique = require('./lib/defineUnique');

async function create(service, data, options = {}) {
  log('received %j payload', data.name);

  const {
    context,
    includeImagePath
  } = cleanOptions(options);

  const clean = {
    ...validate(data),
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    slug: await defineUnique(service, 'slug', () => slug(data.name, { lower: true }) + '_' + Math.ceil(Math.random() * 9999999)),
    createdAt: new Date,
    updatedAt: new Date
  };

  if (context.agendaUid) {
    clean.agendaId = await service.interfaces.getAgendaIdByUid(context.agendaUid);
  }

  if (clean.image) {
    const result = await service.imageTransformAndUpload(clean.image, { uid: clean.uid });

    clean.image = result.image[0].filename;
  }

  const entry = fromItemToDbEntry(clean);

  const [ insertedID ] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  return clean;
}

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  data,
  options = {}
) => create(service, data, {
  ...options,
  context: { agendaUid }
});
