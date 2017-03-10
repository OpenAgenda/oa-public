"use strict";

const path = require( 'path' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_activities',
    password: 'grut',
    user: 'root'
  },
  migrations: {
    tableName: 'migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    activity: 'activity',
    feed: 'feed',
    feed_activity: 'feed_activity',
    feed_follow: 'feed_follow',
    feed_notification: 'feed_notification'
  }
};
