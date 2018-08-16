"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'call-to-action/middleware' );

let config;

module.exports = {
  init,
  request
};

function init( c, cb ) {

  config = c;

  if ( cb ) cb();

}

function request( options ) {

  const { namespaces } = _.merge( {
    namespaces: {
      data: 'body'
    }
  }, options );

  return ( req, res, next ) => {

    const data = _.pick( _.get( req, namespaces.data ), 'subject', 'url', 'agenda', 'message' );

    config.interfaces.sendRequestEmail({
      data,
      user: req.user,
      to: [
        ...(Array.isArray( config.emailDestinations ) ? config.emailDestinations : [ config.emailDestinations ]),
        ...(Array.isArray( config.copyEmail ) ? config.copyEmail : [ config.copyEmail ])
      ]
    })
      .then( () => {
        res.json( { queued: true } );
      } )
      .catch( error => {
        log( 'error', 'Error on sending call-to-action:', error );
        res.json( { queued: false } );
      } );


  };

}
