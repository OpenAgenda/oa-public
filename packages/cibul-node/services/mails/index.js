"use strict";

const path = require( 'path' );
const mails = require( '@openagenda/mails' );
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const labels = require( '@openagenda/labels/all' ).mails;


module.exports.init = async config => {

  await mails.init( {
    // Templating
    templatesDir: path.join( __dirname, 'templates' ),

    // Mailing
    transport: config.mails.transport,
    defaults: {
      ...config.mails.defaults,
      data: {
        root: config.root
      }
    },

    // Localization
    translations: {
      labels,
      makeLabelGetter
    },

    // Queuing
    redis: config.redis,
    queueName: 'mails',

    // Logging
    logger: config.getLogConfig( 'svc', 'mails', false ),

    disableVerify: config.mails.disableVerify
  } );

};
