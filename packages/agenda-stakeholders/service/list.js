"use strict";

const parseListArguments = require( 'service-utils/parseListArguments' );
const _ = require( 'lodash' );
const logger = require( 'basic-logger' );
const format = require( './format' );
const w = require( 'when' );
const validators = require( '../iso/validators' );


module.exports = _.extend( list, { init } );

// service globals
let log, schemas, knex, interfaces;


function list() {

  // prefilter is defined by service host endpoint ( .agenda or .user )
  let preFilter = arguments[ 0 ]; // this guy applies always

  let { query, offset, limit, options, cb } = parseListArguments.apply( null, Array.prototype.slice.call( arguments, 1 ) );

  _.extend( options, _legacyOptions( query, options ) );

  w( {
    preFilter,
    offset,
    limit,
    query: validators.clean( 'listQuery', _.extend( {}, query, preFilter ) ),
    options: validators.clean( 'listOptions', options ),
    knex: knex( schemas.stakeholder ),
    result: {
      stakeholders: [],
      total: null
    }
  } )

  .then( _list )

  .then( _getEventCounts )

  .then( _getUsersInfo )

  .then( _total )

  .done( v => {

    cb( null, v.result.stakeholders, v.result.total );

  } );

}

function init( config ) {

  log = logger( 'list' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}


function _total( v ) {

  if ( !v.options.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
      .count( 'id as stakeholders' )
      .transacting( trx );

  } )

  .then( result => {

    v.result.total = result[ 0 ].stakeholders;

    return v;

  } );

}


function _list( v ) {

  return knex.transaction( trx => {

    v.knex = v.knex.where( format.objToDb( v.query, true ) );

    if ( v.query.search !== null ) {

      v.knex.andWhere( 'store', 'like', '%' + v.query.search + '%' );

    }

    if ( v.query.invited !== null ) {

      v.knex[ v.query.invited ? 'whereNull' : 'whereNotNull' ]( 'user_id' );

    }

    if ( v.query.credentials.length ) {

      v.knex.whereIn( 'credential', v.query.credentials );

    }

    return v.knex.clone()
      .select( 'id', 'credential', 'user_id', 'review_id', 'store', 'organization', 'updated_at', 'created_at' )
      .limit( v.limit )
      .offset( v.offset )
      .transacting( trx );

  } )

  .then( dbStakeholders => {

    v.result.stakeholders = dbStakeholders.map( format.dbToObj );

    return v;

  } );

}


function _getEventCounts( v ) {

  if ( !v.options.detailed || !interfaces ) {

    return v;

  }

  return w.all( v.result.stakeholders.map( s => {

    let d = w.defer();

    interfaces.getEventCount( v.agendaId, s.userId, ( err, count ) => {

      if ( err ) return d.reject( err );

      s.eventCount = count;

      d.resolve( s );

    } );

    return d.promise;

  } ) )

  .then( stakeholders => {

    v.result.stakeholders = stakeholders;

    return v;

  } );

}


function _getUsersInfo( v ) {

  if ( !v.options.detailed || !interfaces ) {

    return v;

  }

  return w.all( v.result.stakeholders.map( s => {

    let d = w.defer();

    interfaces.getUser( s.userId, ( err, user ) => {

      if ( err ) return d.reject( err );

      s.user = user;

      d.resolve( s );

    } );

    return d.promise;

  } ) )

  .then( stakeholders => {

    v.result.stakeholders = stakeholders;

    return v;

  } );

}


/**
 * previous iteration of service had options mingled with query
 * this function extract those options
 */
function _legacyOptions( query, options ) {

  let l = {};

  [ 'total', 'detailed' ].forEach( k => {

    if ( query[ k ] !== undefined && options[ k ] === undefined ) {

      l[ k ] = !!query[ k ];

    }

  } );

  return l;

}