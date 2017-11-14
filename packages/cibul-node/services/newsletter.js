"use strict";

const newsletter = require( '@openagenda/newsletter' ),

  logger = require( '@openagenda/logger' );

module.exports.init = config => {

  newsletter.init( {
    sendinblue: {
      apiKey: config.sendinblue.apiKey,
      newsletterList: config.sendinblue.newsletterList
    },
    logger
  } );

}