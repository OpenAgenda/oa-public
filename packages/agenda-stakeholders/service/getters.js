"use strict";

const utils = require( 'utils' ),

  dbUtils = require( './dbUtils' ),

  format = require( './format' ),

  logger = require( 'basic-logger' ),

  w = require( 'when' );


let knex, schemas, interfaces, log;

module.exports = agenda;

module.exports.init = init;

module.exports.user = user;


function agenda( agendaId ) {

  return {
    get,
    list
  }

  function get( query, options, cb ) {

    if ( arguments.length === 2 ) {

      cb = options;
      options = {}

    }

    w( Object.assign( {
      // options defaults
      detailed: false,
    }, options, {
      agenda: { id: agendaId },
      user: { id: query.userId, stakeholderId: query.id },
      stakeholder: null
    } ) )

    .then( dbUtils.getStakeholder( 'agenda', 'user', 'stakeholder' ) )

    .then( _getEventCount )

    .done( v => {

      cb( null, v.stakeholder );

    }, cb );

  }


  function list( query, offset, limit, cb ) {

    if ( arguments.length === 3 ) {

      cb = limit;
      limit = offset;
      offset = query;
      query = {};

    }

    w( {
      offset,
      limit,
      query,
      wheres: {
        review_id: agendaId
      },
      stakeholders: [],
      total: null,
      knex: knex( schemas.stakeholder )
    } )

      .then( _list )

      .then( _total )

      .done( v => {

        cb( null, v.stakeholders, v.total );

      }, cb );

  }

}


function user( userId ) {

  return {
    list
  };

  function list( query, offset, limit, cb ) {

    if ( arguments.length === 3 ) {

      cb = limit;
      limit = offset;
      offset = query;
      query = {};

    }

    w( {
      offset,
      limit,
      query,
      wheres: {
        user_id: userId
      },
      stakeholders: [],
      total: null,
      knex: knex( schemas.stakeholder )
    } )

      .then( _list )

      .then( _getEventCounts )

      .then( _total )

      .done( v => {

        cb( null, v.stakeholders, v.total );

      }, cb );

  }

}

function _list( v ) {

  return knex.transaction( trx => {

    v.knex = v.knex.where( v.wheres );

    return v.knex.clone()
      .select( 'id', 'credential', 'user_id', 'review_id', 'store', 'organization', 'updated_at', 'created_at' )
      .limit( v.limit )
      .offset( v.offset )
      .transacting( trx );

  } )

    .then( dbStakeholders => {

      v.stakeholders = dbStakeholders.map( format.dbToObj );

      return v;

    } );

}

function _total( v ) {

  if ( !v.query.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
      .count( 'id as stakeholders' )
      .transacting( trx );

  } )

    .then( result => {

      v.total = result[ 0 ].stakeholders;

      return v;

    } );

}



function _getEventCounts( v ) {

  if ( !v.query.detailed || !interfaces ) {

    return v;

  }

  return w.all( v.stakeholders.map( s => {

    let d = w.defer();

    interfaces.getEventCount( v.agendaId, s.userId, ( err, count ) => {

      if ( err ) return d.reject( err );

      s.eventCount = count;

      d.resolve( s );

    } );

    return d.promise;

  } ) )

  .then( stakeholders => {

    v.stakeholders = stakeholders;

    return v;

  } );

}


function _getEventCount( v ) {

  if ( !v.detailed || !interfaces ) {

    return v;

  }

  let d = w.defer();

  interfaces.getEventCount( v.agenda.id, v.user.id, ( err, count ) => {

    if ( err ) return d.reject( err );

    v.stakeholder.eventCount = count;

    d.resolve( v );

  } );

  return d.promise;

}


function init( config ) {

  log = logger( 'getters' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}