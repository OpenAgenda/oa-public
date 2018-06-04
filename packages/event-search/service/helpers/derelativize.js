"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const moment = require( 'moment-timezone' );

module.exports = ( query = {} ) => {
  
  const timezone = _.get( query, 'date.timezone' );

  if ( !timezone ) return query;

  if ( !isValidTimeZone( timezone ) ) {

    throw new Error( 'Invalid timezone' );

  }

  let update = {};

  const localMidnightToday = _getMidnight( timezone );

  _.keys( _.omit( _.get( query, 'date', {} ) ), [ 'timezone' ] ).forEach( operator => {

    if ( query.date[ operator ] === 'today' ) {

      update = _.set( update, 'date.' + operator, { $set: localMidnightToday } );

    }

  } );

  return ih( query, _.set( update, 'date.$unset', [ 'timezone' ] ) );

}


function _getMidnight( timezone ) {

  const local = moment.tz( timezone ).format( 'HH:mm' );

  const [ hours, minutes ] = local.split( ':' );

  const localMidnight = new Date;

  localMidnight.setHours( localMidnight.getHours() - parseInt( hours ) );
  localMidnight.setMinutes( localMidnight.getMinutes() - parseInt( minutes ) );
  localMidnight.setSeconds( 0 );
  localMidnight.setMilliseconds( 0 );

  return localMidnight;

}


function isValidTimeZone( tz ) {

  if ( !Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone ) {
    
    throw 'Time zones are not available in this environment';

  }

  try {

    Intl.DateTimeFormat( undefined, { timeZone: tz } );

    return true;

  } catch ( e ) {

    return false;

  }

}