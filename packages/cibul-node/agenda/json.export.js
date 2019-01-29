"use strict";

const search = require( '../services/eventSearch' );


module.exports = app => {

  app.get( '/agendas/:agendaUid/events.v2.json', ( req, res, next ) => {

    // here options must be separated from
    search.agendas( req.params.agendaUid ).search( req.query, req.query, req.query )

      .then( result => req.query.geojson ? search.parsers.geoJSON( result ) : result )

      .then( result => res.json( result ) )

      .catch( err => next( err ) );

  } );

};
