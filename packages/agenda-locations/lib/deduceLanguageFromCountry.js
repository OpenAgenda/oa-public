'use strict';

module.exports = countryCode => {
  if (
    ['fr', 'ch', 'be', 'lu', 'ga', 'sn', 'dz'].includes(
      (countryCode || '').toLowerCase()
    )
  ) {
    return 'fr';
  }
  return 'en';
};
