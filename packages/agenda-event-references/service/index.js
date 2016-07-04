"use strict";

module.exports = service;

module.exports.init = init;

const utils = require( 'utils' ),

mw = require( 'middleware' ),

db = require( 'db' );

function service( agendaId ) {

  return {
    set, // ( eventId, referredEventIds, cb )
    clear, // ( eventId, cb )
    get
  }

  function set( eventId, referredEventIds, cb ) {

    db.set( agendaId, eventId, referredEventIds, cb );

  }

  function get( eventId, cb ) {

    db.get( agendaId, eventId, cb );

  }

  function clear( eventId, cb ) {

    db.clear( agendaId, eventId, cb );

  }

}

function init( c, cb ) {

  config = utils.extend( {
    interfaces: {

      // list events of an agenda matching specific search
      events: ( agendaId, query, cb ) => { cb( null, [] ); }

    },
    mysql: false // db connection config
    schemas: {} // service table names
  }, c );

  mw.init( c );

  db.init( c, cb );

}