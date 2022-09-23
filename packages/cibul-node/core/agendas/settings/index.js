'use strict';

const log = require('@openagenda/logs')('core/agendas/settings');

const getMergedSchema = require('./getMergedSchema');
const getSchema = require('./getSchema');
const getMemberSchema = require('../utils/getMemberSchema');
const updateLegacySetFromSchema = require('./legacy/updateLegacySetFromSchema');
const updateCustomFromSchema = require('./legacy/updateCustomFromSchema');
const updateLegacy = require('./legacy/update');
const resyncInbox = require('./resyncInbox');

const updateSchemaFields = require('./updateSchemaFields');
const createFormSchemaFromLegacy = require('./createFormSchemaFromLegacy');
const contributionTypes = require('./contributionTypes');

module.exports = core => {
  const {
    tasks,
    services
  } = core;

  const {
    legacy: legacySvc
  } = services;

  const resyncFn = {
    updateTagSet: (agendaUid, options) => updateLegacySetFromSchema(core, agendaUid, 'tags', options),
    updateCategorySet: agendaUid => updateLegacySetFromSchema(core, agendaUid, 'categories'),
    updateCustomFromSchema: (agendaUid, force = false) => updateCustomFromSchema(core, agendaUid, force),
    updateLegacy: agendaUid => updateLegacy(core, agendaUid),
    rebuildControlData: agendaUid => legacySvc.controlData.rebuild(agendaUid),
    resyncInbox: agendaUid => resyncInbox(services, agendaUid),
    createFormSchemaFromLegacy: agendaUid => createFormSchemaFromLegacy(services, agendaUid)
  };

  tasks.register(resyncFn);

  return agendaUid => ({
    isOpen: contributionTypes.isOpen.bind(null, services, agendaUid),
    isClosed: contributionTypes.isClosed.bind(null, services, agendaUid),
    isMembersOnly: contributionTypes.isMembersOnly.bind(null, services, agendaUid),
    isMemberDataRequired: contributionTypes.isMemberDataRequired.bind(null, services, agendaUid),
    get: getMergedSchema.bind(null, services, agendaUid), // deprecate
    schema: {
      get: getSchema.bind(null, services, agendaUid),
      getNetwork: getSchema.network.bind(null, services, agendaUid),
      getMerged: getMergedSchema.bind(null, services, agendaUid),
      updateFields: updateSchemaFields.bind(null, core, agendaUid),
      getMember: getMemberSchema.bind(null, services, agendaUid)
    },
    legacy: {
      updateTagSet: resyncFn.updateTagSet.bind(null, agendaUid),
      updateCategorySet: resyncFn.updateCategorySet.bind(null, agendaUid),
      updateCustom: resyncFn.updateCustomFromSchema.bind(null, agendaUid),
      update: resyncFn.updateLegacy.bind(null, agendaUid),
      rebuildControlData: resyncFn.rebuildControlData.bind(null, agendaUid),
      createFormSchema: resyncFn.createFormSchemaFromLegacy.bind(null, agendaUid)
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
        enqueued
      };
    }
  });
};
