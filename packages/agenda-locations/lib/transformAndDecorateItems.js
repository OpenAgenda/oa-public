import decorateWithCounts from './decorateWithCounts.js';
import decorateWithAgendaUids from './decorateWithAgendaUids.js';
import injectImagePath from './injectImagePath.js';
import * as legacy from './legacy.js';
import { afterRead } from './formatExtIds.js';
import formatLegacyTags from './formatLegacyTags.js';

export default async (service, items, options = {}) => {
  const {
    eventCounts: includeEventCounts,
    context,
    detailed,
    includeFields,
    includeImagePath,
    deleted,
    formSchema,
  } = options;

  const transformed = items.map((entry) => {
    const location = service.fieldUtils.fromEntryToItem(entry, {
      access: detailed ? 'public' : 'list',
      includeFields,
      nullifyUndefined: true,
    });

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

    if (location.siret === null) {
      delete location.siret;
    }

    if (deleted === false) {
      delete location.deleted;
    }

    return legacy.load(location, entry);
  });

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      transformed,
      await service.interfaces.getEventCounts(
        transformed.map((i) => i.uid),
        context,
      ),
    );
  }

  if (
    service.interfaces.getAgendaUidsByIds
    && (includeFields ?? []).includes('agendaUid')
  ) {
    decorateWithAgendaUids(
      items,
      transformed,
      await service.interfaces.getAgendaUidsByIds(
        items.map((i) => i.agenda_id).filter((id) => !!id),
      ),
    );
  }

  if (includeImagePath && service.config.imagePath) {
    injectImagePath(transformed, service.config.imagePath);
  }

  return transformed.map((item) => {
    let result = afterRead(item);
    if (formSchema) {
      result = formatLegacyTags(result, formSchema);
    }
    return result;
  });
};
