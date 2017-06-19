"use strict";

const config = require( './config' );
const h = require( './helpers' );
const w = require( 'when' );
const _ = require( 'lodash' );
const async = require( 'async' );
const preParse = require( './index/preParse' );
const indexSettings = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/index/settings.json', 'utf-8' ) );

module.exports = ( alias, lists, cb ) => {

  w( {
    in: {
      alias,
      lists
    },
    type: config.type,
    client: config.client,
    interfaces: config.interfaces,
    preParse,
    process: {
      // index used before rebuild
      previousIndex: null,
      // created index name
      indexName: null,
    },
    out: {}
  } )

  .then( h.checkList( 'in.lists.eventsList' ) )

  .then( h.createUniqueIndex.bind( null, indexSettings ) )

  .then( v => _loopBulk( v, h.indexBulk.bind( null, v ) ) )

  .then( h.readIndexName.bind( null, 'in.alias', 'process.previousIndex' ) )

  .then( h.reassociateAlias.bind( null, 'in.alias', 'process.indexName' ) )

  .then( h.removeIndex.bind( null, 'process.previousIndex' ) )

  .then( _refresh )

  // force a sync here

  .done( v => {

    cb( null, v.out, v.process );

  }, cb );

}

function _refresh( v ) {

  let d = w.defer();

  v.client.indices.refresh( { index: v.process.indexName }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _loopBulk( v, ecb ) {

  let d = w.defer();

  let offset = 0,
    limit = 5,
    hasMore = true;

  async.doWhilst( wcb => {

    v.in.lists.eventsList( offset, limit, ( err, events ) => {

      if ( err ) return wcb( err );

      if ( !events.length ) {

        hasMore = false;

        wcb();

      } else {

        offset+=limit;

        ecb( events, wcb );

      }

    } );

  }, () => hasMore, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}