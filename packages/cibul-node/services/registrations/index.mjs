import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';
import ProcessPassPendingOffers from './utils/ProcessPassPendingOffers.mjs';
import createPassCultureOffer from './utils/createPassCultureOffer.mjs';
import hasPendingPassCultureOffer from './utils/hasPendingPassCultureOffer.mjs';
import hasPassCultureOffer from './utils/hasPassCultureOffer.mjs';
import patchOaEventRegistration from './utils/patchOaEventRegistration.mjs';

const log = logs('services/registrations');

const checkEventStatus = async (services, agendaUid, eventUid) => {
  const { core } = services;
  const event = await core.agendas(agendaUid).events.get(eventUid, { access: 'internal' });

  if (!event) {
    log('checkEventStatus', 'event not found');
    return false;
  }
  if (event.draft) {
    log('checkEventStatus', 'event is draft');
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
    passCulture: {
      ...config.passCulture,
      interfaces: {
        patchOaEventRegistration: patchOaEventRegistration.bind(null, services),
        checkEventStatus: checkEventStatus.bind(null, services),
      },
    },
    logger: config.getLogConfig('svc', 'registrations'),
  });

  const {
    task: processPassPendingOffersTask,
    enqueue: enqueueProcessPendingOffer,
  } = ProcessPassPendingOffers({ bull: services.bull, registrations: svc });

  return Object.assign(svc, {
    settings: {
      passCulture: {
        offerLink: config.passCulture.offerLink,
        offerEditLink: config.passCulture.offerEditLink,
      },
    },
    utils: {
      passCulture: {
        enqueueProcessPendingOffer,
        createPassCultureOffer: createPassCultureOffer.bind(null, services),
        hasPassCultureOffer: hasPassCultureOffer.bind(null, services),
        hasPendingOffer: hasPendingPassCultureOffer,
      },
    },
    task: processPassPendingOffersTask,
  });
}
