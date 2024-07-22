import _ from 'lodash';
import logs from '@openagenda/logs';
import getAgenda from '../../utils/getAgenda.js';
import updateLegacyFromSchema from './updateLegacySetFromSchema.js';
import updateCustomFromSchema from './updateCustomFromSchema.js';

const log = logs('core/agendas/settings/legacy/update');

const updateTagSetFromSchema = updateLegacyFromSchema('tags');
const updateCategorySetFromSchema = updateLegacyFromSchema('categories');

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

export default async (core, agendaOrUid, force = false) => {
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

  await updateTagSetFromSchema(core, agenda, { force });
  await updateCategorySetFromSchema(core, agenda, { force });
  await updateCustomFromSchema(core, agenda, force);
  await custom.pushCustomDatasetToLegacy(agenda.id);

  await controlData.rebuild(agenda.uid);
};
