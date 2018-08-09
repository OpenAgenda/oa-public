"use strict";

const eventSearch = require( '@openagenda/event-search' );
const agendaIndices = require( './agendaIndices' );
const agendas = require( '@openagenda/agendas' );
const eventTransverseOperations = require( './eventTransverseOperations' );
const onError = require( '../00_errors' ).bind( null, 'eventSearch' );

module.exports = {
  init,
  agendas: agendaIndices,
  events: eventTransverseOperations,
  task: require( './task' ),
  parsers: eventSearch.parsers
}


function init( config ) {

  eventSearch.init( {

    elasticsearch: {
      host: `${config.es53.host}:${config.es53.port}/`,
      apiVersion: '5.3'
    },

    predefinedAggregations: {
      
      keywords: { 
        type: 'terms',
        field: 'search_internals_keywords',
        destination: 'keywords'
      },

      timingsByMonth: {
        type: 'timings',
        format: 'YYYY-MM',
        interval: 'month',
        destination: 'timingsByMonth'
      },

      languages: {
        type: 'terms',
        field: 'search_internals_languages',
        destination: 'languages'
      },

      eventsByMonthlyDay: {
        type: 'timingsReverseHits',
        format: 'YYYY-MM-dd',
        interval: 'day',
        destination: 'days'
      },

      eventsByWeeklyDay: {
        type: 'timingsReverseHits',
        format: 'YYYY-MM-dd',
        interval: 'day',
        destination: 'days',
        size: 10
      },

      agendas: {
        type: 'objectsAsTerms',
        field: 'search_internals_agenda',
        destination: 'agendas'
      }
      
    },

    logger: config.getLogConfig( 'svc', 'eventSearch' ),

    interfaces: {
      onError
    },

  } );

  agendaIndices.init( config );

}
