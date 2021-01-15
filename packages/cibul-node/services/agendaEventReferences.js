"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const log = require('@openagenda/logs')('services/agendaEventReferences');
const agendaEventReferences = require( '@openagenda/agenda-event-references' );
const legacyEventSvc = require( './event' );
const internalAgendaSvc = require( './agenda' );

module.exports.init = async (config, services) => {

  await promisify( agendaEventReferences.init )( {
    schema: config.schemas.eventReferences,
    mysql: config.db,
    logger: config.getLogConfig( 'svc', 'agenda-event-references', false ),
    interfaces: {
      events,
      suggestions: (agendaUid, sample, options = {}, cb) => cb(null, []) // unused
    }
  } );

}

function events( agendaId, refQuery, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  const params = _.extend( {
    showAll: false
  }, options );

  internalAgendaSvc.get( { id: agendaId }, ( err, agenda ) => {

    if ( err ) return cb( err );

    const query = {};

    if ( refQuery.search ) query.what = refQuery.search;

    if ( refQuery.exclude ) {

      query.exclude = refQuery.exclude;

      params.limit = 20 + ( refQuery.exclude ? refQuery.exclude.length : 0 );

    }

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
          fr: legacyEventSvc.instanciate( e ).getRange( 'fr' ),
          en: legacyEventSvc.instanciate( e ).getRange( 'en' )
        }
      } ) ) );

    } );

  } );

}
