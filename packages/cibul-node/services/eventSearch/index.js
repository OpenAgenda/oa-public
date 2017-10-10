"use strict";

const eventSearch = require( 'event-search' );
const agendaIndices = require( './agendaIndices' );
const agendas = require( 'agendas' );
const eventTransverseOperations = require( './eventTransverseOperations' );
const onError = require( '../00_errors' ).bind( null, 'eventSearch' );

module.exports = {
  init,
  agendas: agendaIndices,
  events: eventTransverseOperations,
  task: require( './task' )
}


function init( config ) {

  eventSearch.init( {

    elasticsearch: {
      host: `http://ns397902.ip-151-80-41.eu:${process.env.NODE_ENV==='production' ? '9200' : '9205'}/`,
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

      eventsByDay: {
        type: 'timingsReverseHits',
        format: 'YYYY-MM-dd',
        interval: 'day',
        destination: 'days'
      },

      agendas: {
        type: 'objectsAsTerms',
        field: 'search_internals_agenda',
        destination: 'agendas'
      },

      logger: {
        debug: {
          prefix: 'svc:',
          enable: process.env.NODE_ENV !== 'production' ? '*' : null
        },
        errorsTracking: {
          logentriesKey: process.env.NODE_ENV === 'production' ? '579dfeda-e57c-488c-85d0-adf994e2337f' : null
        }
      }
      
    },

    interfaces: {
      onError
    },

  } );

  agendaIndices.init( config );

  eventTransverseOperations.init( config );

}