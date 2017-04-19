"use strict";

const config = require( './config' );
const h = require( './helpers' );
const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const validateNav = require( './query/validateNav' );
const parseQuery = require( './query' );


module.exports = _.extend( search, {
  dsl,
  scroll
} );


function scroll( scrollId, scroll, cb ) {

  let c = config.get();

  c.client.scroll( { scrollId, scroll }, ( err, res ) => {

    if ( err ) return cb( err );

    cb( null, res.hits.hits.map( h => h[ '_source' ] ), res.hits.total );

  } );

}


function dsl( alias, dsl, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;    
    options = {};

  }

  let c = config.get();

  const search = {
    type: c.type,
    index: alias,
    body: dsl
  };

  [ 'scroll' ].forEach( f => {

    search[ f ] = options[ f ];

  } );

  c.client.search( search, ( err, res ) => {

    if ( err ) return cb( err );

    let next = res[ '_scroll_id' ] || ( dsl.sort && res.hits.hits.length ? res.hits.hits[ res.hits.hits.length - 1 ].sort : null );

    cb( null, res.hits.hits.map( h => h[ '_source' ] ), res.hits.total, next );

  } );

}

function search( alias, query, nav, cb ) {

  let cleanNav = {};

  if ( arguments.length === 3 ) {

    cb = nav;
    nav = {};

  }

  try {

    cleanNav = validateNav( nav );

  } catch( e ) {

    return cb( new VError( 'nav is not valid', e ) );

  }

  dsl( alias, 
    parseQuery( query, cleanNav.size ? cleanNav : {} ), 
    cleanNav.scroll ? cleanNav : {}
  , cb );

}