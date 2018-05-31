"use strict";

const agendaMonitor = require( '@openagenda/agenda-monitor' );

const agendas = require( '@openagenda/agendas' );

const es = require( './elasticsearch' );

const _ = require( 'lodash' );

const logger = require( '@openagenda/logger' );

const VError = require( 'verror' );

module.exports.init = config => {

  agendaMonitor.init( {
    redis: config.redis,
    queueName: 'agenda-monitor',
    listLimit: 20,
    resyncInterval: 5000,
    evaluateLimit: 5000,
    interfaces: {
      agendasList,
      agendaStats,
      agendaSearchStats,
      agendaSearchResync
    },
    logger
  } );

}


function agendaSearchResync( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { internal: true, private: null }, ( err, agenda ) => {

      if ( err ) return rj( new VError( err, 'could not retrieve agenda %s', agendaUid ) );

      if ( !agenda ) return rj( new VError( 'agenda %s was not found', agendaUid ) );

      es.agendas( agenda ).resync( err => {

        if ( err ) return rj( new VError( err, 'resync of agenda %s failed', agendaUid ) );

        rs();

      } );

    } );

  } );

}


function agendaSearchStats( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    const searchResult = {};

    agendas.get( { uid: agendaUid }, { internal: true, private: null }, ( err, agenda ) => {

      if ( err ) return rj( new VError( err, 'could not retrieve agenda %s', agendaUid ) );

      if ( !agenda ) return rj( new Error( 'agenda %s was not found', agendaUid ) );

      es.agendas( agenda ).search( { passed: 1 }, ( err, result ) => {

        searchResult.publishedEvents = result.total;

        es.agendas( agenda ).search( { passed: 1 }, { showAll: true }, ( err, result ) => {

          searchResult.totalEvents = result.total;

          rs( searchResult );

        } );

      } );

    } );

  } );

}


function agendaStats( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { detailed: true, includeRestricted: true, private: null }, ( err, agenda ) => {

      if ( err ) return rj( err );

      rs( _.pick( agenda, [ 'publishedEvents', 'totalEvents' ] ) );

    } );

  } );

}

function agendasList( fromUpdatedAt = null, offset = 0, limit = 20 ) {

  return new Promise( ( rs, rj ) => {

    agendas.list( { updatedAtGreaterThan: fromUpdatedAt }, offset, limit, { private: null }, ( err, agendas ) => {

      if ( err ) return rj( err );

      rs( agendas );

    } );

  } );

}