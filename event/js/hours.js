"use strict";

/**
 * add navigation to timings bit
 */

var utils = require( 'utils' ),

du = require( 'dom-utils' ),

params = {
  attributes: {
    date: 'data-date'
  },
  classes: {
    displayNone: 'display-none'
  },
  selectors: {
    origin: '.js_timings_canvas',
    destination: false,
    right: '.js_right',
    left: '.js_left',
    months: '.js_months'
  },
  onToggle: false
}

module.exports = function( options ) {

  utils.extend( params, options || {} );

  var monthElems = _extractMonths(),

  displayedIndex = 0;

  _removeStatic();

  if ( !monthElems.length ) return;

  if ( !params.selectors.destination ) {

    params.selectors.destination = params.selectors.origin;

  }

  displayedIndex = _initDisplayedIndex( monthElems );

  _remove( du.el( monthElems[ 0 ], params.selectors.left ) );

  _remove( du.el( monthElems[ monthElems.length -1 ], params.selectors.right ) );

  _behaviorize( monthElems, {
    next: function() {

      displayedIndex++;

      _showMonth( monthElems[ displayedIndex ] );

      if ( params.onToggle ) params.onToggle();

    },
    previous: function() {

      displayedIndex--;

      _showMonth( monthElems[ displayedIndex ] );

      if ( params.onToggle ) params.onToggle();

    }
  } );

  _showMonth( monthElems[ displayedIndex ] );

}

function _showMonth( monthElem ) {

  var elem = du.el( params.selectors.destination ),

  canvas = du.el( elem, 'ul' ),

  currentMonth = du.el( canvas, 'li' );

  du.removeClass( elem, params.classes.displayNone );

  if ( currentMonth ) canvas.removeChild( currentMonth );

  canvas.appendChild( monthElem );

}

function _behaviorize( monthElems, cbs ) {

  monthElems.forEach( function( month ) {

    var nextElem = du.el( month, params.selectors.right ),

    previousElem = du.el( month, params.selectors.left );

    if ( nextElem ) du.addEvent( nextElem, 'click', cbs.next );

    if ( previousElem ) du.addEvent( previousElem, 'click', cbs.previous );    

  } );

}

function _remove( elem ) {

  elem.parentNode.removeChild( elem );

}

function _initDisplayedIndex( monthElems ) {

  var index = -1,

  today = new Date(),

  monthEnd;

  monthElems.forEach( function( elem, i ) {

    var monthStart = new Date( elem.getAttribute( params.attributes.date ) );

    monthEnd = new Date( elem.getAttribute( params.attributes.date ) );

    monthStart.setDate( 1 );

    monthEnd.setMonth( monthEnd.getMonth() + 1 );

    monthEnd.setDate( -1 );

    if ( today >= monthStart && today <= monthEnd ) {

      index = i;

    }

  } );

  if ( index == -1 ) {

    index = today > monthEnd ? monthElems.length -1 : 0;

  }

  return index;

}

function _removeStatic() {

  var staticNode = du.el( params.selectors.origin );

  if ( !staticNode ) return;

  if ( params.selectors.destination ) {

    staticNode.parentNode.removeChild( staticNode );
    
  }

}

function _extractMonths() {

  var months = [], month = null,

  staticCanvas = du.el( params.selectors.months );

  if ( !staticCanvas ) return [];

  while( month = du.childObject( staticCanvas, 0 ) ) {

    months.push( staticCanvas.removeChild( month ) );

  }

  return months;

}