'use strict';

const decorateWithCounts = require('./decorateWithCounts');
const fromDbEntryToItem = require('./fromDbEntryToItem');

module.exports = async (service, items, options = {}) => {
  const {
    total: includeTotal,
    eventCounts: includeEventCounts,
    context,
    detailed,
    includeFields,
    includeImagePath
  } = options;

  const transformed = items.map(i => fromDbEntryToItem(i, {
    imagePath: includeImagePath ? service.config.imagePath : null,
    access: detailed ? 'public' : 'list',
    includeFields
  }));

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      transformed,
      await service.interfaces.getEventCounts(transformed.map(i => i.uid), context)
    );
  }

  return transformed;
}
