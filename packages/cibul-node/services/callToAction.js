"use strict";

const callToActionMw = require( 'call-to-action/middleware' );
const mailer = require( 'mailer' );
const logger = require( 'logger' );

module.exports.init = config => {

  callToActionMw.init( {
    emailDestinations: config.callToActionEmails, //Math.floor( Math.random()*3 )
    copyEmail: 'commercial@openagenda.com',
    interfaces: {
      sendMail: mailer
    },
    logger
  } );

}