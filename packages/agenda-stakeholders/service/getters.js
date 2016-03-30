"use strict";

var knex, schemas,

utils = require( 'utils' ),

dbUtils = require( './dbUtils' ),

log = require( 'basic-logger' )( 'getters' ),

w = require( 'when' );

module.exports = function( agendaId ) {

  get.list = list;

  return get;

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
      stakeholders: []
    } )

    .then( _list )

    .done( v => {

      cb( null, v.stakeholders );

    }, cb );

  }

}

function _list( v ) {

  return knex.transaction( trx => {

    return trx
    .select( 'id', 'credential', 'user_id', 'review_id', 'store', 'organization' )
    .from( schemas.stakeholder )
    .where( v.wheres )
    .limit( v.limit )
    .offset( v.offset );

  } )

  .then( dbStakeholders => {

    v.stakeholders = dbStakeholders.map( dbUtils.formatStakeholder );

    return v;

  } );

}

module.exports.init = function( config ) {

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

}