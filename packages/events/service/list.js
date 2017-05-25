"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const VError = require( 'verror' );

const validateQuery = require( './validate/listQuery' );

const logger = require( 'basic-logger' );

const map = require( './databaseFieldMap' );

const dbParse = require( 'mysql-utils/mapper' )( map );

const svcUtils = require( 'service-utils' );

let schemas, service, knex, config, log;

module.exports = Object.assign( list, { init } );

function list( query, offset, limit, options, cb ) {

  const params = _.defaultsDeep( svcUtils.parseListArguments.apply( null, arguments ), {
    query: {},
    cleanQuery: null,
    offset: 0,
    limit: 20,
    options: {
      total: false,
      internal: false,
      detailed: false,
      useDefaultImage: false
    }
  } );

  if ( !knex ) return cb( 'events service was not initialized' );

  w( _.assign( {}, params, {
    events: [],
    total: null,
    knexQuery: knex( schemas.event )
  } ) )

    .then( _clean )

    .then( _search )

    .then( _total )

    .then( _list )

    .then( params.options.detailed ? _detailed : v => v )

    .done( v => params.cb( null, v.events, v.total ), params.cb );

}


function _clean( v ) {

  v.cleanQuery = validateQuery( v.query );

  return v;  

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

    if ( v.cleanQuery[ f ] === null || v.cleanQuery[ f ] === true ) listFields.push( f );

  } );

  if ( v.cleanQuery.order ) {

    let orderParts = v.cleanQuery.order.split( '.' );

    v.knexQuery.orderBy( _.snakeCase( orderParts[ 0 ] ), orderParts[ 1 ] );

  }

  return v.knexQuery
    .select.apply( v.knexQuery, listFields )
    .limit( v.limit || 0 )
    .offset( v.offset || 0 )
     
    .then( events => {

      v.events = events.map( dbParse.toObj )
        .map( event => {

          if ( event.image && event.image.filename ) {

            event.image.path = config.imagePath + event.image.filename;

          } else if ( v.options.useDefaultImage && (!event.image || !event.image.filename) ) {

            event.image.path = config.defaultImagePath;

          } else {

            event.image.path = null;

          }

          return event;

        } );

      return v;

    } );

}


function _detailed( v ) {

  if ( !config.interfaces.getOriginAgendas || !config.interfaces.getLocations ) {

    log( 'error', 'cannot fetched detailed info: service interfaces are missing' );

    return v;

  }

  return new Promise( ( rs, rj ) => {

    let originAgendaUids = v.events.map( e => e.agendaUid ).filter( uid => uid );

    config.interfaces.getOriginAgendas( originAgendaUids, ( err, agendas ) => {

      if ( err ) {

        return rj( new VError( e, 'could not retrieve origin agendas on detailed list operation for query %s', JSON.stringify( v.cleanQuery ) ) );

      }

      let locationUids = v.events.map( e => e.locationUid ).filter( uid => uid );

      config.interfaces.getLocations( locationUids, ( err, locations ) => {

        if ( err ) {

          return rj( new VError( e, 'could not retrieve locations on detailed list operation for query %s', JSON.stringify( v.cleanQuery ) ) );

        }

        v.events = v.events.map( e => _.extend( e, {
          location: _.find( locations, l => l.uid === e.locationUid ) || null,
          agenda: _.find( agendas, a => a.uid === e.agendaUid ) || null
        } ) );

        rs( v );

      } );

    } );

  } );

}



function _search( v ) {

  let wheres = {};

  if ( v.cleanQuery.private !== null ) {

    wheres.private = v.cleanQuery.private;

  }

  if ( v.cleanQuery.draft !== null ) {

    wheres.draft = v.cleanQuery.draft;

  }

  if ( v.cleanQuery.ownerUid !== null ) {

    wheres.owner_uid = v.cleanQuery.ownerUid;

  }


  if ( Object.keys( wheres ).length ) {

    v.knexQuery.where( wheres );

  }

  if ( v.cleanQuery.search !== null ) {

    v.knexQuery.where( 'title', 'like', '%' + v.cleanQuery.search + '%' );

  }

  v.knexQuery.whereNull( 'deleted_at' );

  return v;

}


function _total( v ) {

  if ( !v.options.total ) return v;

  return knex.transaction( trx => v.knexQuery.clone().count( 'id as total' ).transacting( trx ) )

    .then( result => {

      v.total = result[ 0 ].total;

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