'use strict';

const log = require('@openagenda/logs')('core/agendas/settings');

const config = require('../../../config');

const getMergedSchema = require( './getMergedSchema' );
const getSchema = require( './getSchema' );
const updateLegacySetFromSchema = require('./legacy/updateLegacySetFromSchema');
const updateCustomFromSchema = require('./legacy/updateCustomFromSchema');
const updateLegacy = require('./legacy/update');
const resyncLocationsIndex = require('./resyncLocationsIndex');
const resyncInbox = require('./resyncInbox');
const legacySvc = require('../../../services/legacy');
const tasks = require('../../tasks');

const updateSchemaFields = require('./updateSchemaFields');
const createFormSchemaFromLegacy = require('./createFormSchemaFromLegacy');
const pushDataToFormSchema = require('./pushDataToFormSchema');

module.exports = services => {
  const resyncFn = {
    updateTagSet: agendaUid => updateLegacySetFromSchema(config, agendaUid, 'tags'),
    updateCategorySet: agendaUid => updateLegacySetFromSchema(config, agendaUid, 'categories'),
    updateCustomFromSchema: agendaUid => updateCustomFromSchema(config, agendaUid),
    updateLegacy: agendaUid => updateLegacy(config, agendaUid),
    rebuildControlData: agendaUid => legacySvc.controlData.rebuild(agendaUid),
    resyncLocationsIndex: agendaUid => resyncLocationsIndex(services, agendaUid),
    resyncInbox: agendaUid => resyncInbox(services, agendaUid),
    createFormSchemaFromLegacy: agendaUid => createFormSchemaFromLegacy(services, agendaUid),
    pushDataToFormSchema: agendaUid => pushDataToFormSchema(services, agendaUid)
  }

  tasks.register(resyncFn);

  return agendaUid => ({
    get: getMergedSchema.bind( null, agendaUid ), // deprecate
    schema: {
      get: getSchema.bind(null, agendaUid),
      getNetwork: getSchema.network.bind(null, agendaUid),
      getMerged: getMergedSchema.bind( null, agendaUid ),
      updateFields: updateSchemaFields.bind( null, config, agendaUid )
    },
    legacy: {
      updateTagSet: resyncFn.updateTagSet.bind(null, agendaUid),
      updateCategorySet: resyncFn.updateCategorySet.bind(null, agendaUid),
      updateCustom: resyncFn.updateCustomFromSchema.bind(null, agendaUid),
      update: resyncFn.updateLegacy.bind(null, agendaUid),
      rebuildControlData: resyncFn.rebuildControlData.bind(null, agendaUid),
      createFormSchema: resyncFn.createFormSchemaFromLegacy.bind(null, agendaUid),
      pushDataToFormSchema: resyncFn.pushDataToFormSchema.bind(null, agendaUid)
    },
    resyncLocationsIndex: resyncFn.resyncLocationsIndex.bind(null, agendaUid),
    resyncInbox: resyncFn.resyncInbox.bind(null, agendaUid),
    batchResync: async (resyncs = []) => {
      log('processing resyncs for agenda %s', agendaUid, resyncs);
      const enqueued = [];
      for (const resyncOperation of resyncs) {
        if (!Object.keys(resyncFn).includes(resyncOperation)) {
          log('warn', 'unknown resync operation, ignoring')
        } else {
          await tasks.enqueue(resyncOperation, agendaUid);
          enqueued.push(resyncOperation);
        }
      }
      return {
        enqueued
      };
    }
  })

}
