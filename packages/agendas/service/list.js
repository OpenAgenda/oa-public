"use strict";

const _ = require( 'lodash' );
const guard = require( 'when/guard' );
const w = require( 'when' );
const wn = require( 'when/node' );

const map = require( './databaseFieldMap' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );

const details = require( './details' );

const validateQuery = require( './validate/listQuery' );
const validateOptions = require( './validate/listOptions' );

let service, schemas, imagePath, knex;

module.exports = _.extend( list, {
  init
} );


function list( q, off, l, op, c ) {

  let { query, offset, limit, options, cb } = parseListArguments.apply( null, arguments ),

    cleanQuery;

  try {

    cleanQuery = validateQuery( query );

  } catch ( errors  ) {

    return cb( new Error( 'invalid query' ) );

  } 

  const cleanOptions = validateOptions( options );

  // options that were in query are to be DEPRECATED
  Object.keys( cleanOptions ).forEach( k => {

    if ( options[ k ] === undefined && query[ k ] !== undefined ) {

      console.log( '%s in query is DEPRECATED. set in options instead', k );

      cleanOptions[ k ] = query[ k ];
      query[ k ] = undefined;

    }

  } );

  if ( !knex ) {

    return cb( 'no config' );

  }

  w( {
    offset,
    limit,
    query: cleanQuery,
    options: cleanOptions,
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


function _search( v ) {

  if ( v.options.private !== null ) {

    v.knex.where( 'private', v.options.private );

  }

  if ( v.options.indexed !== null ) {

    v.knex.where( 'indexed', v.options.indexed );

  }

  if ( v.query.ids || v.query.id ) {

    let ids = v.query.id || v.query.ids;

    if ( v.query.ids ) {

      console.log( 'agendas.list: use of ids is DEPRECATED. Use id instead' );

    }

    v.knex = v.knex.whereIn( 'id', ids );

  }

  if ( v.query.uid ) {

    v.knex = v.knex.whereIn( 'uid', v.query.uid );

  }

  if ( v.query.updatedAtGreaterThan ) {

    v.knex.where( 'updated_at', '>', v.query.updatedAtGreaterThan );

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

  if ( v.query.order ) {

    v.knex.orderBy.apply( v.knex, v.query.order.split( '.' ).map( _.snakeCase ) );
    
  }

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

  let listFields = map.filter( field => {

    if ( typeof field === 'string' ) {

      return true;

    }

    if ( v.options.includeFields.includes( field.obj ) ) {

      return true;

    }

    if ( field.list === false ) {

      return false;

    }

    if ( field.internal && v.options.internal === false ) {

      return false;

    }

    return true;

  } ).map( f => typeof f === 'string' ? f : f.db );

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



function init( svc, k ) {

  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;

}
