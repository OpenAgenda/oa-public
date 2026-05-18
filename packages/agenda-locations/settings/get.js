import _ from 'lodash';
import fromDbEntryToSettings from './lib/fromDbEntryToSettings.js';

async function get(service, { setUid, agendaUid }, options = {}) {
  const requestedAgendaUid = agendaUid || options.agendaUid;

  const { includeSetInfo } = options;

  const defaultAccess = {
    authorized: true,
    external: false,
    serviceLabel: null,
    link: null,
  };

  const settings = {
    eventForm: {
      detailed: false,
    },
    labels: {},
    tagSet: {
      groups: [],
    },
    access: {
      create: defaultAccess,
      delete: defaultAccess,
      merge: defaultAccess,
      update: defaultAccess,
    },
  };

  const agendaSettings = requestedAgendaUid && service.interfaces?.getAgendaLocationSettings
    ? await service.interfaces.getAgendaLocationSettings(requestedAgendaUid)
    : null;

  if (agendaSettings) {
    Object.assign(settings, agendaSettings);
  }

  const effectiveSetUid = setUid
    || await service.interfaces
      .getAgendaDetailsByUid(requestedAgendaUid)
      .then((d) => d?.locationSetUid);

  if (effectiveSetUid) {
    const set = await service.sets.get(effectiveSetUid, {
      detailed: includeSetInfo,
      includeSettings: true,
    });
    if (set) {
      Object.assign(
        settings,
        set.settings,
        includeSetInfo ? { set: _.omit(set, ['settings']) } : {},
      );
    }
  }

  return fromDbEntryToSettings(settings, {
    ...options,
    setUid: effectiveSetUid,
  });
}

get.byAgendaUid = (service, uid, options) =>
  get(service, { agendaUid: uid }, options);

get.bySetUid = (service, uid, options) =>
  get(service, { setUid: uid }, options);

export default get;
