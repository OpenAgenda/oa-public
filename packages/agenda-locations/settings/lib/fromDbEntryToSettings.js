'use strict';

const _ = require('lodash');
const flattenLocationTagSet = require('./flattenLocationTagSet');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

function clean(entrySettings, options) {
  const settings = {
    ...(options.defaultSettings || {}),
    ..._.omit(entrySettings, ['agendas'])
  };

  if (options.lang && settings?.tagSet) {
    settings.tagSet = flattenLocationTagSet(settings.tagSet, options.lang);
  }
  for (const field in settings.access) {
    if (settings.access[field].authorized === undefined) {
      settings.access[field] = settings.access[field] ? defaultAccess : { ...defaultAccess, authorized: false };
    }
  }

  if (Array.isArray(entrySettings.agendas)) {
    settings.agendas = entrySettings.agendas.map(s => clean(s, {
      ..._.omit(options, ['agendaUid']),
      defaultSettings: settings
    }));
  }

  if (options.agendaUid) {
    const agendaSettings = (settings.agendas || [])
      .filter(s => s.agendaUid === options.agendaUid)
      .pop();
    if (agendaSettings) {
      return _.omit(agendaSettings, ['agendaUid']);
    }
  }
  return settings;
}

module.exports = clean;
