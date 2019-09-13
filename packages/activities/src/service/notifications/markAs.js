"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const notificationStates = require( '../notificationStates' );

module.exports =  markAs;

function parseArguments( identifiers, query, newState, options, cb ) {

  const result = {
    identifiers,
    query,
    newState,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 4 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      query: args[ 1 ],
      newState: args[ 2 ],
      options: {},
      cb: args[ 3 ]
    } );

  }

  return result;

}

function markAs( config ) {

  const { service, knex } = config;

  let {
    identifiers,
    query,
    newState,
    options,
    cb
  } = parseArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const params = _.merge( {
    allowRegress: true,
    listArgs: []
  }, options );

  if ( typeof newState === 'string' ) newState = notificationStates.reverse[ newState ];

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) {
        return Promise.reject( new VError( 'Feed not found' ) );
      }

      if ( feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only user feeds' ) );
      }

      return service.feed( feed ).notifications.list.apply( null, [ query ].concat( params.listArgs ) )
        .then( notifs => {

          const request = knex( config.schemas.feed_notification )
            .where( 'feed_id', feed.id )
            .whereIn( 'id', notifs.map( v => v.id ) );

          if ( !params.allowRegress ) {
            request.where( 'state', '<', newState );
          }

          return request.update( {
            state: newState
          } )
            .then( () => service.feed( feed ).notifications.list.apply( null, [ query ].concat( params.listArgs ) ) );

        } );

    } );

  return promisePlusCb( promise, cb );

};
