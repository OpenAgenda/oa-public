'use strict';

const flattenLocationTagSet = require('./flattenLocationTagSet');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

module.exports = (entrySettings, options) => {
  const settings = { ...entrySettings };
  if (options.lang && settings?.tagSet) {
    settings.tagSet = flattenLocationTagSet(settings.tagSet, options.lang);
  }
  for (const field in settings.access) {
    if (settings.access[field].authorized === undefined) {
      settings.access[field] = settings.access[field] ? defaultAccess : { ...defaultAccess, authorized: false };
    }
  }
  return settings;
};
