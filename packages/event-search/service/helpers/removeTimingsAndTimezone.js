"use strict";

const moment = require( 'moment-timezone' );

const ih = require( 'immutability-helper' );

module.exports = event => {

  return ih( event, { 
    $unset: [ 'timings', 'timezone' ]
  } );

}