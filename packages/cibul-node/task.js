import tfy from './lib/taskify.js';
import resetApiCounters from './general/resetApiCounters.task.js';

export default (config, core, services) => {
  tfy(resetApiCounters(config, services), {
    // bootOffset: 1000,
    period: 'daily',
    time: '00:00',
  });

  tfy(services.agendaSearch.rebuild, {
    period: 'weekly',
    day: 'sunday',
    time: '01:00',
  });

  tfy(services.agendaSearch.resyncUpdated, {
    period: 'hourly',
  });

  tfy(services.activities.tasks.activities.cleanOld, {
    // bootOffset: 1000,
    period: 'daily',
    time: '01:00',
  });

  tfy(services.activities.tasks.notifications.cleanOld, {
    // bootOffset: 1000,
    period: 'daily',
    time: '01:30',
  });

  tfy(services.activities.notifications().enqueueSummaries, {
    // bootOffset: 1000,
    period: 'daily',
    time: '08:00',
  });

  tfy(services.users.tasks.notifyAndRemove, {
    period: 'daily',
    time: '10:00',
  });

  tfy(services.inboxes.tasks.sync, {
    // bootOffset: 5000,
    period: 'weekly',
    day: 'sunday',
    time: '11:00',
  });

  tfy(services.usageCounters.task, {
    period: 'daily',
    time: '07:00',
  });

  tfy(services.usageCounters.task, {
    period: 'daily',
    time: '14:00',
  });

  /* tfy(services.activities.tasks.rebuild, {
    period: 'weekly',
    day: 'monday',
    time: '03:00',
  }); */
  // services.activities.tasks.rebuild();

  services.agendaDocx.task();

  services.aggregators.task();

  services.activities.addActivity.task();

  services.activities.prepareSummary.task();

  services.mails.task();

  if (services.registrations) {
    services.registrations.task();
  }

  core.tasks();

  // core.agendas.utils.clearAgendasCache();

  services.supervisor.elasticsearch.task();

  tfy(
    services.agendaLocations.task({
      duplicationDetection: config.locationDuplicationDetection,
      reset: false,
    }),
    {
      period: 'weekly',
      day: 'sunday',
      time: '15:00',
    },
  );

  services.users.tasks.processQueue();

  services.members.task();

  services.inboxes.task();

  // services.inboxes.tasks.sync();

  services.eventSearch.task();

  if (services.unsubscriptions) {
    services.unsubscriptions.task();
  }

  tfy(services.accessTokens.clearOldTokens, {
    period: 'daily',
    time: '06:00',
  });

  tfy(services.agendaEvents.clearOldSoftRemoved, {
    period: 'daily',
    time: '06:30',
  });

  // services.eventSearch.rebuild();
  // services.eventSearch.transverse.rebuild();
};
