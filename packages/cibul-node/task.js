import tfy from './lib/taskify.js';

export default (config, core, services, tasksList) => {
  if (tasksList.includes('critical')) {
    services.activities.addActivity.task();

    services.activities.prepareSummary.task();

    services.mails.task();

    services.behavioralEmails.task();

    services.users.tasks.processQueue();

    if (services.registrations) {
      services.registrations.task();
    }

    if (services.unsubscriptions) {
      services.unsubscriptions.task();
    }
  }

  if (tasksList.includes('search')) {
    tfy(services.agendaSearch.rebuild, {
      period: 'weekly',
      day: 'sunday',
      time: '01:00',
    });

    tfy(services.agendaSearch.resyncUpdated, {
      period: 'hourly',
    });

    services.knex.monitorRTT();

    services.eventSearch.task();

    services.supervisor.elasticsearch.task();

    tfy(services.agendaLocations.task.detectDuplicateCandidates, {
      period: 'weekly',
      day: 'sunday',
      time: '15:00',
    });

    services.agendaLocations.task();

    // services.eventSearch.rebuild();
    // services.eventSearch.transverse.rebuild();
  }

  if (tasksList.includes('notifications')) {
    tfy(services.activities.notifications().enqueueSummaries, {
      // bootOffset: 1000,
      period: 'daily',
      time: '08:00',
    });

    tfy(services.users.tasks.notifyAndRemove, {
      period: 'daily',
      time: '10:00',
    });

    tfy(services.usageCounters.task, {
      period: 'daily',
      time: '07:00',
    });

    tfy(services.usageCounters.task, {
      period: 'daily',
      time: '14:00',
    });
  }

  if (tasksList.includes('aggregation')) {
    services.agendaDocx.task();

    services.aggregators.task();

    services.inboxes.task();

    tfy(services.inboxes.tasks.sync, {
      // bootOffset: 5000,
      period: 'weekly',
      day: 'sunday',
      time: '11:00',
    });

    services.members.task();

    core.tasks();

    // core.agendas.utils.clearAgendasCache();
    // services.inboxes.tasks.sync();
  }

  if (tasksList.includes('maintenance')) {
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

    tfy(services.accessTokens.clearOldTokens, {
      period: 'daily',
      time: '06:00',
    });

    tfy(services.agendaEvents.clearOldSoftRemoved, {
      period: 'daily',
      time: '06:30',
    });

    /* tfy(services.activities.tasks.rebuild, {
    period: 'weekly',
    day: 'monday',
    time: '03:00',
  }); */
    // services.activities.tasks.rebuild();
  }
};
