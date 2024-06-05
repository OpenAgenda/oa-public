import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';
import ProcessPassPendingOffers from './utils/ProcessPassPendingOffers.mjs';
import processPassCultureCreate from './utils/passCulture/processCreate.mjs';
import hasPendingPassCultureOffer from './utils/hasPendingPassCultureOffer.mjs';
import hasPassCultureOffer from './utils/hasPassCultureOffer.mjs';

const log = logs('services/registrations');

const checkEvent = async (services, agendaUid, eventUid) => {
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
};

export function init(config, services) {
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }

  const svc = Registrations({
    passCulture: config.passCulture,
    logger: config.getLogConfig('svc', 'registrations'),
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
        processCreate: processPassCultureCreate.bind(null, {
          enqueue,
          services,
        }),
        enqueuePending: enqueue,
        hasPassCultureOffer: hasPassCultureOffer.bind(null, services),
        hasPendingOffer: hasPendingPassCultureOffer,
      },
    },
    shutdown: async options => {
      await shutdownTask(options);
    },
    task,
  });
}
