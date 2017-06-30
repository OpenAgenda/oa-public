"use strict";

const config = require( './config' );
const h = require( './helpers' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const validateNav = require( './query/validateNav' );
const parseQuery = require( './query' );


module.exports = _.extend( search, {
  dsl,
  scroll
} );


async function scroll( scrollId, scroll ) {

  const res = await config.client.scroll( { scrollId, scroll } );

  return {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total
  }

}


async function dsl( alias, dsl, options = {} ) {

  const search = {
    type: config.type,
    index: alias,
    body: dsl
  };

  [ 'scroll' ].forEach( f => {

    search[ f ] = options[ f ];

  } );

  const res = await config.client.search( search );

  return {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total,
    scrollId: res[ '_scroll_id' ],
    searchAfter: dsl.sort && res.hits.hits.length ? res.hits.hits[ res.hits.hits.length - 1 ].sort : null
  }

}

async function search( alias, query, options = {}, nav = {} ) {

  let cleanNav = {};

  try {

    cleanNav = validateNav( nav );

  } catch( e ) {

    return cb( new VError( e, 'nav is not valid' ) );

  }

  return await dsl( alias, 
    parseQuery( query, cleanNav.size ? cleanNav : {}, options.detailed ? null : config.baseSearchIncludes ), 
    cleanNav.scroll ? cleanNav : {} );

}