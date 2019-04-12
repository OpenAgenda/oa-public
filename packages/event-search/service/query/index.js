"use strict";

const _ = require( 'lodash' );
const validate = require( './validate' );
const derelativize = require( '../helpers/derelativize' );
const validateExtension = require( './validateExtension' );

const {
  getQuery,
  getSort,
  getSource,
  getNav,
  getMoreLikeThis,
  wrapInMoreLikeThis
} = require( '../helpers/dsl' );

module.exports = _.extend( queryToDsl, {
  inflate,
  moreLikeThis,
  derelativize
} );


/**
 * convert query object to elasticsearch dsl
 *
 * @param  {[type]} query
 * @param  {[type]} nav
 * @param  {[type]} extensions  names of extensions to include in query dsl build
 * @param  {array}  includes    fields to be included in search result
 * @return {[type]}
 */
function queryToDsl( query = {}, nav = {}, extensions = null, includes = null ) {

  const inflated = inflate( query );

  const derelativized = derelativize( inflated );

  const clean = validate( derelativized );

  const extensionParts = _extractExtensionParts( inflated, extensions );

  const dsl = {
    query: getQuery( clean, extensionParts ),
    sort: getSort( clean.sort ),
    _source: getSource( includes )
  };

  if ( nav ) {

    _.extend( dsl, getNav( nav ) );

  }

  return dsl;

}

function moreLikeThis( mltQuery, mltOptions, query = {} ) {

  const cleanQuery = validate( inflate( query ) );

  return wrapInMoreLikeThis( mltQuery, mltOptions, cleanQuery );

}


function _extractExtensionParts( query, extensions = null ) {

  if ( extensions === null || !extensions.length ) return {};

  const extensionParts = {};

  extensions.forEach( ext => {

    if ( !query[ ext ] ) return;

    extensionParts[ ext ] = validateExtension( query[ ext ] );

  } );

  return extensionParts;

}


function inflate( query ) {

  let inflated = {};

  Object.keys( query ).forEach( key => {

    if ( key.indexOf( '.' ) !== -1 ) {

      _.set( inflated, key, query[ key ] );

    } else {

      inflated[ key ] = query[ key ];

    }

  } );

  return inflated;

}
