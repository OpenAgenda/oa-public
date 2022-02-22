'use strict';

const decorateWithCounts = require('./decorateWithCounts');
const decorateWithAgendaUids = require('./decorateWithAgendaUids');
const injectImagePath = require('./injectImagePath');
const legacy = require('./legacy');

module.exports = async (service, items, options = {}) => {
  const {
    eventCounts: includeEventCounts,
    context,
    detailed,
    includeFields,
    includeImagePath,
  } = options;

  const transformed = items.map(entry => {
    const location = service.fieldUtils.fromEntryToItem(entry, {
      access: detailed ? 'public' : 'list',
      includeFields,
      nullifyUndefined: true
    });

    return legacy.load(location, entry);
  });

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      transformed,
      await service.interfaces.getEventCounts(
        transformed.map(i => i.uid),
        context
      )
    );
  }

  if (service.interfaces.getAgendaUidsByIds && (includeFields ?? []).includes('agendaUid')) {
    decorateWithAgendaUids(
      items,
      transformed,
      await service.interfaces.getAgendaUidsByIds(
        items.map(i => i.agenda_id).filter(id => !!id)
      )
    );
  }

  if (includeImagePath && service.config.imagePath) {
    injectImagePath(transformed, service.config.imagePath);
  }

  return transformed;
};
