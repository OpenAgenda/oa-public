"use strict";

const VError = require( 'verror' );

const logRequests = require( '../services/logRequests' );

const app = require( 'express' )();
const config = require( '../config' );
const mw = require( './middleware' );

const upload = require( 'multer' )( {
  dest: config.tmpFolderPath
} );

const events = {
  create: require( './endpoints/eventCreate' ),
  update: require( './endpoints/eventUpdate' ),
  remove: require( './endpoints/eventRemove' )
}

const settings = {
  get: require( './endpoints/settingsGet' )
}

const handleError = require( '../services/00_errors' ).bind( null, 'api' );

app.use( logRequests.middleware );


// should only apply to create and upload really
app.post( /^\/v2.+/, upload.single( 'image' ) );

app.post( /^\/v2.+/, mw.parseBodyData );

// access token control and user load
app.post( /^\/v2.+/, mw.verifyAndLoadAccessTokenUser );

app.get( /^\/v2.+/, mw.verifyAndLoadKeyUser );


// load all the things
app.param( 'agendaUid', mw.loadAgenda );

app.param( 'eventUid', mw.loadEvent );


// control all the things
app.post( '/v2/agendas/:agendaUid/events', mw.verifyMember );


app.post( '/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights );


// create the thing
app.post( '/v2/agendas/:agendaUid/events', events.create );

// update the thing
app.post( '/v2/agendas/:agendaUid/events/:eventUid', events.update );

// remove the thing
app.delete( '/v2/agendas/:agendaUid/events/:eventUid', events.remove );


app.get( '/v2/agendas/:agendaUid/settings', [
  mw.verifyMember.allow( [ 'administrator' ] ),
  settings.get
] );

app.use( ( err, req, res, next ) => {

  handleError( new VError( {
    cause: err,
    info: {
      url: req.originalUrl,
      body: req.body,
      query: req.query
    }
  } ) );

  return res.status( 500 ).json( {
    message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
  } );

} );

app.listen( config.apiPort );
