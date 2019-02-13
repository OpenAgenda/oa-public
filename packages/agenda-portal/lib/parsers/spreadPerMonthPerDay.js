"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment-timezone' );
const tz = require( 'moment-timezone' ).tz;

const getMonthWeek = require( './getMonthWeek' );

module.exports = ( timings = [], timezone = 'Europe/Paris', locale = 'en' ) => {

  moment.locale( locale );

  if ( !timings.length ) return [];

  const keyedTimings = timings.reduce( ( carry, timing ) => {

    const start = new Date( timing.start );

    if ( !carry.first || start < carry.first ) {

      carry.first = start;

    }

    if ( !carry.last || start > carry.last ) {

      carry.last = start;

    }

    const keys = _getKeys( timing.start, timezone );

    if ( !_.get( carry.months, [ keys.month, keys.week, keys.day ] ) ) {

      _prepare( carry.months, keys );

    }

    return _.set( carry, [ 'months', keys.month, keys.week, keys.day ], _.get(
      carry.months,
      [ keys.month, keys.week, keys.day ],
      []
    ).concat( timing ) );

  }, {
    first: null,
    last: null,
    months: {}
  } );

  const months = [];
  const today = _getKeys( new Date(), timezone );
  let dayCursor = keyedTimings.first;

  const last = tz( keyedTimings.last, timezone ).format( 'YYYY-MM' );

  while ( tz( dayCursor, timezone ).format( 'YYYY-MM' ) <= last ) {

    const keys = _getKeys( dayCursor, timezone );

    months.push( {
      key: keys.month,
      current: today.month === keys.month,
      label: _.capitalize( tz( dayCursor, timezone ).format( 'MMMM YYYY' ) ),
      weeks: _monthWeeks( keys.month, keyedTimings.months[ keys.month ], timezone, today )
    } );

    dayCursor.setMonth( dayCursor.getMonth() + 1 );

  }

  return months.map( ( m, index ) => _.assign( m, {
    hasPrevious: index !== 0,
    hasNext: index !== months.length - 1
  } ) );

}

function _monthWeeks( month, weeks, timezone, today ) {

  if ( !weeks ) return [];

  return _.keys( weeks ).map( week => ( {
    week,
    label: week,
    current: today.week === week,
    days: _.keys( weeks[ week ] ).map( day => ( {
      day,
      current: today.day === day,
      passed: today.month + today.day > month + day,
      timings: weeks[ week ][ day ].map( t => ( {
        start: { value: t.start, label: tz( t.start, timezone ).format( 'LT' ) },
        end: { value: t.end, label: tz( t.end, timezone ).format( 'LT' ) }
      } ) ),
      label: _.capitalize( tz( _.get( weeks[ week ][ day ], '0.start' ), timezone ).format( 'dddd D' ) )
    } ) )
  } ) );

}


function _prepare( months, keys ) {

  if ( !months[ keys.month ] ) months[ keys.month ] = {};
  if ( !months[ keys.month ][ keys.week ] ) months[ keys.month ][ keys.week ] = {};
  if ( !months[ keys.month ][ keys.week ][ keys.day ] ) months[ keys.month ][ keys.week ][ keys.day ] = [];

}

function _getKeys( d, timezone ) {

  return {
    month: tz( d, timezone ).format( 'YYYY-MM' ),
    week: getMonthWeek( d, timezone ),
    day: tz( d, timezone ).format( 'DD' )
  }

}
