"use strict";

const _ = require( 'lodash' );
const FEED_TYPES = require( './feedTypes' );


module.exports = function feed( config, identifiers ) {

  const { feeds, activities, notifications } = config.service;

  if ( !_.isObject( identifiers ) ) identifiers = { id: identifiers };

  return _.deeply( _.mapValues )( Object.assign( feeds( identifiers ), {
    activities: activities( identifiers ),
    notifications: notifications( identifiers )
  } ), v => {

    if ( typeof v !== 'function' ) return v;

    return ( ...args ) => {

      if ( !config ) throw new Error( 'service not initialized' );

      if ( identifiers.entityType && !FEED_TYPES.includes( identifiers.entityType ) ) {

        throw new Error( `You cannot use feed of type ${identifiers.entityType}` );

      }

      return v.apply( null, args );

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
