"use strict";

var w = require( 'when' ),

elastic = require( 'elasticsearch' ),

utils = require( 'utils' ),

async = require( 'async' );

module.exports = function( obj, db, config ) {

  return {

    // make a listed search
    list: list,

    // create new index and update alias
    rebuild: rebuild

  }


  function list( query, offset, limit, cb ) {

    var dsl = obj.query( query, offset, limit ),

    client = _createClient( config );

    client.search( {
      index: obj.alias,
      body: dsl
    }, ( err, result ) => {

      client.close();

      if ( err ) return cb( err );

      cb( null, result.hits.hits.map( obj.parse ), result.hits.total );

    } );

  }


  function rebuild( cb ) {

    w( {
      config: config.elasticsearch,
      image: config.image,
      obj: obj,
      db: db,
      previousIndices: false,
      index: obj.alias + '_' + _now()
    } )

    .then( _getPreviousIndices )

    .then( _createIndex )

    .then( _setMapping )

    .then( _populate )

    .then( _refresh )

    .then( _applyAlias )

    .then( _removePreviousIndices )

    .done( v => {

      cb();

    }, err => {

      cb( err );

    } );

  }

  
}


function _populate( v ) {

  var d = w.defer(),

  pageCount = 0,

  offset = 0, 

  limit = 20,

  indexedCount = 0,

  query = {};

  async.doWhilst( wcb => {

    v.db.list( offset, limit, ( err, items ) => {

      if ( err ) {

        log( 'error', err );

        return wcb( err );

      }

      pageCount = items.length;

      offset += limit;

      _bulkInsert( v, items, ( err, result ) => {

        if ( !err ) {

          //log( 'bulk inserted %s items', result.items.length );

          indexedCount += result.items.length;

        } else {

          //log( 'error', 'bulk operation error: %s', err );

        }

        wcb();

      } );

    } );

  }, () => !!pageCount, () => {

    //log( 'info', 'indexed %s items', indexedCount );

    v.indexedCount = indexedCount;

    d.resolve( v );

  } );

  return d.promise;

}


function _bulkInsert( v, items, cb ) {

  var bulked = [],

  client = _createClient( v.config );

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

    client.close();

    return cb( null, { items: [] } );

  }

  client.bulk( {
    body: bulked
  }, ( err, result ) => {

    client.close();

    cb( err, result );

  } );

}


/**
 * refresh the index v.index
 */

function _refresh( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.refresh( {
    index: v.index
  }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * apply alias v.obj.alias on v.index index
 */

function _applyAlias( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.putAlias( {
    index: v.index,
    name: v.obj.alias
  }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * get indexes pointed to by v.obj.alias
 */
function _getPreviousIndices( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.getAlias( { name: v.obj.alias }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    v.previousIndices = Object.keys( result );

    d.resolve( v );

  } );

  return d.promise;

}


/**
 * remove indexes listed by v.previousIndexes
 */
function _removePreviousIndices( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.delete( {
    index: v.previousIndices.join( ',' )
  }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _createIndex( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.create( {
    index: v.index,
    timeout: v.config.timeout,
    body: v.obj.indexBody
  }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _setMapping( v ) {

  var client = _createClient( v.config ),

  d = w.defer();

  client.indices.putMapping( {
    index: v.index,
    type: v.obj.type,
    body: v.obj.mappings
  }, ( err, result ) => {

    client.close();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _createClient( config ) {

  return new elastic.Client( {
    host: config.host
  } );

}


function _now() {

  var now = new Date();

  return [
    [ now.getFullYear(),
    utils.fZ( now.getMonth() + 1 ),
    utils.fZ( now.getDate() ) ].join( '' ),
    [ utils.fZ( now.getHours() ),
    utils.fZ( now.getMinutes() ),
    utils.fZ( now.getSeconds() ) ].join( '' )
  ].join( '_' );

}