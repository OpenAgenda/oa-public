"use strict";

const knexLib = require( 'knex' ),

  details = require( './details' ),

  w = require( 'when' ),

  guard = require( 'when/guard' ),

  legacy = require( './legacy' ),

  wn = require( 'when/node' ),

  set = require( './set' ),

  get = require( './get' ),

  remove = require( './remove' ),

  logger = require( 'basic-logger' ),

  validate = require( './validate' ),

  map = require( './databaseFieldMap' ),

  instanciate = require( './instanciate' ),

  imageFiles = require( 'image-files' ),

  slugs = require( './slugs' ),

  middleware = require( '../middleware' ),

  dbParse = require( 'mysql-utils/mapper' )( map ),

  utils = require( 'utils' ),

  service = {
    init,
    list,
    get,
    findOne: get.findOne,
    instanciate,
    middleware,
    set,
    remove,
    count,
    slugs: {
      isTaken: slugs.isTaken,
      generate: slugs.generate,
    },
    tasks: {
      loadFromLegacy: require( '../tasks/loadFromLegacy' )
    },
    getConfig: () => config
  };

module.exports = service;

let knex, config, schemas, log;

function init( c ) {

  schemas = c.schemas;

  config = c;

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  details.init( schemas, knex );

  get.init( service, knex );

  set.init( service, knex );

  remove.init( service, knex );

  instanciate.init( service );

  slugs.init( schemas, knex );

  legacy.init( schemas, knex );

  imageFiles.init( {
    files: c.files,
    logger: c.logger
  } );

  middleware.init( c, service );

  Object.keys( service.tasks ).forEach( k => {

    service.tasks[ k ].init( service );

  } );

  log = logger( 'agendas service' );

}


function list( query, offset, limit, cb ) {

  if ( arguments.length === 3 ) {

    cb = limit;
    limit = offset;
    offset = query;
    query = {};

  }

  query = Object.assign( {
    ids: [],
    total: false,
    detailed: false,
    search: null,
    order: '',
    private: false
  }, query );

  if ( !knex ) return cb( 'no config' );

  w( {
    offset,
    limit,
    query,
    agendas: [],
    total: null,
    knex: knex( schemas.agenda )
  } )

    .then( _search )

    .then( _total )

    .then( _order )

    .then( _list )

    .then( _detailed )

  .done( v => cb( null, v.agendas, v.total ), cb );

}

function count( cb ) {

  list( { total: true }, null, null, ( err, agendas, total ) => {
    if ( err ) cb( err );
    cb( null, total );
  } );

}


function _search( v ) {

  let ids = false;

  if ( v.query.private !== null ) {

    v.knex.where( 'private', v.query.private );

  }

  if ( v.query.ids.length ) {

    ids = true;
    
    v.knex = v.knex.whereIn( 'id', v.query.ids );

  }

  if ( !v.query.search ) {

    return v;

  }

  v.knex = v.knex[ ids ? 'andWhere' : 'where' ]( function () {

    this.where( 'title', 'like', `%${v.query.search}%` )
      .orWhere( 'description', 'like', `%${v.query.search}%` )
      .orWhere( 'slug', 'like', `%${v.query.search}%` );

  } );

  return v;

}


function _order( v ) {

  if ( [ 'updatedAt.desc', 'createdAt.desc', 'updatedAt.asc', 'updatedAt.desc' ]

  .indexOf( v.query.order ) == -1 ) {

    return v;

  }

  let orderParts = utils.toUnderscore( v.query.order ).split( '.' );

  v.knex.orderBy( orderParts[ 0 ], orderParts[ 1 ] );

  return v;

}


function _total( v ) {

  if ( !v.query.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
      .count( 'id as agendas' )
      .transacting( trx );

  } )

  .then( result => {

    v.total = result[ 0 ].agendas;

    return v;

  } );

}


function _list( v ) {

  let listFields = map.filter( f => typeof f === 'string' || f.list === true || f.list === undefined ).map( f => typeof f === 'string' ? f : f.db );

  return knex.transaction( trx => {

    return v.knex
      .select.apply( v.knex, listFields )
      // huh? order was defined prior to this
      .orderBy( 'updated_at', 'desc' )
      .limit( v.limit || 0 )
      .offset( v.offset || 0 )
      .transacting( trx );

  } )

  .then( agendas => {

    v.agendas = agendas.map( dbParse.toObj );

    return v;

  } );

}


function _detailed( v ) {

  if ( !v.query.detailed ) return v;

  let gDetails = guard( guard.n( 1 ), agenda => wn.call( details.load, agenda ) );

  return w.map( v.agendas, gDetails )

    .then( agendas => {

      v.agendas = agendas;

      return v;

    } );

}