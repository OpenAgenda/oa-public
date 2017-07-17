"use strict";

const config = require( './config' );
const h = require( './helpers' );
const _ = require( 'lodash' );
const preParse = require( './index/preParse' );
const parseExtension = require( './extensions/parse' );
const contributorExtension = require( './extensions/contributor.fields.js' );

const indexSettings = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/index/settings.json', 'utf-8' ) );

module.exports = async ( alias, options ) => {

  const params = _.extend( {
    eventsList: null,
    extensions: {}
  }, options );

  params.extensions.contributor = contributorExtension;

  let offset = 0, 

    limit = 5, 

    extendedSettings = h.extendMapping( indexSettings, _.mapValues( params.extensions, parseExtension ) ),

    events = [], 

    counts = { indexed: 0 };

  // Prepare: check list func and create new index

  await h.checkList( params.eventsList );

  const index = await h.createUniqueIndex( config.client, alias, extendedSettings );


  // Populate: use list func to populate new index

  while ( ( events = await params.eventsList( offset, limit ) ).length ) {

    let bulkResult = await h.indexBulk( config.client, index, config.type, events.map( preParse ) );

    counts.indexed += bulkResult.items.length;

    offset += limit;

  }


  // Wrap up: re-assign alias, remove previous indices, refresh new index

  let previousIndices = [];

  if ( await config.client.indices.existsAlias( { name: alias } ) ) {

    previousIndices = Object.keys( await config.client.indices.getAlias( { name: alias } ) );

  }

  await config.client.indices.putAlias( {
    index,
    name: alias
  } );

  while( previousIndices.length ) {

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