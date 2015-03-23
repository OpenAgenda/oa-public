"use strict";

var deepExtend = require( 'deep-extend' ),

log = require( 'debug' )( 'genUrl' );

module.exports = function( options ) {

  return instanciate( options );

}

function instanciate( options ) {

  var paths = {},

  defaults = deepExtend( {
    domain: false, // required ( for absolute urls )
    protocol: 'http://', // or https:// or //
    abs: false
  }, options ? options : {} );

  genUrl.load = load;

  return genUrl;

  
  function genUrl( name, values, options ) {

    var genParams = deepExtend( {}, defaults, options ? options : {} ),

    uri = paths[ name ],

    paramNames = [],

    cleanValues = {},

    relativeUrl,

    url;

    // if protocol is explicitely passed,
    // caller wants an absolute url
    if ( options && options.protocol ) {

      genParams.abs = true;

    }

    if ( uri === undefined ) {

      log( 'error', 'path is not known: %s', name );

      return '#';

    }

    cleanValues = _clean( values );

    try {

      relativeUrl = _loadParamValues( uri, cleanValues );

    } catch( e ) {

      log( 'error', 'trouble on route %s: %s', name, e );

      return '#';

    }

    console.log( relativeUrl );

    if ( genParams.abs ) {

      url = genParams.protocol + genParams.domain + relativeUrl;

    } else {

      url = relativeUrl;

    }

    return url;

  }

  function load( p ) {

    deepExtend( paths, p );

  }

}


/**
 * create relative url from uri and param values
 */

function _loadParamValues( uri, values ) {

  var url = uri,

  // param names start with :, 
  // are smallcase and contain only letters from a to z
  paramNames = uri.match( /\:[a-z]+/g ) || [];

  paramNames.forEach( function( paramName ) {

    if ( values[ paramName.replace( ':', '' ) ] === undefined ) {

      throw 'missing route param: ' + paramName;

    }

    url = url.replace( paramName, values[ paramName.replace( ':', '' ) ] );

  } );

  return url;

}


/**
 * concatenate if values is an array of values
 * give empty objet if values is nothing at all
 */

function _clean( values ) {

  var clean = {};

  if ( !values ) return clean;

  if ( isArray( values ) ) {

    values.forEach( function( valueSet ) {

      deepExtend( clean, {}, valueSet );

    });

  } else {

    deepExtend( clean, {}, values );

  }

  return clean;

}

function isArray( obj ) {

  return Object.prototype.toString.call(obj) === '[object Array]';

}