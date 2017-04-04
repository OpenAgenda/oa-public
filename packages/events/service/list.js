"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const logger = require( 'basic-logger' );

const map = require( './databaseFieldMap' );

const dbParse = require( 'mysql-utils/mapper' )( map );

const svcUtils = require( 'service-utils' );

let schemas, service, knex, config, log;

module.exports = Object.assign( list, { init } );

function list( query, offset, limit, options, cb ) {

  const params = _.defaultsDeep( svcUtils.parseListArguments.apply( null, arguments ), {
    query: {
      order: null,
      private: false,
      draft: false
    },
    offset: 0,
    limit: 20,
    options: {
      total: false,
      internal: false,
      detailed: false
    }
  } );

  if ( !knex ) return cb( 'events service was not initialized' );

  w( _.assign( {}, params, {
    events: [],
    total: null,
    knexQuery: knex( schemas.event )
  } ) )

  .then( _search )

  .then( _total )

  .then( _order( [ 'updatedAt.desc', 'createdAt.desc', 'updatedAt.asc', 'updatedAt.desc' ] ) )

  .then( _list )

  .done( v => params.cb( null, v.events, v.total ), params.cb );

}


function _list( v ) {

  // get fields which need to be
  let listFields = map

    .filter( f => typeof f === 'string' || f.list === true || f.list === undefined || v.options.detailed )

    .filter( f => {

      let internalField = typeof f !== 'string' && f.internal,

        displayInternal = v.options.internal;

      return !internalField || ( internalField && displayInternal );

    } )

    .map( f => typeof f === 'string' ? f : f.db );

  // add private / draft info when is requested in options
  [ 'private', 'draft' ].forEach( f => {

    if ( v.query[ f ] === null || v.query[ f ] === true ) listFields.push( f );

  } );

  return knex.transaction( trx => {

    return v.knexQuery
      .select.apply( v.knexQuery, listFields )
      .limit( v.limit || 0 )
      .offset( v.offset || 0 )
      .transacting( trx );

  } )

  .then( events => {

    v.events = events.map( dbParse.toObj );

    return v;

  } );

}


function _order( possibleOrders ) {

  return v => {

    if ( possibleOrders.indexOf( v.query.order ) === -1 ) return v;

    let orderParts = _.snakeCase( v.query.order ).split( '.' );

    v.knexQuery.orderBy( orderParts[ 0 ], orderParts[ 1 ] );

    return v;

  }

}


function _search( v ) {

  let wheres = {};

  if ( v.query.private !== null ) {

    wheres.private = v.query.private;

  }

  if ( v.query.draft !== null ) {

    wheres.draft = v.query.draft;

  }

  if ( Object.keys( wheres ).length ) {

    v.knexQuery.where( wheres );

  }

  v.knexQuery.whereNull( 'deleted_at' );
  
  return v;

}


function _total( v ) {

  if ( !v.options.total ) return v;

  return knex.transaction( trx => v.knexQuery.clone().count( 'id' ).transacting( trx ) )

  .then( result => {

    v.total = result[ 0 ].id;

    return v;

  } );

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'event service.list' );

}