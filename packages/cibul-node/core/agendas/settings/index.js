import logs from '@openagenda/logs';
import * as getMemberSchema from '../utils/getMemberSchema.js';
import getMergedSchema from './getMergedSchema.js';
import getSchema, {
  network as getNetworkSchema,
  andParents as getSchemaAndParents,
} from './getSchema.js';
import resyncInbox from './resyncInbox.js';
import updateSchemaFields from './updateSchemaFields.js';
import updateMemberSchemaFields from './updateMemberSchemaFields.js';
import * as contributionTypes from './contributionTypes.js';

const log = logs('core/agendas/settings');

export default (core) => {
  const { tasks, services } = core;

  const resyncFn = {
    rebuildSearch: (agendaUid) =>
      core.agendas(agendaUid).events.search.rebuild(),
    transverseSearch: (agendaUid) =>
      core
        .agendas(agendaUid)
        .events.search.resyncEvents({ state: 2 }, { access: 'internal' }),
    resyncInbox: (agendaUid) => resyncInbox(services, agendaUid),
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
    resyncInbox: resyncFn.resyncInbox.bind(null, agendaUid),
    batchResync: async (resyncs = []) => {
      log('received resync request for agenda %s', agendaUid, resyncs);
      const cleanResyncs = Object.values(resyncs);
      log('processing', cleanResyncs);
      const enqueued = [];
      for (const resyncOperation of cleanResyncs) {
        if (!Object.keys(resyncFn).includes(resyncOperation)) {
          log('warn', 'unknown resync operation, ignoring', {
            resyncOperation,
          });
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
