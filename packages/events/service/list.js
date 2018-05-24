"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const logger = require( '@openagenda/logs' );
const map = require( './databaseFieldMap' );
const svcUtils = require( '@openagenda/service-utils' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const decorateImage = require( './lib/decorateImage' );
const parseMarkdown = require( './lib/parseMarkdown' );
const validateQuery = require( './validate/listQuery' );
const validateOptions = require( './validate/listOptions' );

const log = logger( 'list' );


let schemas, service, knex, config;

module.exports = Object.assign( list, { init } );

function list( query, offset, limit, options, cb ) {

  log( 'listing events for query %j', query );

  const params = _.defaultsDeep( svcUtils.parseListArguments.apply( null, arguments ), {
    query: {},
    offset: 0,
    limit: 20,
    options: {
      total: false,
      internal: false,
      detailed: false,
      useDefaultImage: false
    }
  } );

  const p = new Promise( async ( rs, rj ) => {

    if ( !knex ) return rj( new Error( 'events service was not initialized' ) );

    let total, events = [], cleanOptions;

    try { 

      cleanOptions = validateOptions( params.options );

      const cleanQuery = validateQuery( params.query );

      const includePrivate = [ null, true ].includes( ( cleanQuery.private !== undefined ? cleanQuery : cleanOptions ).private );

      const knexQuery = _addWheres( knex( schemas.event ), cleanQuery, cleanOptions );

      if ( cleanOptions.total ) {

        total = ( await knexQuery.clone().first( [ knex.raw( 'count( id ) as total' ) ] ) ).total;

        log( 'total for %j: %s', params.query, total );

      }

      events = await _list( knexQuery, params.limit, params.offset, { 
        order: cleanQuery.order, 
        internal: cleanOptions.internal, 
        detailed: cleanOptions.detailed, 
        useDefaultImage: params.options.useDefaultImage,
        includePrivate,
        includeDraft: cleanQuery.draft || cleanQuery.draft === null
      } );

      if ( cleanOptions.detailed ) {

        events = await _detailed( events, cleanOptions );

      }

    } catch ( e ) {

      return rj( e );

    }
      
    rs( _.pick( { events, total }, cleanOptions.total ? [ 'events', 'total' ] : [ 'events' ] ) );

  } );

  if ( !params.cb ) return p;

  w( p ).done( result => process.nextTick( () => { 

    params.cb( null, result.events, result.total ); 

  } ), params.cb );

}


function _list( knex, limit, offset, { order, internal, detailed, useDefaultImage, includePrivate, includeDraft } ) {

  // get fields which need to be in list
  let listFields = map

    .filter( f => typeof f === 'string' || f.list === true || f.list === undefined || detailed )

    .filter( f => {

      let internalField = typeof f !== 'string' && f.internal,

        displayInternal = internal;

      return !internalField || ( internalField && displayInternal );

    } )

    .map( f => typeof f === 'string' ? f : f.db );

  if ( includePrivate ) listFields.push( 'private' );

  if ( includeDraft ) listFields.push( 'draft' );

  if ( order ) {

    let orderParts = order.split( '.' );

    knex.orderBy( _.snakeCase( orderParts[ 0 ] ), orderParts[ 1 ] );

  }

  log( 'launching list query for fields %j', listFields );

  return knex
    .select.apply( knex, listFields )
    .limit( limit || 0 )
    .offset( offset || 0 )
     
    .then( events => {

      log( 'fetched %s events', events.length );

      return events.map( dbParse.toObj )

        .map( event => {

          event.image = decorateImage( event.image, {
            imagePath: config.image.base,
            useDefaultPath: useDefaultImage,
            defaultPath: config.image.default 
          } );

          return event;

        } );

    } );

}


function _detailed( events, options ) {

  if ( !config.interfaces.getOriginAgendas || !config.interfaces.getLocations ) {

    log( 'error', 'cannot fetched detailed info: service interfaces are missing' );

    return;

  }

  return new Promise( ( rs, rj ) => {

    let originAgendaUids = events.map( e => e.agendaUid ).filter( uid => uid );

    log( 'interface: fetching origin agendas by uid' );

    config.interfaces.getOriginAgendas( originAgendaUids, _.pick( options, [ 'internal' ] ), ( err, agendas ) => {

      log( 'interface: fetched %s origin agendas by uid', agendas.length );

      if ( err ) {

        return rj( new VError( err, 'could not retrieve origin agendas on detailed list operation' ) );

      }

      const detailedEvents = events.map( e => _.extend( e, {
        agenda: _.find( agendas, a => a.uid === e.agendaUid ) || null
      } ) );

      let locationUids = events.map( e => e.locationUid ).filter( uid => uid );


      if ( !locationUids.length ) {

        return rs( detailedEvents );

      }

      log( 'interface: fetching locations by uid' );

      config.interfaces.getLocations( locationUids, _.pick( options, [ 'internal' ] ), ( err, locations ) => {

        log( 'interface: fetched %s locations by uid', locations.length );

        if ( err ) {

          return rj( new VError( err, 'could not retrieve locations on detailed list operation' ) );

        }

        rs( detailedEvents.map( e => _.extend( e, 
          {
            location: _.find( locations, l => l.uid === e.locationUid ) || null,
          },
          options.html ? {
            html: _.mapValues( e.longDescription, parseMarkdown ) 
          } : {}
        ) ) );

      } );

    } );

  } );

}



function _addWheres( knex, query, options ) {

  let wheres = {};

  if ( query.private !== undefined ) {

    if ( query.private !== null ) {

      console.log( 'DEPRECATED private should be in list options' );

      wheres.private = query.private;

    }

  } else if ( options.private !== null ) {

    wheres.private = options.private;

  }

  if ( query.draft !== null ) {

    wheres.draft = query.draft;

  }

  if ( query.ownerUid !== null ) {

    wheres.owner_uid = query.ownerUid;

  }

  if ( Object.keys( wheres ).length ) {

    knex.where( wheres );

  }

  if ( query.createdAt !== null ) {

    knex.where( 'created_at', '>=', query.createdAt );

  }

  if ( query.updatedAt !== null ) {

    knex.where( 'updated_at', '>=', query.updatedAt );

  }  

  if ( query.search !== null ) {

    knex.where( 'title', 'like', '%' + query.search + '%' );

  }

  if ( query.uid ) {

    knex.where( 'uid', 'in', [ -1 ].concat( query.uid ) );

  }

  knex.whereNull( 'deleted_at' );

  return knex;

}




function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

}