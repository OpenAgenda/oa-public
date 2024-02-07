"use strict";

const _ = require( 'lodash' );
const Mailjet = require( 'node-mailjet' );
const logger = require( '@openagenda/logs' );

const log = logger( 'newsletter' );

let config, mailjet;

module.exports = {
  init,
  addSubscriber
}

/**
 * load up configuration in lib
 */
function init( c ) {

  config = _.merge( {
    logger: false,
    mailjet: {
      apiKey: 'CanardLaKey',
      apiSecret: 'FranceToner',
      contactsListId: 'JM-France',
      performApiCall: true // used for tests
    }
  }, c );

  if ( c.logger ) logger.setModuleConfig( c.logger );

  mailjet = Mailjet.connect( config.mailjet.apiKey, config.mailjet.apiSecret, {
    perform_api_call: config.mailjet.performApiCall
  } );
}

/*
 * Add subscriber to Sendinblue
 */

function addSubscriber( email ) {
  return mailjet
    .post( 'contactslist' )
    .id( config.mailjet.contactsListId )
    .action( 'managecontact' )
    .request( {
      Action: 'addnoforce',
      Email: email
    } );
}