"use strict";

var i18n = require( '../../../i18n/i18n' ),

moment = require( 'moment' ),

utils = require( 'utils' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  var dates, lang;

  return {
    getRange: getRange
  }

  function getRange() {

    return _getRange( _getDates(), _getLang() );

  }

  function _getDates() {

    return dates ? dates : dates = instance.getDates();

  }

  function _getLang() {

    return lang ? lang : lang = instance.getCurrentLanguage();

  }

} );

module.exports.test = {
  _getRange: _getRange
}


function _getRange( dates, lang, format ) {

  moment.locale( lang );

  var upcomingDates = dates.filter( _isTodayOrLater );

  if ( dates.length == 1 && dates[ 0 ].timings.length == 1 ) {

    return _displaySingleTiming( dates[ 0 ].timings[ 0 ], lang, format );

  } else if ( dates.length == 1 ) {

    return _displaySingleDate( dates[ 0 ], lang, format );

  } else if ( upcomingDates.length == 1 && upcomingDates[ 0 ].timings.length == 1 ) {

    return _displaySingleTiming( upcomingDates[ 0 ].timings[ 0 ], lang, format );

  } else if ( upcomingDates.length == 1 ) {

    return _displaySingleDate( upcomingDates[ 0 ], lang, format );

  } else if ( upcomingDates.length == 2 || dates.length == 2 ) {

    let d = dates.length == 2 ? dates : upcomingDates;

    return i18n( '%firstDate% and the %secondDate%', {
      '%firstDate%' : _getRange( [ d[ 0 ] ], lang ),
      '%secondDate%' : _getRange( [ d[ 1 ] ], lang, 'Do MMMM' )
    }, lang );

  } else if ( upcomingDates.length > 2 && upcomingDates.length <= 4 ) {

    return i18n( '%firstDate% + %count% other dates', {
      '%firstDate%' : _getRange( [ upcomingDates[ 0 ] ], lang ),
      '%count%' : upcomingDates.length - 1
    }, lang );

  } else if ( upcomingDates.length > 4 ) {

    return i18n( '%firstDate% and until the %lastDate%', {
      '%firstDate%' : _getRange( [ upcomingDates[ 0 ] ], lang ),
      '%lastDate%' : _renderDate( upcomingDates[ upcomingDates.length - 1 ].date, lang, 'Do MMMM' )
    }, lang );

  } else if ( dates.length ) { // no upcoming dates

    return i18n( '%firstDate% and until the %lastDate%', {
      '%firstDate%' : _getRange( [ dates[ 0 ] ], lang ),
      '%lastDate%' : _renderDate( dates[ dates.length - 1 ].date, lang, 'Do MMMM' )
    }, lang )

  } else {

    return i18n( 'no dates available', lang );

  }

}


function _displaySingleDate( date, lang, format ) {

  return i18n( '%date% at %times%', {
    '%date%' : _renderDate( date.timings[ 0 ].start, lang, format ),
    '%times%' : _renderTimes( date.timings )
  }, lang );

}


function _displaySingleTiming( timing, lang, format ) {

  return i18n( '%date% from %start% to %end%', {
    '%date%' : _renderDate( timing.start, lang, format ),
    '%start%' : _renderTime( timing.start, lang ),
    '%end%' : _renderTime( timing.end, lang )
  }, lang );

}


function _renderDate( dt, lang, format ) {

  let displayYear = !_isCurrentYear( dt );

  if ( !format ) format = 'dddd D MMMM';

  return moment( dt ).format( format + ( displayYear ? ' YYYY' : '' ) );

}


function _renderTime( date, lang ) {

  var sep = 'h',

  dt = typeof date == 'string' ? new Date( date ) : date,

  h = dt.getUTCHours() + sep,

  m = dt.getUTCMinutes();

  if ( m ) return [ h, utils.fZ( m ) ].join( '' );

  return h;

}


function _renderTimes( timings, lang ) {

  var str = '';

  timings.forEach( ( t, i ) => {

    let rt = _renderTime( t.start, lang );

    if ( !str.length ) {

      str = rt;

    } else {

      str += ( i == timings.length - 1 ? ' & ' : ', ' ) + rt;

    }

  } );

  return str;

}


function _isCurrentYear( date ) {

  var dt = typeof date == 'string' ? new Date( date ) : date,

  d = new Date();

  return d.getFullYear() == dt.getFullYear();

}

function _isTodayOrLater( d ) {

  var now = new Date(), date = d.date;

  return ( date > now )

  || ( date.getFullYear() == now.getFullYear()

  && date.getMonth() == now.getMonth()

  && date.getDate() == now.getDate() );

}