import logs from '@openagenda/logs';
import { NotFound } from '@openagenda/verror';
import { getName as getDatabaseFieldName } from '@openagenda/utils/fields/databaseField.js';
import cleanGetIdentifiers from './lib/cleanGetIdentifiers.js';
import cleanGetOptions from './lib/cleanGetOptions.js';
import handleInterface from './lib/handleInterface.js';
import lastClean from './lib/lastEventClean.js';

const log = logs('get');

export default async (service, identifiers, o = {}) => {
  log('called %s with options %j', identifiers, o);

  const {
    clients: { knex },
    config: { schema, imagePath, defaultImage },
    fieldUtils,
  } = service;

  const k = knex(schema);

  const options = cleanGetOptions(o);

  const { private: privateOption, includeFields, formSchema } = options;

  const query = k
    .first(
      fieldUtils
        .getFieldsByAccess('read', options.access)
        .filter((f) =>
          (includeFields.length ? includeFields.includes(f.field) : true))
        .map(getDatabaseFieldName),
    )
    .where(cleanGetIdentifiers(identifiers));

  if (typeof privateOption === 'boolean') {
    query.where('private', privateOption);
  }

  if (options.deleted === true) {
    query.whereNotNull('deleted_at');
  } else if (options.deleted === false) {
    query.whereNull('deleted_at');
  }

  const entry = await query;

  if (!entry && options.throwOnNotFound) {
    throw new NotFound(
      {
        info: {
          objectName: 'event',
          identifier: identifiers,
        },
      },
      'Not found',
    );
  } else if (!entry) {
    return null;
  }

  const item = fieldUtils.fromEntryToItem(entry, options);

  return lastClean(item, {
    ...options,
    locations: options.detailed
      ? await handleInterface(service, 'getLocations', item.locationUid, {
        formSchema,
      })
      : null,
    agendas: options.detailed
      ? await handleInterface(service, 'getOriginAgendas', item.agendaUid, {
        private: privateOption,
      })
      : null,
    imagePath,
    defaultImage,
  });
};
