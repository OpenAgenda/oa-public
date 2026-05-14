import { BadRequest, NotFound } from '@openagenda/verror';
import logger from '@openagenda/logs';
import cleanGetIdentifiers from './lib/cleanGetIdentifiers.js';
import cleanGetOptions from './lib/cleanGetOptions.js';
import addGetQuery from './lib/addGetQuery.js';
import addSelect from './lib/addSelect.js';
import decorateWithCounts from './lib/decorateWithCounts.js';
import pickContextIdentifiers from './lib/pickAndCleanContextIdentifiers.js';
import getMergedLocation from './lib/getMergedLocation.js';
import * as formatExtIds from './lib/formatExtIds.js';
import formatLegacyTags from './lib/formatLegacyTags.js';

const log = logger('get');

async function get({ internals, endpoints }, identifiers, options = {}) {
  log('received %j %j', identifiers, options);
  const k = internals.clients.knex(internals.config.schema);
  const {
    eventCounts: includeEventCounts,
    endpointId,
    context,
    includeImagePath,
    includeFields,
    throwOnNotFound,
    includeLinkedAgendas,
    deleted,
    returnMergeTarget,
    formSchema,
  } = cleanGetOptions(options);

  await addGetQuery(internals, k, deleted, {
    ...cleanGetIdentifiers(identifiers),
    ...pickContextIdentifiers(endpointId, ['agendaUid', 'setUid']),
  });

  addSelect(k, 'public', { first: true, includeFields });
  if ((includeFields ?? []).includes('agendaUid')) {
    k.select('agenda_id');
  }
  const entry = await k;

  const location = entry
    ? internals.fieldUtils.fromEntryToItem(entry, {
      includeFields,
      access: 'public',
    })
    : null;

  if (location) {
    if (location.deleted === 1) {
      const deletedLocation = {
        uid: location.uid,
        deleted: location.deleted,
      };
      if (location.mergedIn !== null && location.mergedIn !== undefined) {
        deletedLocation.mergedIn = location.mergedIn;
      }
      return deletedLocation;
    }

    if (deleted === false) {
      delete location.deleted;
    }
  }

  if (returnMergeTarget) {
    return getMergedLocation(endpoints, identifiers, location, options);
  }
  if (!location) {
    if (throwOnNotFound) {
      throw new NotFound({ info: identifiers }, 'location not found');
    }
    return null;
  }

  if (internals.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      location,
      await internals.interfaces.getEventCounts([location.uid], context),
    );
  }

  if (
    internals.interfaces.getAgendaUidsByIds
    && (includeFields ?? []).includes('agendaUid')
  ) {
    location.agendaUid = (
      await internals.interfaces.getAgendaUidsByIds(entry.agenda_id)
    )?.uid;
  }

  if (internals.interfaces.getLinkedAgendas && includeLinkedAgendas) {
    location.linkedAgendas = await internals.interfaces.getLinkedAgendas(
      location.uid,
    );
  }

  if (includeImagePath && internals.config.imagePath && location.image) {
    location.image = internals.config.imagePath + location.image;
  }

  let result = formatExtIds.afterRead(location);
  if (formSchema) {
    result = formatLegacyTags(result, formSchema);
  }
  return result;
}

get.byAgendaUid = async (
  { internals, endpoints },
  agendaUid,
  identifiers,
  options = {},
) => {
  if (!agendaUid) {
    throw new BadRequest('agenda identifier is missing');
  }
  return get({ internals, endpoints }, identifiers, {
    ...options,
    endpointId: { agendaUid },
  });
};

get.bySetUid = async (
  { internals, endpoints },
  setUid,
  identifiers,
  options = {},
) => {
  if (!setUid) {
    throw new BadRequest('set identifier is missing');
  }
  return get({ internals, endpoints }, identifiers, {
    ...options,
    endpointId: { setUid },
  });
};

export default get;
