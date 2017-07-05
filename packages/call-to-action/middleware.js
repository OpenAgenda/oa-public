"use strict";

const logger = require( 'basic-logger' );
const _ = require( 'lodash' );
const mailer = require( 'mailer' );

let config;
let log;

module.exports = {
  init,
  request
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'call-to-action/middleware' );

  if ( cb ) cb();

}

function request( options ) {

  const { namespaces } = _.merge( {
    namespaces: {
      data: 'body'
    }
  }, options );

  return ( req, res, next ) => {

    const data = _.get( req, namespaces.data );

    mailer( {
      source: req.user.email,
      replyTo: req.user.email,
      recipient: config.emailDestination,
      subject: 'Demande d\'activation: ' + data.subject,
      data: {
        logo: 'https://openagenda.com/images/openagenda.png',
        title: {
          text: `Demande d'activation: ${data.subject}`
        },
        description: `User: ${req.user && req.user.email} ${req.user && `(${req.user.uid})`}  
Url: ${data.url}  
Message de l'utilisateur:

${data.message}`,
      }
    } );

    res.json( { queued: true } );

  };

}
