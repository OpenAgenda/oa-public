var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

debug = require('debug'),

log = debug('router'),

lib = require('./lib'),

routes = {};  // module, then action name


/**
 * load routes not handled by any module of current
 * app
 */

exports.loadGlobalRoutes = function( rConfig ) {

  log('loading global routes');

  globalDefaultPrefix = rConfig.defaultGlobalsPrefix || '';

  globalRoutes = rConfig.globals || {};

  for (var name in globalRoutes) {

    var params = globalRoutes[name];

    params.uri = globalDefaultPrefix + params.uri;

    registerRoute(name, params);

  }

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

    registerRoute(name, params);

    // controller only needs to be loaded in current app

    app[params.method](fullUri, appRoutes[name][R_CONTROLLER]);

  }

  return app;

};

exports.loadUrlGen = function( app ) {

  log('generating url builder');

  return function( req, res, next ) {

    var base = getBasePath(app, req);

    req.genUrl = function(name, values) {

      var url = routes[name].uri;

      if (values === undefined) values = {};

      if (routes[name].module == app.get('name')) {

        url = base.path + url;

      } else if (routes[name].base) {

        values = lib.extend({}, base.values, values);

        url = routes[name].base + url;

      } else {

        values = lib.extend({}, base.values, values);

      }

      log('generating url of uri %s', url);

      uriParamNames = routes[name].uri.match(/:[a-z|A-Z]+/g) || [];

      uriParamNames.map(function(n) { return n.replace(/[:]/g,''); }).forEach(function(name) {

        url = url.replace(':' + name, values[name]);

      });

      log('generated %s', url);

      return url;

    };

    next();

  };

};

exports.redirect = function( req, res, name, values) {

  if (values === undefined) values = {};

  var url = req.genUrl(name, values);

  log('redirecting to %s', url);

  res.redirect(url);

};

var registerRoute = function( name, params ) {

  log('registering route %s with uri "%s"', name, params.uri);

  routes[name] = params;

},

getBasePath = function( app, req ) {

  var base = app.get('base'),

  basePathRegex = base.replace(/\//g, '\/');

  var baseValues = {};
    
  base.match(/:([a-zA-Z])+/g).forEach(function ( paramName ) {

    baseValues[paramName.substr(1)] = req.params[paramName.substr(1)];

    basePathRegex = basePathRegex.replace(paramName, '([a-zA-Z0-9-])+');

  });

  return {
    values: baseValues,
    path: req.path.match(basePathRegex)[0] 
  };

};