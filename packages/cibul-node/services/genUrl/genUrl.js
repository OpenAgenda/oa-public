"use strict";

const _ = require( 'lodash' );
const qs = require( 'qs' );
const log = require( 'debug' )( 'genUrl' );

module.exports = function( options ) {

  return instanciate( options );

}

function instanciate( options ) {

  var defaults = _.merge( {
    domain: false, // required ( for absolute urls )
    protocol: 'http://', // or https:// or //
    abs: false,
    paths: {},
    preloaded: {}
  }, options ? options : {} ),

  paths = defaults.paths,

  preloaded = _.merge( {}, defaults.preloaded );

  return _.extend( genUrl, {
    load,
    getPaths,
    getPath,
    copy,
    preload
  } );

  function genUrl( name, values, options ) {

    const genParams = _.merge( {}, defaults, options ? options : {} );
    const uri = paths[ name ];

    let relativeUrl;
    let url;

    // if protocol is explicitely passed,
    // caller wants an absolute url
    if ( options && options.protocol ) {

      genParams.abs = true;

    }

    if ( uri === undefined ) {

      log( 'error', 'path is not known: %s', name );

      return '#';

    }

    const cleanValues = _.merge( {}, preloaded, _clean( values ) );

    try {

      relativeUrl = _loadParamValues( uri, cleanValues );

    } catch( e ) {

      log( 'error', 'trouble on route %s: %s', name, e );

      return '#';

    }

    if ( genParams.abs ) {

      url = genParams.protocol + genParams.domain + relativeUrl;

    } else {

      url = relativeUrl;

    }

    const query = _loadQueryValues( uri, cleanValues );

    if ( query ) {

      url += ( url.indexOf( '?' ) == -1 ? '?' : '&' ) + qs.stringify( query );

    }

    return url;

  }

  function load( p ) {

    _.merge( paths, p );

  }

  function getPaths() {

    return paths;

  }

  function getPath( name ) {

    return paths[ name ];

  }

  function copy() {

    var copyOptions = _.merge( {}, options ? options : {}, {
      paths: paths,
      preloaded: preloaded
    });

    return instanciate( copyOptions );

  }

  function preload( values ) {

    _.merge( preloaded, values );

  }

}


/**
 * create relative url from uri and param values
 */

function _loadParamValues( uri, values ) {

  let url = uri;

  _getUriParamNames( uri ).forEach( function( paramName ) {

    if ( values[ paramName.replace( ':', '' ) ] === undefined ) {

      throw 'missing route param: ' + paramName;

    }

    url = url.replace( paramName, values[ paramName.replace( ':', '' ) ] );

  } );

  return url;

}


/**
 * extract values which are not params of uri
 * and place them in a query object
 */

function _loadQueryValues( uri, values ) {

  var queryValues = {},

  paramNames = _getUriParamNames( uri, true );

  for( var v in values ) {

    if ( paramNames.indexOf( v ) == -1 ) {

      queryValues[ v ] = values[ v ];

    }

  }

  return size( queryValues ) ? queryValues : false;

}


/**
 * extract names from uri
 */

function _getUriParamNames( uri, stripped ) {

  // param names start with :,
  // are smallcase and contain only letters from a to z
  return ( uri.match( /\:([a-z]|[A-Z])+/g ) || [] ).map( function( name ) {

    return stripped ? name.replace( ':', '' ) : name;

  });

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

      _.merge( clean, {}, valueSet );

    });

  } else {

    _.merge( clean, {}, values );

  }

  return clean;

}

function isArray( obj ) {

  return Object.prototype.toString.call(obj) === '[object Array]';

}

function size( obj ) {

  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;

};
