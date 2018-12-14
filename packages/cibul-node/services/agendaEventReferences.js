"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const agendaEventReferences = require( '@openagenda/agenda-event-references' );
const internalEventSvc = require( './event' );
const internalAgendaSvc = require( './agenda' );
const search = require( './eventSearch' );

module.exports.init = async config => {

  await promisify( agendaEventReferences.init )( {
    schema: config.schemas.eventReferences,
    mysql: config.db,
    logger: config.getLogConfig( 'svc', 'agenda-event-references', false ),
    interfaces: {
      events,
      suggestions
    }
  } );

}


function suggestions( agendaUid, sample, options = {}, cb ) {

  search.agendas( agendaUid ).moreLikeThis( sample, options )

    .then( result => _.get( result, 'events', [] ).filter( e => !_.get( options, 'exclude', [] ).includes( '' + e.uid ) ) )

    .then( events => cb( null, events ) )

    .catch( err => cb( err ) );

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
          fr: internalEventSvc.instanciate( e ).getRange( 'fr' ),
          en: internalEventSvc.instanciate( e ).getRange( 'en' )
        }
      } ) ) );

    } );

  } );

}
