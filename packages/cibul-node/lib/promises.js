var w = require( 'when' ),

wn = require( 'when/node' );

module.exports = {
  w: w,
  wn: wn,
  ifLoaded: ifLoaded,
  ifIs: ifIs,
  interrupt: interrupt
}


function ifLoaded( field, loaded, func ) {

  return function( values ) {

    if ( (!!values[ field ]) == loaded ) return func( values );

    return values;

  }

}


function ifIs( field, expected, func ) {

  return function( values ) {

    if ( values[ field ] == expected ) return func( values );

    return values;

  }

}


function interrupt( message ) {

  return function() {

    throw message;

  }

}