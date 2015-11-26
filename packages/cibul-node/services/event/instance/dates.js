"use strict";

var i18n = require( '../../../i18n/i18n' ),

moment = require( 'moment' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  var dates;

  return {
    getRange: getRange
  }

  function getRange() {

    let dates = _getDates(),

    first = dates[ 0 ].date,

    last = dates[ dates.length - 1 ].date,

    lang = instance.getCurrentLanguage();

    moment.locale( lang );

    if ( dates.length == 1 ) {

      return moment( dates[ 0 ].date ).format( 'dddd LL' );

    } else if ( dates.length <= 4 ) {

      return _reduceDates( dates.map( d => d.date ), moment );

    }

    if ( moment( first ).format( 'YYYY' ) !== moment( last ).format( 'YYYY' ) ) {

      first = moment( first ).format( 'D MMMM YYYY' );

      last = moment( last ).format( 'D MMMM YYYY' );  

    } else if ( moment( first ).format( 'MM' ) !== moment( last ).format( 'MM' ) ) {

      first = moment( first ).format( 'D MMMM' );

      last = moment( last ).format( 'D MMMM YYYY' );

    } else {

      first = moment( first ).format( 'D' );

      last = moment( last ).format( 'D MMMM YYYY' );

    }

    return i18n( 'from the %firstDate% to the %lastDate%', {
      '%firstDate%' : first,
      '%lastDate%' : last
    }, lang );

  }

  function _getDates() {

    return dates ? dates : dates = instance.getDates();

  }

} );

module.exports.test = {
  _reduceDates: _reduceDates
}


function _reduceDates( dates, moment ) {

  // is it the same month as the next guy / last date ? > display month
  // is it the same year as the next guy / last date ? > display year
  
  return dates.reduce( ( compiled, date, i ) => {

    let displayYear = ( i == dates.length - 1 || date.getFullYear() !== dates[ i + 1 ].getFullYear() );

    let displayMonth = ( i == dates.length - 1 || date.getMonth() !== dates[ i +1 ].getMonth() );

    if ( displayYear ) {

      compiled += _separator( dates, i ) + moment( date ).format( 'D MMMM YYYY' );

    } else if ( displayMonth ) {

      compiled += _separator( dates, i ) + moment( date ).format( 'D MMMM' );

    } else {

      compiled += _separator( dates, i ) + date.getDate();

    }

    return compiled;

  }, '' );


}

function _separator( dates, i ) {

  if ( i == 0 ) return '';

  if ( i == dates.length -1 ) return ' & ';

  return ', '

}