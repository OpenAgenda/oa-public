"use strict";

const app = require( 'express' )();

const agendas = require( 'agendas' );

const searchRebuild = require( '../services/eventSearch/rebuild' );

const search = require( 'event-search' );

const formSchemas = require( 'form-schemas' );

const events = require( 'events-service' );

const custom = require( 'custom' );

const agendaEvents = require( 'agenda-events' );

const _ = require( 'lodash' );

module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.get( '/:agendaSlug/index', ( req, res, next ) => {

  agendas.get( { slug: req.params.agendaSlug }, ( err, agenda ) => {

    if ( err ) return next( err );

    if ( !agenda ) return res.send( 404 );

    res.redirect( 301, `/agendas/${agenda.uid}/index` );

  } );

} );

app.get( '/agendas/:agendaUid/index*', agendas.middleware.load( { 
  internal: true,
  namespaces: { 
    identifiers: { 
      uid: 'params.agendaUid' 
    } 
  } 
} ) );


app.get( '/agendas/:agendaUid/index/rebuild', async ( req, res, next ) => {

  let customFields;

  // that guy
  if ( req.agenda.formSchemaId ) {

    let validator = await formSchemas.getValidator( req.agenda.formSchemaId );

    customFields = validator.fields;

  }

  searchRebuild( req.agenda ).then( r => console.log( 'fini!' ) );

  res.send( 'rebuilding index of ' + req.agenda.title );

} );


app.get( '/agendas/:agendaUid/index', [
  ( req, res, next ) => {

    search( `agendas:${req.agenda.uid}` ).exists().catch( next ).then( exists => {

      if ( !exists ) return res.status( 404 ).json( { message: 'index does not exist' } );

      next();

    } );

  },
  ( req, res, next ) => {

  // show content, unless not existing
  
  let options = { detailed: req.query.detailed, extensions: [ 'contributor', 'custom' ] };

  if ( req.query.private ) {

    _.extend( options, {
      extensions: [ 'contributor', 'custom', 'customModerator', 'customAdministrator' ],
      merge: {
        custom: [ 'custom', 'customModerator', 'customAdministrator' ]
      }
    } );

  }
  
  search( `agendas:${req.agenda.uid}` ).search( {}, {
    from: req.query.offset, 
    size: req.query.limit 
  }, options )

  .then( result => {

    // an agenda can have 

    res.json( {
      agendas: _.pick( req.agenda, [ 'uid', 'slug', 'title' ] ),
      total: result.total,
      events: _.map( result.events, e => {

        return e;

      } )
    } );

  } )

} ] )