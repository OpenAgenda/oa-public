"use strict";

const eventSearch = require( 'event-search' );

const agendaIndices = require( './agendaIndices' );

const agendas = require( 'agendas' );

const eventTransverseOperations = require( './eventTransverseOperations' );

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

    interfaces: {},

  } );

  agendaIndices.init( config );

  eventTransverseOperations.init( config );

}