import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/registrations/ProcessPassPendingOffers');

function isStillPending(data) {
  return !data.filter((d) => d.response?.isPending === false).length;
}

function isRejected(data) {
  return data.filter((d) => d.response?.isRejected === true).length;
}

function Enqueue({ queue, pendingConfig, tracker }) {
  return ({ eventUid, agendaUid }, options = {}) => {
    const logBundle = {
      eventUid,
      agendaUid,
      options,
    };
    if ((options.retries ?? 0) >= pendingConfig.maxRetries) {
      log.info('max retries reached. Not enqueuing.', logBundle);
      tracker('registrations.passCulture.enqueue.max');
      return;
    }

    log.info('enqueue', logBundle);
    return queue.add(
      'pendingOffer',
      {
        eventUid,
        agendaUid,
        next: {
          delay: Math.max(options.delay * 0.75, pendingConfig.minDelay),
          retries: (options.retries ?? 0) + 1,
        },
      },
      {
        delay: options.delay ?? pendingConfig.initialDelay,
      },
    );
  };
}

function task({ enqueue, services, registrations, queue }) {
  const { agendas, events, core, bull, tracker } = services;

  const worker = new bull.Worker(
    queue.name,
    async (job) => {
      if (job.name !== 'pendingOffer') {
        log.error('unknown job', job.name);
      }
      tracker('registrations.passCulture.pendingOffer.processing');

      const { eventUid, agendaUid, next } = job.data;

      const logBundle = {
        job: _.pick(job, ['name', 'data']),
        eventUid,
        agendaUid,
      };

      log.info('pendingOffer: processing', logBundle);

      const agenda = await agendas.get({ uid: agendaUid }, { private: null });

      if (!agenda) {
        throw new Error('agenda not found');
      }

      const event = await events.get(eventUid, {
        private: null,
        includeFields: ['registration', 'timings', 'uid'],
      });

      if (!event) {
        throw new Error('event not found');
      }

      const passCultureService = registrations(
        agenda.settings.registration,
      ).passCulture;

      const passCultureData = (event?.registration ?? []).find(
        (r) => r.service === 'passCulture',
      )?.data;

      const applied = await passCultureService.apply(event, passCultureData);

      if (isStillPending(applied)) {
        log.info('pendingOffer: still pending', logBundle);
        await enqueue({ eventUid, agendaUid }, next);
        tracker('registrations.passCulture.pendingOffer.processed.pending');
        return;
      }

      const rejected = isRejected(applied);

      if (rejected) {
        tracker('registrations.passCulture.pendingOffer.processed.rejected');
      }

      log.info('pendingOffer: no longer pending, changes were applied', {
        ...logBundle,
        rejected,
      });

      await core.agendas(agendaUid).events.patch(
        eventUid,
        {
          registration: event.registration.map((r) =>
            (r.service === 'passCulture'
              ? {
                ...r,
                data: applied,
              }
              : r)),
        },
        { access: 'internal' },
      );

      tracker('registrations.passCulture.pendingOffer.processed.notPending');
    },
    {
      prefix: queue.opts.prefix,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) =>
    log.error(job.name, 'failed', job.data, error));
  // worker.on('active', job => {});
  worker.on('completed', (job, result, prev) =>
    log.debug(job.name, 'completed', prev));

  return {
    shutdown: async (options = {}) => {
      // Fermer le worker AVANT de purger ; sur `clear` (tests), obliterate la queue
      // entière plutôt qu'un `drain()` qui laisse fuiter un job vers la suite suivante.
      // En prod, on ne purge rien : les offres en attente survivent au restart
      // (l'ancien `drain()` inconditionnel les détruisait — scorie corrigée).
      await worker.close();
      if (options.clear) {
        await queue.obliterate({ force: true });
      }
    },
  };
}

export default function ProcessPassPendingOffers({
  services,
  registrations,
  pending: pendingConfig,
}) {
  const { bull, tracker } = services;

  let shutdownTask;

  const queue = new bull.Queue('pendingOffer', { prefix: '{pendingOffer}' });

  const enqueue = Enqueue({ queue, pendingConfig, tracker });

  return {
    enqueue,
    task: () => {
      const handlers = task({
        enqueue,
        services,
        registrations,
        queue,
      });

      shutdownTask = handlers.shutdown;
    },
    shutdown: (options) => (shutdownTask ? shutdownTask(options) : null),
  };
}
