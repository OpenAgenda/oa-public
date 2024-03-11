import logs from '@openagenda/logs';

const log = logs('services/registrations/ProccesPassPendingOffers');

export default function ProcessPassPendingOffers({ bull, registrations }) {
  const queue = new bull.Queue('pendingOffer', { prefix: '{pendingOffer}' });

  return {
    enqueue({ eventOfferId, datesPayload }, { eventUid, agendaUid }, agendaSettingsRegistrationPassCulture, options = {}) {
      log('enqueue', { eventOfferId, datesPayload, eventUid, agendaUid, options });
      return queue.add('pendingOffer', { eventOfferId, datesPayload, eventUid, agendaUid, agendaSettingsRegistrationPassCulture }, {
        attempts: 73,
        backoff: {
          type: 'fixed', delay: 1000 * 60 * 60,
        },
        ...options,
      });
    },
    task() {
      log('StartingPendingOfferWorker Task');
      const worker = new bull.Worker(queue.name, async job => {
        log('PendingOfferWorker', { name: job.name, data: job.data, attempts: job.attemptsMade });
        switch (job.name) {
          case 'pendingOffer': {
            if (job.attemptsMade === 1) {
              throw new Error('StillPending');
            }
            const { eventOfferId, datesPayload, eventUid, agendaUid, agendaSettingsRegistrationPassCulture } = job.data;
            const completed = await registrations(agendaSettingsRegistrationPassCulture).passCulture.attemptOfferCompletion({ eventOfferId, datesPayload }, { eventUid, agendaUid });
            if (!completed) {
              throw new Error('StillPending');
            }
            // if everithing went well logs attemps made
            log.info('completedOffer', { eventOfferId, datesPayload, eventUid, agendaUid, attemptsMade: job.attemptsMade });
            break;
          }
          default:
            log.warn(`Unkown job ${job.name}`);
        }
      }, {
        prefix: queue.opts.prefix,
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // keep up to 7 days
          count: 1000, // keep up to 1000 jobs
        },
      });

      worker.on('error', failedReason => log.error('error', failedReason));
      worker.on('failed', (job, error) => log.error(job.name, 'failed', job.data, error));
      // worker.on('active', job => {});
      worker.on('completed', (job, result, prev) => log.debug(job.name, 'completed', prev));
    },
  };
}
