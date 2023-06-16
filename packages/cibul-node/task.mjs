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

  tfy(services.activities.tasks.notifications.prepareSummary, {
    // bootOffset: 1000,
    period: 'daily',
    time: '05:00',
  });

  tfy(services.activities.tasks.notifications.sendSummary.task, {
    // bootOffset: 5000,
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

  /* tfy(services.activities.rebuild, {
    period: 'monthly',
    day: 'monday',
    time: '03:00',
  }); */

  tfy(services.mails.unsubscription.task, {
    period: 'weekly',
    day: 'saturday',
    time: '03:00',
  });

  services.agendaDocx.task();

  services.aggregators.task();

  services.agendaStatistics.task();

  services.activities.tasks.notifications.addActivity.task();

  services.mails.task();

  services.legacy.task();

  core.tasks();

  services.supervisor.elasticsearch.task();

  services.agendaLocations.task({
    duplicationDetection: config.locationDuplicationDetection,
    reset: false,
  });

  services.users.tasks.processQueue();

  services.members.task();

  // services.inboxes.tasks.sync();

  // handle interfaces for grouped operations (a remove of a 100 refs queues 100 onRemoves executions)
  services.agendaEvents.task();

  services.eventSearch.task();

  // services.eventSearch.rebuild();
  // services.eventSearch.transverse.rebuild();
};
