"use strict";

const _ = require( 'lodash' );
const guard = require( 'when/guard' );
const w = require( 'when' );
const wn = require( 'when/node' );

const map = require( './databaseFieldMap' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );


const { promisify } = require( 'util' );

const loadDetails = promisify( require( './details' ).load );

const validateQuery = require( './validate/listQuery' );
const validateOptions = require( './validate/listOptions' );

let service, schemas, imagePath, knex;

module.exports = _.extend( list, {
  init
} );

function list( q, off, l, op, c ) {

  const { query, offset, limit, options, cb } = parseListArguments.apply( null, arguments );

  const p = promise( query, offset, limit, options );

  if ( cb ) return p.then( ( { agendas, total } ) => cb( null, agendas, total ), cb );

  return p;

}


async function promise( query, offset, limit, options = {} ) {

  const config = service.getConfig();

  const cleanOptions = validateOptions( options );

  _includeLegacyQuery( cleanOptions, options, query );

  const cleanQuery = validateQuery( query );

  if ( !knex ) throw new Error( 'service is not initialized' );

  const k = _search( knex( schemas.agenda ), cleanQuery, cleanOptions );

  const total = cleanOptions.total ? await _total( k ) : null;

  if ( cleanQuery.order ) {

    k.orderBy.apply( k, cleanQuery.order.split( '.' ).map( _.snakeCase ) );

  } else {

    k.orderBy( 'updated_at', 'desc' );

  }

  const rows = await k.select( _listFields( cleanOptions ) )
    .limit( limit || 0 )
    .offset( offset || 0 );

  const agendas = rows.map( _parseDbEntry.bind( null, options, config ) );

  if ( cleanOptions.detailed ) {

    for ( const agenda of agendas ) {

      await loadDetails( agenda );

    }

  }

  return {
    agendas,
    total
  }

}


function _includeLegacyQuery( clean, options, query ) {

  _.keys( clean ).forEach( k => {

    if ( options[ k ] === undefined && query[ k ] !== undefined ) {

      console.log( '%s in query is DEPRECATED. set in options instead', k );

      clean[ k ] = query[ k ];
      query[ k ] = undefined;

    }

  } );

  return options;

}


function _search( k, query, options ) {

  if ( options.private !== null ) k.where( 'private', options.private );

  if ( options.indexed !== null ) k.where( 'indexed', options.indexed );

  if ( query.ids || query.id ) k.whereIn( 'id', query.id || query.ids );

  if ( query.uid ) k.whereIn( 'uid', query.uid );

  if ( query.updatedAtGreaterThan ) {

    k.where( 'updated_at', '>', query.updatedAtGreaterThan );

  }

  if ( query.idGreaterThan ) {

    k.where( 'id', '>', query.idGreaterThan );

  }

  if ( !query.search ) return k;

  k[ query.ids || query.id ? 'andWhere' : 'where' ]( function () {

    this.where( 'title', 'like', `%${query.search}%` )
      .orWhere( 'description', 'like', `%${query.search}%` )
      .orWhere( 'slug', 'like', `%${query.search}%` );

  } );

  return k;

}


async function _total( k ) {

  const result = await knex.transaction( trx => k.clone()
    .count( 'id as total' )
    .transacting( trx )
  );

  return _.get( result, '0.total' );

}


function _listFields( options ) {

  return map.filter( field => {

    if ( typeof field === 'string' ) {

      return true;

    }

    if ( options.includeFields.includes( field.obj ) ) {

      return true;

    }

    if ( field.list === false ) {

      return false;

    }

    if ( field.internal && options.internal === false ) {

      return false;

    }

    return true;

  } ).map( f => typeof f === 'string' ? f : f.db );

}


function _parseDbEntry( options, config, row ) {

  const agenda = dbParse.toObj( row );

  if ( options.includeImagePath && agenda.image ) {

    agenda.image = imagePath + agenda.image;

  } else if ( options.useDefaultImage && !agenda.image ) {

    agenda.image = config.defaultImagePath;

  }

  return agenda;

}


function init( svc, k ) {

  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;

}
