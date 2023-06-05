"use strict";

const path = require( 'path' );
const Queues = require('@openagenda/queues');

module.exports = {
  root: 'http://localhost:3000/',
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_activities',
    password: 'grut',
    user: 'root',
    ssl: true,
  },
  migrations: {
    tableName: 'activity_migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    activity: 'activity',
    feed: 'activity_feed',
    feed_activity: 'activity_feed_activity',
    feed_follow: 'activity_feed_follow',
    feed_notification: 'activity_feed_notification',
    // The following schemas ar used only for rebuild tests
    rebuild_agenda: 'rebuild_agenda',
    rebuild_event: 'rebuild_event',
    rebuild_review_article: 'rebuild_review_article',
    rebuild_reviewer: 'rebuild_reviewer',
    rebuild_user: 'rebuild_user',
    rebuild_aggregator: 'rebuild_aggregator',
  },
  interfaces: {
    sendSummary: ({ user, notifications }) => {}
  },
  activities: {
    'event.create': {
      notifications: {
        groupBy: ['target'],
      },
    },
    'event.publish': {
      filterFollows: () => true
    },
    'event.withMask': {
      mask: () => ['actor, store.labels.actor']
    },
    'agenda.changeEventState': {
      notifications: {
        groupBy: ['target', 'store.newState'],
      },
    },
  },
  queue: {
    names: {
      addActivity: 'notificationAddActivityTest',
      sendSummary: 'notificationSendSummaryTest'
    },
  },
  queues: Queues({
    redis: {
      host: 'localhost',
      port: 6379
    }
  }),
  enableNotificationsForFeedTypes: ['user'],
};
