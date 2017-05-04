"use strict";

const newsletter = require( 'newsletter' ),

  logger = require( 'logger' );

module.exports.init = config => {

  newsletter.init( {
    sendinblue: {
      apiKey: config.sendinblue.apiKey,
      newsletterList: config.sendinblue.newsletterList
    },
    logger
  } );

}