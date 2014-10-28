/**
 * the overall app router
 */

exports.registerRoutes = registerRoutes;   // register list of app routes
exports.loadUrlGen = loadUrlGen;           // create middleware for sticking genUrl function to request object
exports.redirect = redirect;               // that.
exports.makeGenUrl = makeGenUrl;           // create genUrl function



/**
 * load libs and declare constants
 */

var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

log = require('./logger')( 'router' ),

lib = require( './lib' ),

qs = require( 'qs' ),

routes = {},

config = require( '../config' ),

root = config.root;  // module, then action name

loadGlobalRoutes();


/**
 * load module routes
 */

function registerRoutes( moduleName, modulePath, routes ) {

  log( 'loading routes for module %s', moduleName );

  for ( var name in routes ) {

    var params = {
      module: moduleName,
      method: routes[name][R_METHOD],
      base: modulePath,
      uri: routes[name][R_URI]
    },

    fullUri = modulePath + params.uri;

    _registerRoute( name, params );

  }

}


function loadUrlGen( name, path ) {

  log('generating url builder');

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

  log( 'redirecting to %s', url );

  res.redirect( url );

}


function makeGenUrl( options ) {

  var params = lib.extend({
    base: { values: {}, path: '' },
    module: false,
    req: false
  }, options );

  return function( name, values, options ) {

    if ( !routes[name] ) {

      log( 'undefined route %s', name );

      return '#';

    }

    var uriParamNames,      // variable names in current uri

    key, // loop in parameter values

    url = routes[name].uri,

    query = {},

    urlParams = lib.extend({
      abs: false,           // use absolute app path
      maintain: false,      // maintain request navigation parameters if true
      base: false           // base parameters
    }, params, options ? options : {} );

    if ( typeof values == 'undefined' ) {

      values = {};

    }

    if ( lib.isArray( values ) ) {

      values = lib.extend.apply( undefined, [{}].concat( values ) );

    }

    // if we have to maintain current req params, then there.

    if ( urlParams.req && urlParams.maintain ) _maintainQuery( urlParams.req, values );


    // retrieve name of parameters which are to be set in path

    uriParamNames = (routes[name].uri.match(/:[a-z|A-Z]+/g) || []).map(function(n) { return n.replace(/[:]/g,''); });


    // specifics depending on uri type ( same module, other module, other project )

    if ( urlParams.module && ( routes[name].module === urlParams.module ) ) {

      // if we stay in current module, we use the base identifiers

      url = urlParams.base.path + url;

    } else if ( routes[name].base ) {

      // if we are in a project module, reuse base values

      values = lib.extend({}, urlParams.base.values, values);

      url = routes[name].base + url;

    } else {

      // if we are not in a project module, use only the base values which are required in the path 

      for ( key in urlParams.base.values ) {

        if ( uriParamNames.indexOf( key ) !== -1 ) values[key] = urlParams.base.values[key];

      }

    }


    log( 'generating url of uri %s', url );

    for( var name in values ) {

      if ( url.match( ':' + name ) ) {

        url = url.replace( ':' + name, values[name] );

      } else {

        query[name] = values[name];

      }

    }

    // deal with non route params

    if ( lib.size( query ) ) {

      url += '?' + qs.stringify( query );

    }

    if ( urlParams.abs ) {

      url = root + url;

    }

    
    log( 'generated %s', url );

    return url;

  };

}


/**
 * load global routes ( including non-node ) in router index
 */

function loadGlobalRoutes() {

  var globalRoute = {};

  log('loading global routes');

  var globalDefaultPrefix = config.routes.defaultGlobalsPrefix || '';

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

  log( 'registering route %s with uri "%s"', name, params.uri );

  routes[name] = params;

}


function _getBasePath( path, req ) {

  var basePathRegex = path.replace(/\//g, '\/'),

  baseValues = {};
    
  ( path.match(/:([a-zA-Z])+/g) || [] ).forEach(function ( paramName ) {

    baseValues[paramName.substr(1)] = req.params[paramName.substr(1)];

    basePathRegex = basePathRegex.replace( paramName, '([a-zA-Z0-9-])+' );

  });

  return {
    values: baseValues,
    path: req.path.match(basePathRegex)[0] 
  };

}


function _maintainQuery( req, values ) {

  [ 'page', 'filters', 'search' ].forEach( function( fieldName ) {

    if ( req.query[ fieldName ] && !values[ fieldName ] ) {

      values[ fieldName ] = req.query[ fieldName ];

    }

  } );

};