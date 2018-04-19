"use strict";

module.exports = function() {

  var history = [], fresh = true;

  return {
    add: add,
    get: get,
    sync: sync,
    matchCurrent: matchCurrent,
    matchPrev: matchPrev,
    current: current,
    back: back
  }

  function sync( bounds ) {

    if ( !history.length ) return;

    history[ history.length - 1 ].b = bounds;

  }

  function add( reqParams, bounds ) {

    var newItem = { 
      k: JSON.stringify( _clean( reqParams ) ), 
      b: bounds 
    };

    if ( history.length && ( history[ history.length - 1 ].k == newItem.k ) ) {

      sync( bounds );

    } else {

      history.push( newItem );

    }

    if ( history.length > 3 ) history.shift();

  }

  function matchCurrent( reqParams ) {

    if ( !history.length ) return false;

    return _match( reqParams, -1 );

  }

  function matchPrev( reqParams ) {

    if ( history.length <= 1 ) return false;

    return _match( reqParams, -2 );
  }

  function get( index ) {

    if ( typeof index == 'undefined' ) index = -1;

    var i = history.length + index;

    if ( i < 0 ) return false;

    return JSON.parse( history[ i ].k );

  }


  /**
   * numbers are always numbers, strings always strings
   */
  
  function _clean( obj ) {

    var clean = {};

    for ( var k in obj ) {

      clean[ k ] = !isNaN( obj[ k ] ) ? parseFloat( obj[ k ] ) : obj[ k ];

    }

    return clean;

  }

  function _match( reqParams, invIndex ) {

    if ( history.length + invIndex < 0 ) return false;

    return history[ history.length + invIndex ].k == JSON.stringify( reqParams );

  }

  function back() {

    if ( history.length <= 1 ) return false;

    history.pop();

    return current();

  }

  function current() {

    if ( !history.length ) return false;

    return history[ history.length -1 ].b;

  }

}