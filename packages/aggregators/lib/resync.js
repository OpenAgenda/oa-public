"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'resync' );

const aggregators = require( './aggregators' );
const config = require( './config' );

module.exports = async objectIdentifiers => {

  log( 'info', 'resyncing %j', objectIdentifiers );

  const { interfaces } = config;

  const aggregator = await aggregators( objectIdentifiers );

  if ( !aggregator ) {
    throw new Error( 'No aggregator was found for object' );
  }

  const sources = ( await aggregator.sources.list( { deep: true } ) )
    .sort( ( a, b ) => a.depth > b.depth ? -1 : 1  );

  log( 'info', 'looping through %s sources', sources.length );

  for ( const source of sources ) {

    log( 'info', 'evaluating items of source %j', source.object );

    let lastId = 0, hasMore = true;

    try {

      while ( hasMore ) {

        const {
          items, lastId: newLastId
        } = await interfaces.getObjectItems( source.object, lastId );

        hasMore = !!items.length;

        lastId = newLastId;

        for ( const item of items ) {

          await interfaces.evaluateObjectItem( aggregator, source.object, item );

        }

      }

    } catch ( e ) {

      log( 'error', 'done calling evaluates for source %j', source.object );

    }

  }

  if ( interfaces.onResyncDone ) interfaces.onResyncDone( aggregator, sources );

}
