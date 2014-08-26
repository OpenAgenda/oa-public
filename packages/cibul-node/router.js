var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

debug = require('debug'),

log = debug('router'),

lib = require('./lib'),

qs = require('qs'),

routes = {},

root;  // module, then action name


/**
 * load routes not handled by any module of current
 * app
 */

exports.load = function( config ) {

  _loadGlobalRoutes( config.globals );

  root = config.root;

};


/**
 * load module routes
 */

exports.loadRoutes = function ( app, appRoutes ) {

  log('loading routes for module %s', app.get('name'));

  for (var name in appRoutes) {

    var params = {
      module: app.get('name'),
      method: appRoutes[name][R_METHOD],
      base: app.get('base'),
      uri: appRoutes[name][R_URI]
    },

    fullUri = app.get('base') + params.uri;

    _registerRoute( name, params );

    // controller only needs to be loaded in current app

    app[params.method](fullUri, appRoutes[name][R_CONTROLLER]);

  }

  return app;

};

exports.loadUrlGen = function( app ) {

  log('generating url builder');

  return function( req, res, next ) {

    req.genUrl = makeGenUrl({
      base: _getBasePath( app, req ),
      req: req,
      module: app.get('name') 
    });

    next();

  };

};

exports.redirect = function( req, res, name, values, maintain, message ) {

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

  var url = req.genUrl(name, values);

  log( 'redirecting to %s', url );

  res.redirect( url );

};

var makeGenUrl = exports.makeGenUrl = function( options ) {

  var params = lib.extend({
    base: { values: {}, path: '' },
    module: false,
    req: false
  }, options );

  return function( name, values, options ) {

    var uriParamNames,      // variable names in current uri

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

      values = lib.extend.apply(lib.extend, undefined, [{}].concat( values ) );

    }

    // if we have to maintain current req params, then there.

    if ( urlParams.req && urlParams.maintain ) _maintainQuery( urlParams.req, values );


    // if we stay in current module, we use the base identifiers

    if ( urlParams.module && ( routes[name].module === urlParams.module ) ) {

      url = urlParams.base.path + url;

    } else if ( routes[name].base ) {

      values = lib.extend({}, urlParams.base.values, values);

      url = routes[name].base + url;

    } else {

      values = lib.extend( {}, urlParams.base.values, values );

    }


    log( 'generating url of uri %s', url );

    uriParamNames = (routes[name].uri.match(/:[a-z|A-Z]+/g) || []).map(function(n) { return n.replace(/[:]/g,''); });


    uriParamNames.forEach(function( name ) {

      url = url.replace(':' + name, values[name]);

    });

    // deal with non route params
    
    for ( var key in values ) {

      if ( !lib.contains( uriParamNames, key ) ) {

        query[key] = values[key];

      }

    }

    if ( lib.size( query ) ) {

      url += '?' + qs.stringify( query );

    }

    if ( urlParams.abs ) {

      url = root + url;

    }

    
    log( 'generated %s', url );

    return url;

  };

},


_loadGlobalRoutes = function( config ) {

  var globalRoute = {};

  log('loading global routes');

  var globalDefaultPrefix = config.defaultGlobalsPrefix || '';

  globalRoutes = config.globals || {};

  for (var name in globalRoutes) {

    globalRoute = lib.extend({}, globalRoutes[name] );

    globalRoute.uri = globalDefaultPrefix + globalRoute.uri;

    _registerRoute( name, globalRoute );

  }

};


 _registerRoute = function( name, params ) {

  log( 'registering route %s with uri "%s"', name, params.uri );

  routes[name] = params;

},

_getBasePath = function( app, req ) {

  var base = app.get('base'),

  basePathRegex = base.replace(/\//g, '\/'),

  baseValues = {};
    
  ( base.match(/:([a-zA-Z])+/g) || [] ).forEach(function ( paramName ) {

    baseValues[paramName.substr(1)] = req.params[paramName.substr(1)];

    basePathRegex = basePathRegex.replace( paramName, '([a-zA-Z0-9-])+' );

  });

  return {
    values: baseValues,
    path: req.path.match(basePathRegex)[0] 
  };

},

_maintainQuery =function( req, values ) {

  if ( req.query.page && !values.page ) values.page = req.query.page;

  if ( req.query.filters && !values.filters ) values.filters = req.query.filters;

};