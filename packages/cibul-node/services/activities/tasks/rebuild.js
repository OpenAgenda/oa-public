"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'activities/rebuild' );
const rebuildActivityFeeds = require( '@openagenda/activities/dist/service/rebuild' ).rebuild;
const redis = require( 'redis' );
const config = require( '../../../config' );

module.exports = () => {

  const redisClient = redis.createClient( config.redis );
  const sinceKey = 'activities:rebuild:since';

  redisClient.get( sinceKey, ( err, result ) => {
    const since = parseInt( result );
    const startTime = Math.floor( Date.now() / 1000 );

    rebuildActivityFeeds(
      null,
      {
        since: since || 0,
        ..._.pick( config.db, [ 'database', 'host', 'port', 'user', 'password' ] ),
        activityTable: config.schemas.activity,
        feedTable: config.schemas.feed,
        feedActivityTable: config.schemas.feed_activity,
        feedFollowTable: config.schemas.feed_follow,
        feedNotificationTable: config.schemas.feed_notification,
        userTable: config.schemas.user,
        reviewTable: config.schemas.agenda,
        reviewArticleTable: config.schemas.agendaEvent,
        eventTable: config.schemas.event,
        reviewerTable: config.schemas.stakeholder,
        aggregatorTable: config.schemas.aggregator,
        migrationTable: 'activity_migrations',
        logger: config.getLogConfig( 'oa', 'activities', false ),
        cli: false
      },
      log
    )
      .then( () => {
        log.info( 'Synchronization end !', { since } );
        redisClient.set( sinceKey, startTime, _.noop );
      } )
      .catch( err => {
        log.error( 'Error on activities syncing:', err );
      } );
  } );

};
