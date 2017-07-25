"use strict";

const path = require( 'path' );

module.exports = {
  root: 'http://localhost:3000/',
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_activities',
    password: 'grut',
    user: 'root'
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
  notificationsForUids: [
    42,
    31046551,
    75052324,
    99999999,
    7339049,
    71438739,
    6178397
  ],
  filterFollows: [ {
    verb: 'event.publish',
    getFeeds: true,
    filter: ( activity, originFeed, targetFeed, follow, cb ) => {
      cb( null, true );
    }
  } ],
  queue: {
    names: {
      addActivity: 'notificationAddActivityTest',
      sendSummary: 'notificationSendSummaryTest'
    },
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
};
