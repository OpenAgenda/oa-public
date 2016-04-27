"use strict";

var knex, schemas,

utils = require( 'utils' ),

dbUtils = require( './dbUtils' ),

format = require( './format' ),

log = require( 'basic-logger' )( 'getters' ),

w = require( 'when' );

module.exports = function( agendaId ) {

  return {
    get: get,
    list: list
  }

  function get( query, cb ) {

    w( {
      agenda: { id: agendaId },
      user: { id: query.userId },
      stakeholder: null
    } )

    .then( dbUtils.getStakeholder( 'agenda', 'user', 'stakeholder' ) )

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
      offset: offset,
      limit: limit,
      query: query,
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

module.exports.init = function( config ) {

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

}