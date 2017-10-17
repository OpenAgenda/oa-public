"use strict";

const _ = require( 'lodash' );
const validate = require( './validate' );
const buildDsl = require( './buildDsl' );
const validateExtension = require( './validateExtension' );

module.exports = _.extend( queryToDsl, { inflate } );


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

  // unflatten
  let inflated = inflate( query );

  let clean = validate( inflated );

  let extensionParts = _extractExtensionParts( inflated, extensions );

  return buildDsl( clean, extensionParts, nav, includes );

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