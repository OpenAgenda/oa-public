import logs from '@openagenda/logs';
import * as getMemberSchema from '../utils/getMemberSchema.js';
import getMergedSchema from './getMergedSchema.js';
import getSchema, {
  network as getNetworkSchema,
  andParents as getSchemaAndParents,
} from './getSchema.js';
import updateLegacyFromSchema from './legacy/updateLegacySetFromSchema.js';
import updateCustomFromSchema from './legacy/updateCustomFromSchema.js';
import updateLegacy from './legacy/update.js';
import resyncInbox from './resyncInbox.js';
import updateSchemaFields from './updateSchemaFields.js';
import updateMemberSchemaFields from './updateMemberSchemaFields.js';
import createFormSchemaFromLegacy from './createFormSchemaFromLegacy.js';
import * as contributionTypes from './contributionTypes.js';

const log = logs('core/agendas/settings');

export default (core) => {
  const { tasks, services } = core;

  const { legacy: legacySvc } = services;

  const updateCategorySetFromSchema = updateLegacyFromSchema('categories');
  const updateTagSetFromSchema = updateLegacyFromSchema('tags');

  const resyncFn = {
    updateTagSet: (agendaUid, options) =>
      updateTagSetFromSchema(core, agendaUid, options),
    updateCategorySet: (agendaUid) =>
      updateCategorySetFromSchema(core, agendaUid),
    updateCustomFromSchema: (agendaUid, force = false) =>
      updateCustomFromSchema(core, agendaUid, force),
    updateLegacy: (agendaUid, options) =>
      updateLegacy(core, agendaUid, options),
    rebuildControlData: (agendaUid) => legacySvc.controlData.rebuild(agendaUid),
    resyncInbox: (agendaUid) => resyncInbox(services, agendaUid),
    createFormSchemaFromLegacy: (agendaUid) =>
      createFormSchemaFromLegacy(services, agendaUid),
    rebuildActivities: (agendaUid) =>
      services.activities.tasks.agendaRebuild(agendaUid),
  };

  tasks.register(resyncFn);

  return (agendaUid) => ({
    isOpen: contributionTypes.isOpen.bind(null, services, agendaUid),
    isClosed: contributionTypes.isClosed.bind(null, services, agendaUid),
    isMembersOnly: contributionTypes.isMembersOnly.bind(
      null,
      services,
      agendaUid,
    ),
    isMemberDataRequired: contributionTypes.isMemberDataRequired.bind(
      null,
      services,
      agendaUid,
    ),
    get: getMergedSchema.bind(null, services, agendaUid), // deprecate
    schema: {
      get: getSchema.bind(null, services, agendaUid),
      getNetwork: getNetworkSchema.bind(null, services, agendaUid),
      getAndParents: getSchemaAndParents.bind(null, services, agendaUid),
      getMerged: getMergedSchema.bind(null, services, agendaUid),
      updateFields: updateSchemaFields.bind(null, core, agendaUid),
      getMember: getMemberSchema.default.bind(null, services, agendaUid),
      getMemberAndParents: getMemberSchema.andParents.bind(
        null,
        services,
        agendaUid,
      ),
      updateMemberFields: updateMemberSchemaFields.bind(null, core, agendaUid),
    },
    legacy: {
      updateTagSet: resyncFn.updateTagSet.bind(null, agendaUid),
      updateCategorySet: resyncFn.updateCategorySet.bind(null, agendaUid),
      updateCustom: resyncFn.updateCustomFromSchema.bind(null, agendaUid),
      update: resyncFn.updateLegacy.bind(null, agendaUid),
      rebuildControlData: resyncFn.rebuildControlData.bind(null, agendaUid),
      createFormSchema: resyncFn.createFormSchemaFromLegacy.bind(
        null,
        agendaUid,
      ),
    },
    resyncInbox: resyncFn.resyncInbox.bind(null, agendaUid),
    batchResync: async (resyncs = []) => {
      log('processing resyncs for agenda %s', agendaUid, resyncs);
      if (!Array.isArray(resyncs)) {
        log('no resync explicitely requested');
        return [];
      }
      const enqueued = [];
      for (const resyncOperation of resyncs) {
        if (!Object.keys(resyncFn).includes(resyncOperation)) {
          log('warn', 'unknown resync operation, ignoring');
        } else {
          await tasks.enqueue(resyncOperation, agendaUid);
          enqueued.push(resyncOperation);
        }
      }
      return {
        enqueued,
      };
    },
  });
};
