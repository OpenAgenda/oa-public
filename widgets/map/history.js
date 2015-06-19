"use strict";

module.exports = function() {

  var history = [];

  return {
    add: add,
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
      k: JSON.stringify( reqParams ), 
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