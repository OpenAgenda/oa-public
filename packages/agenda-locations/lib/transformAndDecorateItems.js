'use strict';

const decorateWithCounts = require('./decorateWithCounts');
const injectImagePath = require('./injectImagePath');

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
    includeFields
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
    injectImagePath(transformed, service.config.imagePath);
  }
  return transformed;
};
