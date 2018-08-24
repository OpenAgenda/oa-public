"use strict";

const _ = require( 'lodash' );

const express = require( 'express' );

const app = express();

const bodyParser = require( 'body-parser' );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/manifest.json', 'utf-8' ) );

const serviceName = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/../package.json', 'utf-8' )
).name.split( '/' ).pop();

module.exports = {
  app,
  init,
  dist: express.static( __dirname + '/../client/dist' )
}

const config = {
  layout: ( req, content ) => 'The service is not ready',
  CDNPath: null,
  frontAppPath: null
}

function init( c ) {

  _.extend( config, c );

  app.get( [ '/', '/:step', '/:step/:eventUid' ],
    ( req, res ) => {

    const frontAppInit = {
      config: req.config,
      state: {
        member: req.member,
        event: req.event
      }
    };

    res.send( config.layout( req, 
      `<div>
        <div id="app"></div>
        <script type="application/json" id="init">${JSON.stringify( frontAppInit, null, 2 )}</script>
        <script type="text/javascript" src="${_getClientAppPath()}"></script>
      </div>` ) );

  } );

  app.post( '/member',
    bodyParser.json(),
    ( req, res ) => {

      config.interfaces.setMember( req.agenda, req.user, req.member, req.body )

      .then( () => {

        res.send( 'ok' );

      }, error => {

        res.status( 400 );

      } );

    }
  );


  app.post( [ '/event', '/event/:eventUid' ],
    bodyParser.json(),
    ( req, res ) => {

      config.interfaces.setEvent( req.agenda, req.user, req.event, req.body )

      .then( ( { event } ) => {

        res.json( { event } );

      }, error => {

        res.status( 400 );

      } );


    } 
  );

}

function _getClientAppPath() {

  const distFileName = manifest[ 'main.js' ];

  if ( config.frontAppPath ) {

    return config.frontAppPath + '/' + distFileName;

  }

  if ( process.env.NODE_ENV === 'development' ) return '/js/app.js';

  return [
    config.CDNPath,
    serviceName, 
    distFileName
  ].join( '/' );

}
