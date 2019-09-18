"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const serialize = require( 'serialize-javascript' );

const eventSchema = require( '@openagenda/event-form/src/schema' );
const formSchemaMw = require( '@openagenda/form-schemas/server/middleware' );
const logger = require( '@openagenda/logs' );

const app = express();
const log = logger( 'index' );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/dist/manifest.json', 'utf-8' ) );

const serviceName = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/../package.json', 'utf-8' )
).name.split( '/' ).pop();

const parse = require( './parse' );

module.exports = {
  app,
  init,
  dist: express.static( __dirname + '/../client/dist' )
}

const config = {
  layout: ( content, data ) => 'The service is not ready',
  CDNPath: null,
  frontAppPath: null,
  interfaces: {}
}

function init( c ) {

  _.extend( config, c );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

  app.get( [ '/', '/:step', '/:step/:eventUid', '/:step/:eventUid/draft' ], ( req, res ) => {

    log( 'info', 'sending app canvas for agenda %s', _.get( req, 'agenda.slug' ) );

    const frontAppInit = {
      config: _.set( req.config, 'schemaExtensions', _.get( req, 'schemaExtensions', [] ) ),
      state: {
        member: req.member,
        event: parse.fromEventServiceFormat( req.event )
      }
    };

    res.send( config.layout(
      `<div class="agenda-body">
        <div class="js_preload_spin" id="app"></div>
        <script type="application/json" id="init">${serialize(frontAppInit, { isJSON: true })}</script>
        <script defer type="text/javascript" src="${_getClientAppPath()}"></script>
      </div>`, req ) );

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

  app.delete( '/event/:eventUid/draft', ( req, res, next ) => {

    config.interfaces.deleteDraftEvent( req.agenda, req.user, req.event ).then( () => {

      res.status( 200 ).send( 'ok' );

    } );

  } );

  app.post(
    [ '/event', '/event/:eventUid', '/event/:eventUid/draft' ],
    bodyParser.json(),
    _defineEventFileKey,
    _loadEventSchema,
    _readRequestedDraftState,
    formSchemaMw.files.putInTemporary.bind( null, {} ),
    formSchemaMw.files.cleanFileValues.bind( null, {} ),
    // image is processed by event service, other files need to be put to s3
    formSchemaMw.files.uploadFilesToS3.bind( null, { ignore: [ 'image' ] } ),
  ( req, res ) => {

    // this does not transform other fields than file fields
    const postedWithFiles = _.assign( JSON.parse( req.body.data ), req.fileFieldValues || {} );

    log( 'info', 'setting event on agenda %s', _.get( req, 'agenda.slug' ) );

    config.interfaces.setEvent( req.agenda, req.user, req.event, postedWithFiles, {
      draft: req.draft
    } ).then( result => {

      res.json( _.pick( result, [
        'event',
        'success',
        'errors'
      ] ) );

    }, error => {

      log( 'error', 'could not set event for agenda %s', _.get( req, 'agenda.slug' ), error );

      res.status( 400 );

    } );

  } );

}


function _readRequestedDraftState( req, res, next ) {

  log( 'reading requested draft state for event' );

  req.draft = [ 'true', '1' ].includes( _.get( req, 'query.draft', '0' ) );

  next();

}


function _loadEventSchema( req, res, next ) {

  log( 'loading event schema with extensions' );

  req.schema = eventSchema( {
    schemaExtensions: _.get( req, 'schemaExtensions', [] )
  } );

  next();

}


function _defineEventFileKey( req, res, next ) {

  log( 'defining event file key' );

  if ( _.get( req, 'event.fileKey' ) ) {

    req.fileKey = req.event.fileKey;

    return next();

  }

  config.interfaces.generateUniqueFileKey().then( fileKey => {

    req.fileKey = fileKey;

    next();

  } );

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
