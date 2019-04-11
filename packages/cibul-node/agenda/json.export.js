"use strict";

const _ = require( 'lodash' );
const agendasSvc = require( '@openagenda/agendas' );
const search = require( '../services/eventSearch' );
const gaTrack = require( '../lib/gaTrackMw' );


module.exports = app => {

  app.get( '/agendas/:agendaUid/events.v2.json', ( req, res, next ) => {

    // here options must be separated from
    search.agendas( req.params.agendaUid ).search( req.query, req.query, req.query )

      .then( result => req.query.geojson ? search.parsers.geoJSON( result ) : result )

      .then( result => res.json( result ) )

      .then( () => {
        agendasSvc.get( { uid: req.params.agendaUid }, { private: null }, ( err, agenda ) => {
          if ( !err && agenda ) {
            req.agenda = agenda;

            gaTrack( 'events', 'export', 'json' )( req );
          }
        } );
      } )

      .catch( err => next( err ) );

  } );

};
