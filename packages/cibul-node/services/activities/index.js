"use strict";

const { promisify } = require( 'util' );
const activities = require( '@openagenda/activities' );
const agendasSvc = require( '@openagenda/agendas' );
const { isLessThan, isSuperiorToOrEqual, isEqualTo } = require( '../members' ).utils.compareRoles;
const sendSummary = require( './sendSummary' );

module.exports.init = async config => {

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
    interfaces: {
      sendSummary
    },
    filterFollows: [ {
      verb: [
        'event.create',
        'event.update',
        'event.delete',
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
        'event.delete',
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
          && isLessThan( follow.store.credential, 'moderator' )
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: [ 'agenda.sendInvitation', 'agenda.acceptInvitation' ],
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if (
          isLessThan( follow.store.credential, 'moderator' )
          || ( isEqualTo( follow.store.credential, 'moderator' ) && isEqualTo( activity.store.credential, 'administrator' ) )// moderator doesn't see who has been invited to become an administrator
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
          isLessThan( follow.store.credential, 'moderator' )
          || ( isEqualTo( follow.store.credential, 'moderator' ) && isEqualTo( activity.store.credential, 'administrator' ) ) // moderator doesn't sees who has invited to become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    }, {
      verb: [ 'agenda.updateProfile', 'agenda.updateContribution' ],
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        cb( null, isSuperiorToOrEqual( follow.store.credential, 'administrator' ) );

      }
    }, {
      verb: 'agenda.aggregateEvent',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        // si le target (agenda qui agrège) est le targetFeed
        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid === parseInt( activity.target.split( ':' )[ 1 ] ) ) {

          return cb( null, true );

        }

        // si l'actor (agenda source) est le targetFeed
        if (
          targetFeed.entityType === 'agenda'
          && targetFeed.entityUid === parseInt( activity.actor.split( ':' )[ 1 ] )
        ) {

          return promisify( agendasSvc.get )( {
            uid: parseInt( activity.target.split( ':' )[ 1 ] )
          }, { private: false } )
            .then( agenda => {

              return cb( null, !!agenda );

            }, () => {

              return cb( null, false );

            } );

        }

        // if it is an adminmods
        if (
          originFeed.entityType === 'agenda'
          && targetFeed.entityType === 'user'
          && isSuperiorToOrEqual( follow.store.credential, 'moderator' )
        ) {

          return cb( null, true );

        }

        if ( originFeed.entityType === 'event' && targetFeed.entityType === 'user' ) {

          return cb( null, true );

        }

        return cb( null, false );

      }
    }, {
      verb: 'agenda.addEvent',
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        // si le target (agenda qui agrège) est le targetFeed
        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid === parseInt( activity.target.split( ':' )[ 1 ] ) ) {

          return cb( null, true );

        }

        // si l'agenda source est le targetFeed
        if (
          targetFeed.entityType === 'agenda'
          && targetFeed.entityUid === parseInt( activity.store.sourceAgenda )
        ) {

          return promisify( agendasSvc.get )( {
            uid: parseInt( activity.target.split( ':' )[ 1 ] )
          }, { private: false } )
            .then( agenda => {

              return cb( null, !!agenda );

            }, () => {

              return cb( null, false );

            } );

        }

        // if it is an adminmods
        if (
          originFeed.entityType === 'agenda'
          && targetFeed.entityType === 'user'
          && isSuperiorToOrEqual( follow.store.credential, 'moderator' )
        ) {

          return cb( null, true );

        }

        if ( originFeed.entityType === 'event' && targetFeed.entityType === 'user' ) {

          return cb( null, true );

        }

        return cb( null, false );

      }
    } ],
    logger: config.getLogConfig( 'oa', 'activities', false )
  } );

}
