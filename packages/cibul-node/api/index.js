"use strict";

const multer = require( 'multer' )();

const log = require( '@openagenda/logs' )( 'api' );

const app = require( 'express' )();
const config = require( '../config' );
const mw = require( './middleware' );

const create = require( './endpoints/create' );
const update = require( './endpoints/update' );
const remove = require( './endpoints/remove' );

const handleError = require( '../services/00_errors' ).bind( null, 'api' );


app.post( /^\/v2.+/, multer.single( 'image' ) );

// access token control and user load
app.post( /^\/v2.+/, mw.verifyAndLoadAccessTokenUser );


// load all the things
app.param( 'agendaUid', mw.loadAgenda );

app.param( 'eventUid', mw.loadEvent );


// control all the things
app.post( '/v2/agendas/:agendaUid/events', mw.verifyMember );

app.post( [
  '/v2/agendas/:agendaUid/events',
  '/v2/agendas/:agendaUid/events/:eventUid'
], mw.parseBodyData );

app.post( '/v2/agendas/:agendaUid/events/:eventUid',  mw.verifyEventEditionRights );


// create the thing
app.post( '/v2/agendas/:agendaUid/events', create );

// update the thing
app.post( '/v2/agendas/:agendaUid/events/:eventUid', update );

// remove the thing
app.delete( '/v2/agendas/:agendaUid/events/:eventUid', remove );

app.use( ( err, req, res, next ) => {

  handleError( err );

  return res.status( 500 ).json( {
    message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
  } );

} );

app.listen( config.apiPort );