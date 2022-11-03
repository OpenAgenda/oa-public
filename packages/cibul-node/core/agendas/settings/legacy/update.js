'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('core/agendas/settings/legacy/update');

const getAgenda = require('../../utils/getAgenda');
const updateLegacyFromSchema = require('./updateLegacySetFromSchema');
const updateCustomFromSchema = require('./updateCustomFromSchema');
const resyncLegacyIndex = require('./resyncLegacyIndex');

function _loadAgenda(services, agendaOrUid) {
  if (!_.isObject(agendaOrUid)) {
    return getAgenda(services, agendaOrUid);
  }

  if (
    _.keys(agendaOrUid)
      .filter(f => ['id', 'networkUid', 'formSchemaId'].includes(f))
      .length !== 3
  ) {
    return getAgenda(services, agendaOrUid.uid);
  }

  return agendaOrUid;
}

module.exports = async (core, agendaOrUid, force = false) => {
  const agenda = await _loadAgenda(core.services, agendaOrUid);
  const {
    services,
  } = core;

  const {
    custom,
  } = services;

  if (!services.legacy) {
    log('warn', 'legacy service was not initialized');
    return;
  }

  const {
    controlData,
  } = services.legacy;

  log('syncing legacy config and data of agenda %s (%s)%s', agenda.uid, agenda.slug, force ? ' forced' : '');

  await updateLegacyFromSchema(core, agenda, 'tags', force);
  await updateLegacyFromSchema(core, agenda, 'categories', force);
  await updateCustomFromSchema(core, agenda, force);
  await custom.pushCustomDatasetToLegacy(agenda.id);

  await resyncLegacyIndex(services, agenda.id);

  await controlData.rebuild(agenda.uid);
};
