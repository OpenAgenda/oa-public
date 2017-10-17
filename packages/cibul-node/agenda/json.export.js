"use strict";

const qs = require( 'qs' );
const app = require( 'express' )();
const agendas = require( 'agendas' );
const search = require( '../services/eventSearch' );

module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.get( '/agendas/:agendaUid/events.v2.json', ( req, res, next ) => {

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