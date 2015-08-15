"use strict";

var token = '2624667a-1903-4d21-8d5d-ea14b86409aa';

inLib();



function inLib() {

  var logger = require( '../' );

  logger.init( { token: token } );

  var log = logger( 'test' );

  log.load( { server: 'web1' } );

  log( 'hey jude' );

}

function standalone() {

  var LE = require( 'le_node' ),

  logger = new LE( { token: token } );

  logger.debug( 'this is a test' );

  logger.log( 'debug', 'this is a test' );

  logger.log( {
    level: 'alert',
    message: 'this is a message in an object',
    other: 'value'
  } );

}