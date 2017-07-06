"use strict";

const callToActionMw = require( 'call-to-action/middleware' ),

  logger = require( 'logger' );

module.exports.init = config => {

  callToActionMw.init( {
    emailDestination: 'commercial@openagenda.com',
    logger
  } );

}