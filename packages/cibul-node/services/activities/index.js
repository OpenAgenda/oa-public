"use strict";

const _ = require( 'lodash' );
const activities = require( '@openagenda/activities' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );

module.exports.init = async config => {

  const getRole = agendaStakeholders.types.get;

  await activities.init( {
    mysql: config.db,
    schemas: config.schemas,
    migrations: {
      tableName: 'activity_migrations'
    },
    queue: {
      names: {
        addActivity: config.queues.notificationAddActivity,
        sendSummary: config.queues.notificationSendSummary
      },
      redis: config.redis
    },
    root: config.root,
    filterFollows: [ {
      verb: [
        'event.create',
        'event.update',
        'agenda.unpublishEvent',
        'agenda.removeEvent',
        'agenda.changeEventState'
      ],
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid !== parseInt( activity.target.split( ':' )[ 1 ] ) ) {
          return cb( null, false );
        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.publishEvent',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid === activity.store.originAgendaUid ) {
          return cb( null, true );
        }

        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid !== parseInt( activity.target.split( ':' )[ 1 ] ) ) {
          return cb( null, false );
        }

        cb( null, true );

      }
    }, {
      verb: [
        'event.create',
        'event.update',
        'agenda.publishEvent',
        'agenda.unpublishEvent',
        'agenda.removeEvent',
        'agenda.changeEventState'
      ],
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if (
          originFeed.entityType === 'agenda'
          && targetFeed.entityType === 'user'
          && !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: [ 'agenda.sendInvitation', 'agenda.acceptInvitation' ],
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' )) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: [ 'agenda.addMember', 'agenda.setMemberRole' ],
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'user' && targetFeed.entityUid === parseInt( activity.object.split( ':' )[ 1 ] ) ) {

          return cb( null, true );

        }

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' )) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: [ 'agenda.updateProfile', 'agenda.updateContribution' ],
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'administrator' ), true ) ) { // less than administrator

          return cb( null, false );

        }

        cb( null, true );

      }
    } ],
    logger: config.getLogConfig( 'oa', 'activities', false )
  } );

}
