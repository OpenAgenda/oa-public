'use strict';

module.exports = {
  root: 'http://localhost:3000/',
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_activities',
    password: 'grut',
    user: 'root',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  schemas: {
    activity: 'activity',
    feed: 'activity_feed',
    feed_activity: 'activity_feed_activity',
    feed_follow: 'activity_feed_follow',
    feed_notification: 'activity_feed_notification',
    // neighbor tables, used by the rebuild test via their migrations
    agenda: 'agenda',
    agendaEvent: 'agenda_event',
    aggregator: 'aggregator',
    eventService: 'event',
    stakeholder: 'stakeholder',
    user: 'user',
  },
  interfaces: {
    sendSummary: (/* { user, notifications } */) => {},
  },
  activities: {
    'event.create': {
      notifications: {
        groupBy: ['target'],
      },
    },
    'event.publish': {
      filterFollows: () => true,
    },
    'event.withMask': {
      mask: () => ['actor, store.labels.actor'],
    },
    'agenda.changeEventState': {
      notifications: {
        groupBy: ['target', 'store.newState'],
      },
    },
  },
  enableNotificationsForFeedTypes: ['user'],
};
