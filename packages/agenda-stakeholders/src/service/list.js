"use strict";

const parseListArguments = require( '@openagenda/service-utils/parseListArguments' ),

  w = require( 'when' ),

  _ = require( 'lodash' ),

  logger = require( '@openagenda/basic-logger' ),

  format = require( './format' ),

  credentialTypes = require( '../iso/credentialTypes' ),

  validators = require( '../iso/validators' ),

  evaluateCredentialFilter = require( './lib/evaluateCredentialFilter' );



module.exports = _.extend( list, { init } );

// service globals
let log, schemas, knex, interfaces;


function list() {

  // prefilter is defined by service host endpoint ( .agenda or .user )
  let preFilter = arguments[ 0 ]; // this guy applies always

  let { query, offset, limit, options, cb } = parseListArguments.apply( null, Array.prototype.slice.call( arguments, 1 ) );

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

  .then( evaluateCredentialFilter.bind( null, interfaces ) )

  .then( _list )

  .then( _getEventCounts )

  .then( _getUsersInfo )

  .then( _total )

  .done( v => {

    cb( null, v.result.stakeholders, v.result.total );

  }, cb );

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

  return v.knex
    .count( 'id as stakeholders' )
    .then( result => {

    v.result.total = result[ 0 ].stakeholders;

    return v;

  } );

}



function _list( v ) {

  let detailClone;

  // not very clear
  v.knex.where( format.objToDb( _.omit( v.query, [ 'id', 'userId' ] ), true ) );

  if ( v.query.search !== null ) {

    v.knex.andWhere( 'store', 'like', '%' + v.query.search + '%' );

  }

  if ( v.query.id !== null ) {

    v.knex.andWhere( 'id', 'in', v.query.id );

  }

  if ( v.query.userId !== null ) {

    v.knex.andWhere( 'user_id', 'in', v.query.userId );

  }

  if ( v.query.invited !== null ) {

    v.knex[ v.query.invited ? 'whereNull' : 'whereNotNull' ]( 'user_id' );

  }

  if ( v.query.credentials.length ) {

    v.knex.whereIn( 'credential', v.query.credentials );

  }

  if ( v.query.actionsCounterEqualZero !== null ) {

    v.knex.andWhere( 'actions_counter', v.query.actionsCounterEqualZero ? '=' : '<>' , 0 );

  }

  if ( v.query.deletedUser !== null ) {

    v.knex.andWhere( 'deleted_user', !!v.query.deletedUser );

  }

  detailClone = v.knex.clone()
    .select( 'id', 'credential', 'user_id', 'review_id', 'store', 'organization', 'updated_at', 'created_at', 'deleted_user', 'actions_counter' )
    .limit( v.limit )
    .offset( v.offset );

  if ( v.query.order && v.query.order === 'credential' ) {

    detailClone.orderBy( knex.raw( 'field( credential,' + credentialTypes.types.map( c => c.value ).reverse().join( ',' ) + ')' ) );

  } else {

    detailClone.orderBy( 'actions_counter', 'desc' );

  }

  return detailClone.then( dbStakeholders => {

    v.result.stakeholders = dbStakeholders.map( s => format.dbToObj( s, { showSlugs: v.options.showSlugs } ) );

    return v;

  } );

}


function _getEventCounts( v ) {

  if ( !v.options.detailed || !interfaces ) {

    return v;

  }

  return w.all( v.result.stakeholders.map( s => {

    let d = w.defer();

    interfaces.getEventCount( v.query.agendaId, s.userId, ( err, count ) => {

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

    interfaces.getUser( { id: s.userId }, ( err, user ) => {

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