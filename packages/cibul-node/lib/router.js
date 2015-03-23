"use strict";

/**
 * the overall app router
 */

var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

log = require('./logger')( 'router' ),

lib = require( './lib' ),

qs = require( 'qs' ),

routes = {},

config = require( '../config' ),

root = config.root;  // module, then action name

module.exports = lib.extend( loadGlobalRoutes, {
  registerRoutes: registerRoutes,
  loadUrlGen: loadUrlGen,
  redirect: redirect,
  makeGenUrl: makeGenUrl
} );


/**
 * load module routes
 */

function registerRoutes( moduleName, modulePath, routes ) {

  log( 'debug', 'loading routes for module %s', moduleName );

  for ( var name in routes ) {

    _registerRoute( name, {
      module: moduleName,
      method: routes[name][R_METHOD],
      base: modulePath,
      uri: routes[name][R_URI]
    } );

  }

}


function loadUrlGen( name, path ) {

  log( 'generating url builder for %s at %s', name, path );

  return function( req, res, next ) {

    req.genUrl = makeGenUrl({
      base: _getBasePath( path, req ),
      req: req,
      module: name
    });

    next();

  };

}


function redirect( req, res, name, values, maintain, message ) {

  if ( arguments.length === 3 ) {

    maintain = false;

    values = {};

  } else if ( arguments.length === 5) {

    if ( typeof maintain == 'boolean') {

      message = false;

    } else {

      message = maintain;

      maintain = false;

    }

  }


  if ( maintain ) _maintainQuery( req, values );

  if ( message ) res.setFlash( req, message );

  var url = req.genUrl( name, values );

  log( 'debug', 'redirecting to %s', url );

  res.redirect( url );

}


function makeGenUrl( options ) {

  var params = lib.extend({
    base: { values: {}, path: '' },
    module: false,
    req: false
  }, options );

  return function( name, values, options ) {

    if ( ( name !== false ) && ( !routes[name] ) ) {

      log( 'debug', 'undefined route %s', name );

      return '#';

    }

    var uriParamNames = {},      // variable names in current uri

    key, // loop in parameter values

    url = name === false ? '' : routes[name].uri,

    query = {},

    abs,

    urlParams = lib.extend({
      protocol: false,      // use '' or 'http' or 'https' - forces abs to true
      abs: false,           // use absolute app path
      maintain: false,      // maintain request navigation parameters if true
      base: false           // base parameters
    }, params, options ? options : {} );

    abs = urlParams.abs || ( !!urlParams.protocol );

    if ( typeof values == 'undefined' ) {

      values = {};

    }

    if ( lib.isArray( values ) ) {

      values = lib.extend.apply( undefined, [{}].concat( values ) );

    }

    // if we have to maintain current req params, then there.

    if ( urlParams.req && urlParams.maintain ) _maintainQuery( urlParams.req, values );


    // retrieve name of parameters which are to be set in path

    if ( name ) {

      uriParamNames = (routes[name].uri.match(/:[a-z|A-Z]+/g) || []).map(function(n) { return n.replace(/[:]/g,''); });
      
    }



    // specifics depending on uri type ( same module, other module, other project )

    if ( name && urlParams.module && ( routes[name].module === urlParams.module ) ) {

      // if we stay in current module, we use the base identifiers

      url = urlParams.base.path + url;

    } else if ( name && routes[name].base ) {

      // if we are in a project module, reuse base values

      values = lib.extend({}, urlParams.base.values, values);

      if ( name ) url = routes[name].base + url;

    } else {

      // if we are not in a project module, use only the base values which are required in the path 

      for ( key in urlParams.base.values ) {

        if ( uriParamNames.indexOf( key ) !== -1 ) values[key] = urlParams.base.values[key];

      }

    }

    // log( 'debug', 'generating url of uri %s', url );

    for( var v in values ) {

      if ( url.match( ':' + v ) ) {

        url = url.replace( ':' + v, values[ v ] );

      } else {

        query[ v ] = values[ v ];

      }

    }

    // deal with non route params ( pop 'em out from the query if still there )

    for ( var bv in urlParams.base.values ) {

      if ( query[ bv ] ) delete query[ bv ];

    }

    if ( lib.size( query ) ) {

      url += ( url.indexOf('?')==-1 ? '?' : '&' ) + qs.stringify( query );

    }

    if ( abs ) {

      url = root + url;

    }

    if ( urlParams.protocol ) {

      url = url.replace( /^(\/\/|http(s|):\/\/)/, urlParams.protocol + ( urlParams.protocol.length ? ':' : '' ) + '//' );

    }

    // log( 'debug', 'generated %s', url );

    return url;

  };

}


/**
 * load global routes ( including non-node ) in router index
 */

function loadGlobalRoutes() {

  var globalRoute = {};

  log( 'debug', 'loading global routes' );

  var globalDefaultPrefix = config.routes.defaultGlobalsPrefix || '',

  globalRoutes = config.routes.globals || {};

  for ( var name in globalRoutes ) {

    globalRoute = lib.extend({}, globalRoutes[name] );

    globalRoute.uri = globalDefaultPrefix + globalRoute.uri;

    _registerRoute( name, globalRoute );

  }

}


/**
 * register route parameters
 */

function _registerRoute( name, params ) {

  log( 'debug', 'registering route %s with uri "%s"', name, params.uri );

  routes[name] = params;

}


function _getBasePath( path, req ) {

  var basePathRegex = path.replace( /\//g, '\/' ),

  baseValues = {},

  matchResult;
    
  ( path.match(/:([a-zA-Z])+/g) || [] ).forEach(function ( paramName ) {

    baseValues[paramName.substr(1)] = req.params[paramName.substr(1)];

    basePathRegex = basePathRegex.replace( paramName, '([a-zA-Z0-9-])+' );

  });

  matchResult = req.path.match( basePathRegex );

  return {
    values: baseValues,
    path: matchResult===null ? '' : matchResult[0] 
  };

}


function _maintainQuery( req, values ) {

  [ 'page', 'filters', 'search' ].forEach( function( fieldName ) {

    if ( req.query[ fieldName ] && !values[ fieldName ] ) {

      values[ fieldName ] = req.query[ fieldName ];

    }

  } );

};