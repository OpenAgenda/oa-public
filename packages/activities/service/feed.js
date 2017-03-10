"use strict";

const _ = require( 'lodash' );
const feeds = require( './feeds' );
const activities = require( './activities' );
const notifications = require( './notifications' );

let config;
let knex;

const FEED_TYPES = [ 'user', 'agenda', 'event' ];


module.exports = Object.assign( feed, { init } );


function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function feed( entityType, entityUid ) {

  return _.deeply( _.mapValues )( Object.assign( feeds( entityType, entityUid ), {
    activities: activities( entityType, entityUid ),
    notifications: notifications( entityType, entityUid )
  } ), v => {

    if ( typeof v !== 'function' ) return v;

    return () => {

      if ( !config ) throw new Error( 'service not initialized' );

      const identifiers = arguments.length === 1 ? { id: entityType } : { entityType, entityUid };

      if ( identifiers.entityType && !FEED_TYPES.includes( entityType ) ) {

        throw new Error( `You cannot use feed of type ${entityType}` );

      }

      return v.apply( this, arguments );

    };

  } );

}

_.mixin( {
  deeply( map ) {
    return ( obj, fn ) => {
      return map( _.mapValues( obj, v => {
        return _.isPlainObject( v ) ? _.deeply( map )( v, fn ) : v;
      } ), fn );
    }
  },
} );

/*
obj = _.deeply(_.mapKeys)(obj, (value, key) => {
  return key;
});

obj = _.deeply(_.mapValues)(obj, (value, key, object) => {
  return value;
});
*/
