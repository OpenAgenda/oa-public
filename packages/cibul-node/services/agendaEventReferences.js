"use strict";

const agendaEventReferences = require( 'agenda-event-references' );

const internalEventSvc = require( './event' ),

  internalAgendaSvc = require( './agenda' ),

  logger = require( 'logger' ),

  _ = require( 'lodash' );

module.exports.init = ( config, cb ) => {

  agendaEventReferences.init( {
    schema: config.schemas.eventReferences,
    mysql: config.db,
    logger,
    interfaces: {

      events

    }
  }, cb );

}


function events( agendaId, refQuery, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  let params = _.extend( {
    showAll: false
  }, options );

  internalAgendaSvc.get( { id: agendaId }, ( err, agenda ) => {

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
          fr: internalEventSvc.instanciate( e ).getRange( 'fr' ),
          en: internalEventSvc.instanciate( e ).getRange( 'en' )
        }
      } ) ) );

    } );

  } );

}