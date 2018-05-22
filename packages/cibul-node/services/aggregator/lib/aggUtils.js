"use strict";

const p = require( '../../../lib/promises' ),

  async = require( 'async' ),

  mysql = require( 'mysql' ),

  VError = require( 'verror' ),

  _ = require( 'lodash' );

let agendaSvc, eventSvc;

module.exports = {
  loadAgenda,
  loadEvent,
  loadRules,
  getAllAggregatorIds
}


/**
 * the agendas aggregating the agenda and the agendas aggregating those and so on
 */
function getAllAggregatorIds( agendaId, cb ) {

  let aggregatorIds = [],

  processQueue = [ agendaId ];

  async.doWhilst( wcb => {

    agendaSvc.get( { id: processQueue.pop() }, ( err, agenda ) => {

      if ( err ) return wcb( err );

      agenda.getAggregators( ( err, aggs ) => {

        if ( err ) return wcb( err );

        // aggregators of current agenda
        let aggIds = aggs.map( agg => agg.id )

        // filter out those already in the loaded list
        .filter( aggId => aggregatorIds.indexOf( aggId ) === -1 );

        // concatenate ids to queue and aggregatorIds
        aggregatorIds = aggregatorIds.concat( aggIds );

        processQueue = processQueue.concat( aggIds );

        wcb();

      } );

    } );

  },() => processQueue.length, err => {

    if ( err ) return cb( err );

    cb( null, aggregatorIds );

  } );

}


function loadEvent( v ) {

  _pre();

  return p.w.promise( function( rs, rj ) {

    eventSvc.get( { id: v.eventId }, ( err, event ) => {

      if ( err || !event ) {

        return rj( err || 'no event was found' );

      }

      v.event = event;

      rs( v );

    });

  });

}

function loadAgenda( namespace, identifier ) {

  _pre();

  return function( v ) {

    return p.w.promise( function( rs, rj ) {

      agendaSvc.get( { id: v[ identifier ] }, function( err, agenda ) {

        if ( err || !agenda ) return rj( err || 'no agenda was found' );

        v[ namespace ] = agenda;

        rs( v );

      } );

    });

  }

}

function loadRules( config, v ) {

  let d = p.w.defer();

  const params = _.extend( {
    namespaces: {
      aggregatingAgendaId: 'aggregatingAgendaId',
      sourceId: 'sourceId',
      rules: 'rules'
    },
    db: null,
    log: ()=>{}
  }, config );

  let log = params.log;

  const con = mysql.createConnection( params.db );

  let aggregatorId, aggregatorStore = {}, sourceStore = {};


  log( 'loading aggregator rules' );

  async.waterfall( [ wcb => {

    con.query( 'select id, store from aggregator where review_id = ?', v[ params.namespaces.aggregatingAgendaId ], ( err, rows ) => {

      if ( err ) return wcb( err );

      if ( !rows.length ) return wcb();

      aggregatorId = rows[ 0 ].id;

      try {

        aggregatorStore = JSON.parse( rows[ 0 ].store );

      } catch( e ) {}

      log( 'aggregator rules successfully loaded: %s', rows[ 0 ].store );

      wcb();

    } );

  }, wcb => {

    if ( !aggregatorId ) return wcb();

    log( 'loading source rules' );

    con.query( 'select store from aggregator_source where review_id = ? and aggregator_id = ?', [ v[ params.namespaces.sourceId ], aggregatorId ], ( err, rows ) => {

      if ( err ) return wcb( err );

      if ( !rows.length ) return wcb();

      try {

        sourceStore = JSON.parse( rows[ 0 ].store );

      } catch( e ) {};

      log( 'source rules successfully loaded: %s', rows[ 0 ].store );

      wcb();

    } );

  } ], err => {

    con.end();

    if ( err ) {

      return d.reject( new VError( err, 'encountered trouble when evaluating aggregation stores' ) );

    }

    let rules = [];

    if ( aggregatorStore && aggregatorStore.rules ) {

      rules = rules.concat( aggregatorStore.rules );

    }

    if ( sourceStore && sourceStore.rules ) {

      rules = rules.concat( sourceStore.rules );

    }

    v[ params.namespaces.rules ] = rules;

    log( 'loaded %s aggregation rules', rules.length );

    d.resolve( v );

  } );

  return d.promise;

}

/**
 * prevent circular dependencies error
 */

function _pre() {

  if ( agendaSvc ) return;

  agendaSvc = require( '../../agenda' );

  eventSvc = require( '../../event' );

}