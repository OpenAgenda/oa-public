"use strict";

const _ = require( 'lodash' );
const agendasSvc = require( '@openagenda/agendas' );
const gaTrack = require( '../lib/gaTrack.mw' );

module.exports = app => {

  app.get( '/agendas/:agendaUid/events.v2.json', ( req, res, next ) => {

    // here options must be separated from
    app.services.eventSearch.agendas(req.params.agendaUid).search(req.query, req.query, req.query)

      .then( result => req.query.geojson ? eventSearch.utils.parsers.geoJSON(result) : result)

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
