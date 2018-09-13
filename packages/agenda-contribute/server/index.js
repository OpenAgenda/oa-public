"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );

const eventSchema = require( '@openagenda/event-form/schema' );
const formSchemaMw = require( '@openagenda/form-schemas/server/middleware' );
const logger = require( '@openagenda/logs' );

const app = express();
const log = logger( 'index' );

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
  frontAppPath: null,
  interfaces: {}
}

function init( c ) {

  _.extend( config, c );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

  app.get( [ '/', '/:step', '/:step/:eventUid' ], ( req, res ) => {

    log( 'info', 'sending app canvas for agenda %s', _.get( req, 'agenda.slug' ) );

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

      log( 'info', 'setting member for agenda %s', _.get( req, 'agenda.slug' ) );

      config.interfaces.setMember( req.agenda, req.user, req.member, req.body )

      .then( () => {

        res.send( 'ok' );

      }, error => {

        log( 'error', 'could not set member for agenda %s', _.get( req, 'agenda.slug' ), error );

        res.status( 400 ).send( 'nok' );

      } );

    }
  );


  app.post( [ '/event', '/event/:eventUid' ],
    bodyParser.json(),
    ( req, res, next ) => {

      // would be nice to know here which 
      // langauges are required
      req.schema = eventSchema( {
        locationRes: '#',
        languages: [],
        store: null
      } ); 

      if ( _.get( req, 'event.fileKey' ) ) {

        req.fileKey = req.event.fileKey;

        return next();

      }

      config.interfaces.generateUniqueFileKey().then( fileKey => {

        req.fileKey = fileKey;

        next();

      } );

    },
    formSchemaMw.files.putInTemporary.bind( null, {} ),
    formSchemaMw.files.cleanFileValues.bind( null, {} ),
    formSchemaMw.schema.clean.bind( null, {} ),
    ( req, res ) => {

      log( 'info', 'setting event on agenda %s', _.get( req, 'agenda.slug' ) );

      config.interfaces.setEvent( req.agenda, req.user, req.event, req.clean, req.fileFieldValues )

      .then( ( { event } ) => {

        res.json( { event } );

      }, error => {

        log( 'error', 'could not set event for agenda %s', _.get( req, 'agenda.slug' ), error );

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
    config.CDNPath + serviceName, 
    distFileName
  ].join( '/' );

}
