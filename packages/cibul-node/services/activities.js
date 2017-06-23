"use strict";

const logger = require( 'logger' );

const activities = require( 'activities' );

const agendaStakeholders = require( 'agenda-stakeholders' );

module.exports.init = ( config, cb ) => {

  const getRole = agendaStakeholders.types.get;

  return activities.init( {
    mysql: config.db,
    schemas: config.schemas,
    migrations: {
      tableName: 'activity_migrations'
    },
    notificationsForUids: config.versions.notifications.userUids,
    queue: {
      names: {
        addActivity: config.queues.notificationAddActivity,
        sendSummary: config.queues.notificationSendSummary
      },
      redis: config.redis
    },
    filterFollows: [ {
      verb: [ 'event.publish', 'event.unpublish' ],
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid !== activity.target.split( ':' )[ 1 ] ) {
          return cb( null, false );
        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.sendInvitation',
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' ) ) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.acceptInvitation',
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' ) ) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.addMember',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'user' && targetFeed.entityUid === parseInt( activity.object.split( ':' )[ 1 ] ) ) {

          return cb( null, true );

        }

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' ) ) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.setMemberRole',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'user' && targetFeed.entityUid === parseInt( activity.object.split( ':' )[ 1 ] ) ) {

          return cb( null, true );

        }

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' ) ) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.updateContribution',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) ) { // less than moderator

          return cb( null, false );

        }

        cb( null, true );

      }
    } ],
    logger
  }, cb );

}
