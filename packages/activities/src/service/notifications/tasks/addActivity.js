"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'activities/dist/notifications/tasks/addActivity' );
const queue = require( '@openagenda/queue' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const groupBy = require( '../lib/groupBy' );

module.exports = config => {
  const q = queue( config.queue.names.addActivity, { redis: config.queue.redis } );

  return Object.assign(
    addActivity.bind( null, config ),
    { task: task.bind( null, config, q ) }
  );
};

function task( config, q, onAdd = null ) {

  q.setConsumer( ( { identifiers, activity }, cb ) => {

    addActivity( config, identifiers, activity, ( err, result ) => {

      if ( err && err.message !== 'The notifications concern only user feeds' ) {
        log( 'error', 'Error in addActivity task: %s', err );
      }

      if ( onAdd ) onAdd( err, result );

      cb( err, result );

    } );

  } );

  q.launch();

  return {
    shutdown: q.shutdown
  }

}

function parseArguments( identifiers, activity, options, cb ) {

  const result = {
    identifiers,
    activity,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      activity: args[ 1 ],
      options: null,
      cb: args[ 2 ]
    } );

  }

  return result;

}

function addActivity( config ) {

  const { service, knex } = config;

  let {
    identifiers,
    activity,
    options,
    cb
  } = parseArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  const params = _.merge( {
    excludeIds: []
  }, options );

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) {
        return Promise.reject( new VError( 'Feed not found' ) );
      }

      if ( feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only user feeds' ) );
      }

      if ( `${feed.entityType}:${feed.entityUid}` === activity.actor ) {
        return null;
      }

      const groupedBy = (groupBy[ activity.verb ] || []).map( v => v + ':' + _.get( activity, v ) ).join( '|' );

      return service.feed( feed ).notifications.get( {
        feedId: feed.id,
        verb: activity.verb,
        groupBy: groupedBy,
        state: 0,
        sent: 0
      }, { excludeIds: params.excludeIds } )
        .then( notif => {

          if ( notif && notif.verb === 'agenda.setOfficial' ) {
            notif = undefined;
          }

          if (
            notif && [ 'agenda.addMember', 'agenda.setMemberRole' ].includes( notif.verb )
            && `${feed.entityType}:${feed.entityUid}` === activity.object
          ) {
            notif = undefined;
          }

          if ( notif === undefined ) {

            const store = {
              actors: activity.actor ? [ activity.actor ] : [],
              objects: activity.object ? [ activity.object ] : [],
              targets: activity.target ? [ activity.target ] : [],
              labels: {
                ...activity.store.labels,
                actor: activity.store && activity.store.labels && activity.store.labels.actor,
                object: activity.store && activity.store.labels && activity.store.labels.object,
                target: activity.store && activity.store.labels && activity.store.labels.target
              }
            };

            const additionalProps = _.without( groupBy[ activity.verb ], 'actor', 'object', 'target' )
              .reduce( ( result, path ) => {
                _.set( result, path, _.get( activity, path ) );
                return result;
              }, {} );

            return knex( config.schemas.feed_notification ).insert( {
              feed_id: feed.id,
              verb: activity.verb,
              group_by: groupedBy,
              store: JSON.stringify( _.merge( store, additionalProps.store ) ),
              updated_at: new Date()
            } )
              .then( ids => service.feed( feed ).notifications.get( ids[ 0 ] ) );

          } else {

            const createNewStoreKey = key => {
              const values = Array.from( notif.store[ key + 's' ] );
              if ( values.includes( activity[ key ] ) ) {
                return values;
              }
              if ( values.length >= 100 ) {
                return { 0: values[ 0 ], length: 101 };
              }
              return values.concat( activity[ key ] );
            };

            const store = Object.assign( {}, notif.store, {
              actors: createNewStoreKey( 'actor' ),
              objects: createNewStoreKey( 'object' ),
              targets: createNewStoreKey( 'target' ),
              labels: {
                actor: activity.store && activity.store.labels && activity.store.labels.actor,
                object: activity.store && activity.store.labels && activity.store.labels.object,
                target: activity.store && activity.store.labels && activity.store.labels.target
              }
            } );

            if (
              [ 'agenda.addMember', 'agenda.setMemberRole' ].includes( notif.verb )
              && store.objects.includes( `${feed.entityType}:${feed.entityUid}` )
            ) {

              return addActivity(
                identifiers,
                activity,
                { excludeIds: (params.excludeIds || []).concat( notif.id ) },
                cb
              );

            }

            return knex( config.schemas.feed_notification ).where( { id: notif.id } ).update( {
              store: JSON.stringify( store ),
              updated_at: new Date()
            } )
              .then( () => service.feed( feed ).notifications.get( notif.id ) );

          }

        } );

    } );

  return promisePlusCb( promise, cb );

}
