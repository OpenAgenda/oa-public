"use strict";

const _ = require( 'lodash' );

const express = require( 'express' );

const app = express();

const bodyParser = require( 'body-parser' );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/manifest.json', 'utf-8' ) );

const serviceName = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/../package.json', 'utf-8' )
).name;

module.exports = {
  app,
  init
}

const config = {
  layout: ( req, content ) => 'The service is not ready',
  loadAgenda: async req => null,
  CDNPath: null
}

function init( c ) {

  _.extend( config, c );

  app.get( [ '/', '/:step' ], 
    config.middlewares.user,
    config.middlewares.agenda,
    config.middlewares.event,
    config.middlewares.member,
    config.middlewares.config,
    ( req, res ) => {

    const frontAppInit = {
      config: req.config,
      state: {
        member: req.member,
        event: req.event
      }
    };

    res.send( config.layout( req, `
<div>
  <div id="app"></div>
  <script type="application/json" id="init">${JSON.stringify( frontAppInit, null, 2 )}</script>
  <script type="text/javascript" src="${_getClientAppPath()}"></script>
</div>
    ` ) );

  } );

  app.post( '/member',
    bodyParser.json(),
    config.middlewares.user,
    config.middlewares.agenda,
    config.middlewares.event,
    config.middlewares.member,
    config.middlewares.config,
    ( req, res ) => {

      config.interfaces.setMember( req.agenda, req.user, req.body )

        .then( () => {

          res.send( 'ok' );

        }, error => {

          res.status( 400 );

        } );

    }
  )

}

function _getClientAppPath() {

  if ( process.env.NODE_ENV === 'development' ) return '/js/app.js';

  return [
    config.CDNPath,
    serviceName, 
    manifest[ 'main.js' ]
  ].join( '/' );

}