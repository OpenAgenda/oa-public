"use strict";

var utils = require( '@openagenda/utils' );

module.exports = {
  toTimingsWidgetFormat: toTimingsWidgetFormat,
  toEventFormFormat: toEventFormFormat
}

/**
 * [{
 *   "date":"2010-01-01",
 *   "begin":"10:00",
 *   "end":"15:00"
 *  },{
 *    "date":"2010-10-10",
 *    "begin":"13:00",
 *    "end":"20:00"
 *  },{
 *    "date":"2012-08-01",
 *    "begin":"08:00",
 *    "end":"15:00"
 *  },{
 *    "date":"2010-03-10",
 *    "begin":"10:00",
 *    "end":"20:00"
 *  }]
 */

function toEventFormFormat( timings, dayStart, dayEnd ) {

  return timings

  .filter( function( t ) {

    var s = new Date( t.start ),

    e = new Date( t.end );

    if ( s.getTime() === e.getTime() ) return false;

    if ( s.getDate() !== e.getDate() ) {

      if ( dayEnd < _stringifyHours( e ) ) return false;

    } 
    
    return true;   

  } )

  .map( function( t ) {

    var s = new Date( t.start ),

    e = new Date( t.end );

    return {
      date: s.getFullYear() + '-' + utils.fZ( s.getMonth() + 1 ) + '-' + utils.fZ( s.getDate() ),
      begin: _stringifyHours( s ),
      end: _stringifyHours( e )
    }

  } )

}

/**
 *  [ {
 *    "start":"2010-01-01T10:00+01:00",
 *    "end":"2010-01-01T15:00+01:00"
 *  }, {
 *    "start":"2010-10-10T13:00+02:00",
 *    "end":"2010-10-10T20:00+02:00"
 *  }, {
 *    "start":"2012-08-01T08:00+02:00",
 *    "end":"2012-08-01T15:00+02:00"
 *  }, {
 *    "start":"2010-03-10T10:00+01:00",
 *    "end":"2010-03-10T20:00+01:00"
 *  } ]
 */



/**
 * [{
 *   "start":"2010-01-01T09:00:00.000Z",
 *   "end":"2010-01-01T14:00:00.000Z"
 * },{
 *   "start":"2010-03-10T09:00:00.000Z",
 *   "end":"2010-03-10T19:00:00.000Z"
 * },{
 *   "start":"2010-10-10T11:00:00.000Z",
 *   "end":"2010-10-10T18:00:00.000Z"
 * },{
 *   "start":"2012-08-01T06:00:00.000Z",
 *   "end":"2012-08-01T13:00:00.000Z"
 * },{
 *   "start":"2012-08-03T07:00:00.000Z",
 *   "end":"2012-08-03T10:00:00.000Z"
 * }]
 */

function toTimingsWidgetFormat( timings, dayStart, dayEnd ) {

  return ( timings || [] )

  .filter( function( t ) {

    // end can only be smaller or equal to begin if end is on the next day
    if ( t.end <= _cleanTime( t.begin ) ) {

      if ( _cleanTime( t.end ) > dayEnd ) return false;

    }

    return true;

  } )

  .map( function( t ) {

    return {
      start: t.date + 'T' + t.begin + _tZ( t.date, t.begin ),
      end: _endDate( t.date, t.begin, t.end ) + 'T' + t.end + _tZ( t.date, t.begin )
    }

  } );

}


function _endDate( d, begin, end ) {

  var date;

  if ( end > begin ) {

    return d;

  }

  date = new Date( d );

  date.setDate( date.getDate() + 1 );

  return [ 
    date.getFullYear(), utils.fZ( date.getMonth() + 1 ),
    utils.fZ( date.getDate() )
  ].join( '-' );

}


function _tZ( d, t ) {

  var tzh = ( new Date( d + 'T' + t ) ).getTimezoneOffset() / 60;

  return ( tzh >= 0 ? '' : '+' ) + utils.fZ( - tzh ) + ':00';

}

function _stringifyHours( d ) {

  return utils.fZ( d.getHours() ) + ':' + utils.fZ( d.getMinutes() );

}

function _cleanTime( str ) {

  if ( !str ) return null;

  if ( str.length > 5 ) return str.substr( 0, 5 );

  return str;

}