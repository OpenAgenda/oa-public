'use strict';

const tfy = require('./lib/taskify');
const resetApiCounters = require('./general/resetApiCounters.task');
const legacyAgendaServiceTask = require('./services/agenda/task');

module.exports = (config, core, services) => {
  tfy(resetApiCounters, { period: 'daily', time: '00:00' });

  tfy(services.elasticsearch.refresh, {
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

  tfy(services.activities.tasks.rebuild, {
    period: 'weekly',
    day: 'monday',
    time: '03:00',
  });

  tfy(services.mails.unsubscription.task, {
    period: 'weekly',
    day: 'saturday',
    time: '03:00',
  });

  services.agendaDocx.task();

  legacyAgendaServiceTask();

  services.aggregators.task();

  services.agendaStatistics.task();

  services.activities.tasks.notifications.addActivity.task();

  services.mails.task();

  services.legacy.task();

  core.tasks();

  services.agendaLocations.task({
    duplicationDetection: config.locationDuplicationDetection,
    reset: false,
  });

  services.members.task();

  if (process.env.NODE_ENV !== 'production') { // COMMENT THIS WITH PRECAUTION
    /* services.elasticsearch.resync({
      reset: true,
      since: '2019-05-14',
      removeZombies: false,
      logEveryUpdate: true
    }, (err, res) => console.log('FINI', err, res)); */
  }

  // services.inboxes.tasks.sync();

  // handle interfaces for grouped operations (a remove of a 100 refs queues 100 onRemoves executions)
  services.agendaEvents.tasks.interfaces({ interval: 10 });

  services.eventSearch.task();

  // services.eventSearch.rebuild();
  // services.eventSearch.transverse.rebuild();
};
