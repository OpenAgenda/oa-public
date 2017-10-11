"use strict";

const app = require( 'express' )();

const agendas = require( 'agendas' );

const search = require( '../services/eventSearch' );

const qs = require( 'qs' );


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


app.get( '/agendas/:agendaUid/index', ( req, res, next ) => {

  search.agendas( req.params.agendaUid ).search( qs.parse( req.query ), {
    from: req.query.offset, 
    size: req.query.limit 
  }, {
    detailed: req.query.detailed,
    private: req.query.private,
    includeCustom: req.query.includeCustom
  } )

  .then( result => res.json( result ) )

  .catch( err => next( err ) );

} );