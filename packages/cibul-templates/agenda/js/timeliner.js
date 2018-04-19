"use strict";

var i18n = require( '../../layout/js/i18n' ),

frLabels = require( './timeliner.fr.json' ),

today = new Date(),

todayDate = new Date( today.getFullYear(), today.getMonth(), today.getDate() ),

dom = require( './timeliner.dom' ),

monthTime = 24*60*60*1000*30, // approx

yearTime = 24*60*60*1000*365; // less approx

module.exports = function( lang ) {

  var __ = i18n( lang == 'fr' ? frLabels : {} ),

  l = labelizer( __ ),

  exported = l;

  exported.dom = dom( l );

  return exported;

}


function labelizer( __ ) {

  return function( dt ) {

    var diff = _diff( dt ), unit, unitLabel = 'days', label;

    if ( Math.abs( diff ) > 365*2 ) {

       unit = yearTime;

       unitLabel = 'years';

    } else if ( Math.abs( diff ) > 60 ) {

      unit = monthTime;

      unitLabel = 'months';

    }

    if ( unitLabel !== 'days' ) { // means we need to recalculate

      diff = _diff( dt, unit );

    }

    label = ( diff < 0 ? '%count% %units% ago' : 'in %count% %units%' );

    if ( unitLabel == 'days' ) {

      if ( diff == 0 ) return __( 'today' );

      if ( diff == 1 ) return __( 'tomorrow' );

      if ( diff == -1 ) return __( 'yesterday' );

    }

    return __( label, { '%count%' : Math.abs( diff ) , '%units%' : __( unitLabel ) } );

  }

}



/**
 * expects something like "2015-02-23T18:00:00.000Z" or Date
 *
 * unit: atomic unit in milliseconds. Defaults to one day ( h*m*s*ml )
 */

function _diff( dt, unit ) {

  var d = new Date( dt ), diff;

  if ( typeof unit == 'undefined' ) {

    unit = 24*60*60*1000;

  }

  d = new Date( d.getFullYear(), d.getMonth(), d.getDate() );

  return Math.round( ( d.getTime() - todayDate.getTime() ) / unit );

}