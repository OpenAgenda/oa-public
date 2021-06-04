'use strict';

const decorateWithCounts = require('./decorateWithCounts');

module.exports = async (service, items, options = {}) => {
  const {
    eventCounts: includeEventCounts,
    context,
    detailed,
    includeFields,
    includeImagePath,
  } = options;

  const transformed = items.map(i => service.fieldUtils.fromEntryToItem(i, {
    // imagePath: includeImagePath ? service.config.imagePath : null,
    access: detailed ? 'public' : 'list',
    includeFields,
  }));

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      transformed,
      await service.interfaces.getEventCounts(
        transformed.map(i => i.uid),
        context
      )
    );
  }

  if (includeImagePath && service.config.imagePath) {
    return transformed.map(i => ({
      ...i,
      image: service.config.imagePath + i.image
    }));
  }
  return transformed;
};
