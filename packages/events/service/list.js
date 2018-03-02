"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const logger = require( '@openagenda/basic-logger' );
const map = require( './databaseFieldMap' );
const svcUtils = require( '@openagenda/service-utils' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const decorateImage = require( './lib/decorateImage' );
const parseMarkdown = require( './lib/parseMarkdown' );
const validateQuery = require( './validate/listQuery' );
const validateOptions = require( './validate/listOptions' );


let schemas, service, knex, config, log;

module.exports = Object.assign( list, { init } );

function list( query, offset, limit, options, cb ) {

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

  return knex
    .select.apply( knex, listFields )
    .limit( limit || 0 )
    .offset( offset || 0 )
     
    .then( events => {

      return events.map( dbParse.toObj )

        .map( event => {

          event.image = decorateImage( event.image, { 
            imagePath: config.imagePath,
            useDefaultPath: useDefaultImage,
            defaultPath: config.defaultImagePath 
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

    config.interfaces.getOriginAgendas( originAgendaUids, _.pick( options, [ 'internal' ] ), ( err, agendas ) => {

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

      config.interfaces.getLocations( locationUids, _.pick( options, [ 'internal' ] ), ( err, locations ) => {

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

    knex.where( 'uid', 'in', query.uid.concat( -1 ) );

  }

  knex.whereNull( 'deleted_at' );

  return knex;

}




function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'event service.list' );

}