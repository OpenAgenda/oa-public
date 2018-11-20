"use strict";

const config = require( './config' );
const h = require( './helpers' );
const _ = require( 'lodash' );
const preParse = require( './index/preParse' );
const parseExtension = require( './extensions/parse' );
const log = require( '@openagenda/logs' )( 'rebuild' );

const limit = 10;

const defaultExtensions = {
  contributor: require( './extensions/contributor.fields.js' ),
}

const indexSettings = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/index/settings.json', 'utf-8' ) );

module.exports = async ( alias, options ) => {

  const params = _.extend( {
    eventsList: null,
    extensions: {},
    expire: false
  }, options );

  _.extend( params.extensions, defaultExtensions );

  let offset = 0,

    extendedSettings = h.extendMapping( indexSettings, _.mapValues( params.extensions, parseExtension ) ),

    events = [], 

    counts = { indexed: 0 };

  // Prepare: check list func and create new index

  await h.checkList( params.eventsList );

  const index = await h.createUniqueIndex( config.client, alias, extendedSettings );

  // Populate: use list func to populate new index

  log( 'start populating new index' );

  try {

    while ( ( events = await params.eventsList( offset, limit ) ).length ) {

      log( 'bulk indexing from offset %s %s events ( total of %d timings )', offset, events.length, events.reduce( ( t, e ) => t + e.timings.length, 0 ) );

      let bulkResult = {
        took: 0,
        errors: null,
        items: []
      };

      let bulkJob = h.indexBulk( config.client, index, config.type, events.map( preParse ), { expire: params.expire } );

      if ( bulkJob ) {

        bulkResult = await bulkJob;

      } else {

        log( 'nothing to index in bulk job: all items were filtered out' );

      }

      log( 'bulk indexed offset %s, took %s', offset, ( bulkResult.took / 1000 ) + 's' );

      if ( bulkResult.errors ) {

        log( 'error', 'bulk index returned errors', bulkResult );

      } else {

        counts.indexed += bulkResult.items.length;

      }

      offset += limit;

    }

  } catch ( e ) {

    log( 'warn', 'index rebuild failed - deleting, not reassigning' );

    await config.client.indices.delete( { index } );

    throw e;

  }

  log( 'reassign alias, remove previous indices, refresh new index' );

  // Wrap up: re-assign alias, remove previous indices, refresh new index

  let previousIndices = [];

  if ( await config.client.indices.existsAlias( { name: alias } ) ) {

    previousIndices = Object.keys( await config.client.indices.getAlias( { name: alias } ) );

  }

  await config.client.indices.putAlias( {
    index,
    name: alias
  } );


  log( 'updated alias' );

  while ( previousIndices.length ) {

    await config.client.indices.delete( { index: previousIndices.pop() } );

  }

  await config.client.indices.refresh( { index } );

  return {
    success: true,
    counts,
    detail: {
      index
    }
  }

}
