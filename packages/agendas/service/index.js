"use strict";

const knexLib = require( 'knex' ),

  details = require( './details' ),

  w = require( 'when' ),

  _ = require( 'lodash' ),

  guard = require( 'when/guard' ),

  legacy = require( './legacy' ),

  wn = require( 'when/node' ),

  set = require( './set' ),

  get = require( './get' ),

  remove = require( './remove' ),

  logger = require( 'basic-logger' ),

  validate = require( './validate' ),

  map = require( './databaseFieldMap' ),

  Agenda = require( './Agenda' ),

  imageFiles = require( 'image-files' ),

  slugs = require( './slugs' ),

  middleware = require( '../middleware' ),

  dbParse = require( 'mysql-utils/mapper' )( map ),

  parseListArguments = require( 'service-utils/parseListArguments' ),

  service = {
    init,
    list,
    get,
    findOne: get.findOne,
    Agenda,
    instanciate: data => new Agenda( data ),
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

let knex, config, schemas, imagePath, log;

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

  imagePath = service.getConfig().imagePath;

  details.init( schemas, knex );

  get.init( service, knex );

  set.init( service, knex );

  remove.init( service, knex );

  Agenda.init( service );

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


function list( q, off, l, op, c ) {

  let { query, offset, limit, options, cb } = parseListArguments.apply( null, arguments );

  query = _.extend( {
    ids: null,
    search: null,
    order: ''
  }, query );

  const finalOptions = _.extend( {
    private: false,
    total: false,
    detailed: false,
    includeImagePath: false,
    useDefaultImage: false
  }, options );

  // options that were in query are to be DEPRECATED
  Object.keys( finalOptions ).forEach( k => {

    if ( options[ k ] === undefined && query[ k ] !== undefined ) {

      console.log( '%s in query is DEPRECATED. set in options instead', k );

      finalOptions[ k ] = query[ k ];
      query[ k ] = undefined;

    }

  } );

  if ( !knex ) {

    return cb( 'no config' );

  }

  w( {
    offset,
    limit,
    query,
    options: finalOptions,
    knex: knex( schemas.agenda ),
    result: {
      agendas: [],
      total: null
    }
  } )

    .then( _search )

    .then( _total )

    .then( _order )

    .then( _list )

    .then( _detailed )

    .done( v => cb( null, v.result.agendas, v.result.total ), cb );

}

function count( cb ) {

  list( {}, null, null, { total: true }, ( err, agendas, total ) => {

    if ( err ) cb( err );

    cb( null, total );

  } );

}


function _search( v ) {

  if ( v.options.private !== null ) {

    v.knex.where( 'private', v.options.private );

  }

  if ( v.query.ids ) {

    v.knex = v.knex.whereIn( 'id', v.query.ids );

  }

  if ( !v.query.search ) {

    return v;

  }

  v.knex = v.knex[ v.query.ids ? 'andWhere' : 'where' ]( function () {

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

  v.knex.orderBy.apply( v.knex, v.query.order.split( '.' ).map( _.snakeCase ) );

  return v;

}


function _total( v ) {

  if ( !v.options.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
      .count( 'id as agendas' )
      .transacting( trx );

  } )

    .then( result => {

      v.result.total = result[ 0 ].agendas;

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

      v.result.agendas = agendas.map( dbParse.toObj )
        .map( agenda => {

          if ( v.options.includeImagePath && agenda.image ) {

            agenda.image = imagePath + agenda.image;

          } else if ( v.options.useDefaultImage && !agenda.image ) {

            agenda.image = service.getConfig().defaultImagePath;

          }

          return agenda;

        } );

      return v;

    } );

}


function _detailed( v ) {

  if ( !v.options.detailed ) return v;

  let gDetails = guard( guard.n( 1 ), agenda => wn.call( details.load, agenda ) );

  return w.map( v.result.agendas, gDetails )

    .then( agendas => {

      v.result.agendas = agendas;

      return v;

    } );

}