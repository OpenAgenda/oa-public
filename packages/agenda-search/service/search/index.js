"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const elastic = require( 'elasticsearch' );
const VError = require( 'verror' );
const w = require( 'when' );

const utils = require( '@openagenda/utils' );

const log = require( '@openagenda/logs' )( 'search' );

const bulk = require( './lib/bulk' );
const obj = require( './lib/agenda' ); // unnecessary abstraction
const resyncUpdated = require( './resyncUpdated' );

let esClient;

module.exports = config => {

  if ( _.get( config, 'alias' ) ) {

    obj.alias = config.alias;

  }

  return _.mapValues( {
    list,
    rebuild,
    resyncUpdated,
  }, method => method.bind( null, { obj, config, getClient } ) );

  return search( obj, cfg );

}


function list( { obj, config }, query, offset, limit, cb ) {

  var dsl = obj.query( query, offset, limit ),

  client = getClient( config.elasticsearch );

  client.search( {
    index: obj.alias,
    type: obj.type,
    body: dsl
  }, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result.hits.hits.map( obj.parse ), result.hits.total );

  } );

}

async function rebuild( { obj, config } ) {

  log( 'rebuild' );

  const newIndex = obj.alias + '_' + _dateStr();

  const v = {
    interfaces: config.interfaces,
    config: config.elasticsearch,
    timeout: _.get( config, 'elasticsearch.timeout' ),
    image: config.image,
    obj: obj,
    previousIndices: false,
    index: newIndex
  };

  const client = getClient( config.elasticsearch );

  try {

    v.previousIndices = _.keys( await client.indices.getAlias( {
      name: obj.alias
    } ) );

  } catch ( err ) {

    if ( err.displayName !== 'NotFound' ) {

      throw new VError( 'failed to retrieve previous indices', err );

    }

  }

  const result = await w( v )

    .then( _createIndex )

    .then( _setMapping )

    .then( async v => {

      const count = await populate( {
        client,
        list: config.interfaces.list,
        index: newIndex,
        obj,
        image: config.image
      } );

      log( 'info', 'indexed %s items', count );

      return v;

    } )

    .then( _refresh )

    .then( _applyAlias )

    .then( _removePreviousIndices );

  return result;

}


function getClient( esConfig ) {

  if ( !esClient ) {

    esClient = new elastic.Client( _.pick( esConfig, [ 'host', 'apiVersion' ] ) );

  }

  return esClient;

}



/**
 * HERE: run interface function for each agenda
 * before running the bulk insert
 */

async function populate( { client, list, index, obj, image } ) {

  log( 'info', 'populating index' );

  const limit = 20;

  let offset = 0, count = 0, agendas;

  while ( ( agendas = await list( {}, offset, limit, { detailed: false } ) ).length ) {

    const inserted = await bulk( { client, index, obj, image, operation: 'index' }, agendas );

    count += inserted;

    log( 'added %i items from offset %i', agendas.length, offset );

    offset += limit;

  }

  return count;

}


function _bulkInsert( v, items, cb ) {

  var bulked = [],

  client = getClient( _.get( v, [ 'config.elasticsearch' ] ) );

  items.forEach( item => {

    // action description
    bulked.push( { index: {
      _index: v.index,
      _type: v.obj.type,
      _id: item.id
    } } );

    bulked.push( v.obj.clean( item, { image: v.image } ) );

  } );

  if ( !bulked.length ) {

    return cb( null, { items: [] } );

  }

  client.bulk( {
    body: bulked
  }, ( err, result ) => {

    cb( err, result );

  } );

}


/**
 * refresh the index v.index
 */

function _refresh( v ) {

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.refresh( {
    index: v.index
  }, ( err, result ) => {

    if ( err ) {

      return d.reject( err );

    }

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * apply alias v.obj.alias on v.index index
 */

function _applyAlias( v ) {

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.putAlias( {
    index: v.index,
    name: v.obj.alias
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * get indexes pointed to by v.obj.alias
 */
function _getPreviousIndices( v ) {

  log( 'retrieving previous indices' );

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.getAlias( {
    name: v.obj.alias
  }, ( err, result ) => {

    if ( err && err.displayName !== 'NotFound' ) {

      return d.reject( err );

    }

    // if err at this point, means alias not set
    v.previousIndices = err ? [] : Object.keys( result );

    log( 'retrieved %s indices', v.previousIndices.length );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * remove indexes listed by v.previousIndices
 */
function _removePreviousIndices( v ) {

  if ( !v.previousIndices.length ) {

    return v;

  }

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.delete( {
    index: v.previousIndices.join( ',' )
  }, ( err, result ) => {

    if ( err ) {

      return d.reject( err );

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _createIndex( v ) {

  log( 'creating index' );

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.create( {
    index: v.index,
    timeout: v.timeout,
    body: v.obj.indexBody
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    log( 'index %s created', v.index );

    d.resolve( v );

  } );

  return d.promise;

}


function _setMapping( v ) {

  var client = getClient( _.get( v, 'config.elasticsearch' ) ),

  d = w.defer();

  client.indices.putMapping( {
    index: v.index,
    type: v.obj.type,
    body: v.obj.mappings
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _dateStr( d ) {

  const date = d ? new Date( d ) : new Date();

  return [
    [ date.getFullYear(),
    utils.fZ( date.getMonth() + 1 ),
    utils.fZ( date.getDate() ) ].join( '' ),
    [ utils.fZ( date.getHours() ),
    utils.fZ( date.getMinutes() ),
    utils.fZ( date.getSeconds() ) ].join( '' )
  ].join( '_' );

}
