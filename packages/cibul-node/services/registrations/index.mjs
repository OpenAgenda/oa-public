import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';
import ProcessPassPendingOffers from './utils/ProcessPassPendingOffers.mjs';
import processPassCultureApply from './utils/passCulture/processApply.mjs';

const log = logs('services/registrations');

/* const checkEvent = async (services, agendaUid, eventUid) => {
  const { core } = services;
  const event = await core.agendas(agendaUid).events.get(eventUid, { access: 'internal' });

  if (!event) {
    log('checkEvent', 'event not found');
    return false;
  }
  if (event.draft) {
    log('checkEvent', 'event is draft');
    return false;
  }
  return true;
}; */

export function init(config, services) {
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }

  const svc = Registrations({
    passCulture: config.passCulture,
    logger: config.getLogConfig('svc', 'registrations'),
    imageBasePath: config.aws.bucket,
  });

  const { enqueue, task, shutdown: shutdownTask } = ProcessPassPendingOffers({
    services,
    registrations: svc,
    ...config.passCulture,
  });

  return Object.assign(svc, {
    settings: {
      passCulture: {
        offerLink: config.passCulture.offerLink,
        offerEditLink: config.passCulture.offerEditLink,
      },
    },
    utils: {
      passCulture: {
        processApply: processPassCultureApply.bind(null, {
          enqueue,
          services,
        }),
        isMarkedAsPending: data => data?.[0]?.response.isPending,
        isNew: data => !data[0]?.appliedAt,
        hasNonApplied: data => !!data.filter(item => !item.appliedAt).length,
        enqueuePending: enqueue,
      },
    },
    shutdown: async options => {
      await shutdownTask(options);
    },
    task,
  });
}
