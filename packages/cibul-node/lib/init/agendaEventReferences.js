"use strict";

const aer = require( 'agenda-event-references' ),

agendaSvc = require( '../../services/agenda' ),

eventSvc = require( '../../services/event' ),

utils = require( 'utils' );

// initialize agenda-locations service

let config = require( '../../config' );

module.exports = function( options ) {

  let params = utils.extend( {
    logger: false
  }, options ),

  log = params.logger( 'agendaEventReferences init' );

  aer.init( {
    schema: config.schemas.eventReferences,
    mysql: config.db,
    logger: params.logger,
    interfaces: {

      events: ( agendaId, refQuery, options, cb ) => {

        if ( arguments.length === 3 ) {

          cb = options;
          options = {};

        }

        let params = utils.extend( {
          showAll: false
        }, options );

        agendaSvc.get( { id: agendaId }, ( err, agenda ) => {

          if ( err ) return cb( err );

          let query = {};

          if ( refQuery.search ) query.what = refQuery.search;

          if ( refQuery.exclude ) query.exclude = refQuery.exclude;

          if ( refQuery.uids ) query.uids = refQuery.uids;

          agenda.search( query, params, ( err, result ) => {

            if ( err ) return cb( err );

            cb( err, result.events.map( e => ( {
              uid: e.uid,
              title: e.title,
              description: e.description,
              location: {
                name: e.locations[ 0 ].name,
                address: e.locations[ 0 ].address
              },
              dateRange: {
                fr: eventSvc.instanciate( e ).getRange( 'fr' ),
                en: eventSvc.instanciate( e ).getRange( 'en' )
              }
            } ) ) );

          } );

        } );

      }

    }
  }, err => {

    log( err ? 'service init failed: %s' : 'service initialized', err );

  } );

}