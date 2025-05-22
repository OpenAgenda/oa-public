import Registrations from '@openagenda/registrations';
import logs from '@openagenda/logs';
import ProcessPassPendingOffers from './utils/ProcessPassPendingOffers.js';
import processPassCultureApply from './utils/passCulture/processApply.js';
import process from './utils/passCulture/process.js';
import listBooking from './utils/passCulture/listBooking.js';

const log = logs('services/registrations');

export function init(config, services) {
  if (!config.passCulture?.key) {
    log('warn', 'No passCultureKey provided, registrations is not initialized');
    return;
  }

  const svc = Registrations({
    passCulture: config.passCulture,
    logger: config.getLogConfig('svc', 'registrations'),
    imageBasePath: config.s3.bucket,
  });

  const {
    enqueue,
    task,
    shutdown: shutdownTask,
  } = ProcessPassPendingOffers({
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
        process: process.bind(null, { services }),
        bookings: listBooking.bind(null, { services }),
        isMarkedAsPending: (data) => data?.[0]?.response?.isPending,
        isNew: (data) => !data[0]?.appliedAt,
        hasNonApplied: (data) =>
          !!data.filter((item) => !item.appliedAt).length,
        enqueuePending: enqueue,
      },
    },
    shutdown: async (options) => {
      await shutdownTask(options);
    },
    task,
  });
}
