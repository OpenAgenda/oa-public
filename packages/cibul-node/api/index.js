"use strict";

const multer = require( 'multer' )();
const VError = require( 'verror' );

const agendasMw = require( '@openagenda/agendas/middleware' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const wn = require( 'when/node' );

const accessTokens = require( '../services/accessTokens' );
const log = require( '@openagenda/logs' )( 'api' );

const app = require( 'express' )();
const config = require( '../config' );
const core = require( '../core' );

const handleError = require( '../services/00_errors' ).bind( null, 'api' );


app.post( /^\/v2.+/, multer.single( 'image' ) );



// access token control
app.post( /^\/v2.+/, async ( req, res, next ) => {

  try {

    req.user = await accessTokens.getUser( req.body.access_token, req.body.nonce );

    if ( !req.user ) throw new Error( 'could not find user matching token' );

  } catch( e ) {

    return res.status( 403 ).json( {
      error: e.message
    } );

  }

  next();

} );


// load agenda when required
app.param( 'agendaUid', agendasMw.load( {
  namespaces: { identifiers: { uid: 'params.agendaUid' } },
  private: null,
  internal: true
} ) );

app.param( 'agendaUid', ( req, res, next ) => {

  if ( !req.agenda ) return res.status( 404 ).json( {
    error: 'agenda not found',
    agendaUid: req.params.agendaUid
  } );

  next();

} );


// verify user role ( if publishing event content, needs to be a member )
app.post( '/v2/agendas/:agendaUid/events', async ( req, res, next ) => {

  const member = await wn.call( agendaStakeholders( req.agenda.id ).get, req.user.id, { instantiate: true } );

  if ( !member ) {

    return res.status( 403 ).json( {
      error: 'user is not a member of agenda',
      agendaUid: req.params.agendaUid
    } )

  }

  if ( ![ 'contributor', 'moderator', 'administrator' ].includes( agendaStakeholders.types.codes.get( member.credential ) ) ) {

    return res.status( 403 ).json( {
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid
    } );

  }

  next();

} );

app.post( '/v2/agendas/:agendaUid/events', async ( req, res, next ) => {

  try {

    req.parsedData = JSON.parse( req.body.data );

  } catch ( e ) {

    return res.status( 400 ).json( {
      error: 'provided json is invalid',
      agendaUid: req.params.agendaUid,
      json: req.body.data
    } );

  }

  next();

} );


// create the thing
app.post( '/v2/agendas/:agendaUid/events', async ( req, res, next ) => {

  let result;

  // necessary du to legacy data structure constraints
  req.parsedData.ownerUid = req.user.uid;

  try {

    result = await core.agendas( req.agenda.uid ).events.create( req.parsedData );

  } catch( e ) {

    if ( e.name === 'validationError' ) {

      return res.status( 400 ).json( {
        errors: VError.info( e ).errors
      } );

    } else {

      handleError( e );

      return res.status( 500 ).json( {
        message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com'
      } );

    }

  }

  res.json( {
    success: true,
    event: result.event
  } );

} );

app.listen( config.apiPort );