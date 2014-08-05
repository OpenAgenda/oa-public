var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

debug = require('debug'),

log = debug('router'),

lib = require('./lib'),

qs = require('qs'),

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

    _registerRoute(name, params);

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

    _registerRoute(name, params);

    // controller only needs to be loaded in current app

    app[params.method](fullUri, appRoutes[name][R_CONTROLLER]);

  }

  return app;

};

exports.loadUrlGen = function( app ) {

  log('generating url builder');

  return function( req, res, next ) {

    var base = _getBasePath(app, req);


    req.genUrl = function( name, values ) {

      var url = routes[name].uri,

      query = {},

      maintain = false;

      if ( values === undefined ) values = {};
      
      if ( arguments.length > 2 ) {

        var args = Array.prototype.slice.call(arguments, 0);

        for (var i = 2; i < args.length; i++ ) {

          if ( typeof args[i] == 'boolean' ) {

            maintain = args[i];

          } else {

            lib.extend(values, args[i]);
            
          }

        }

      }


      // if we have to maintain current req params, then there.

      if ( maintain ) _maintainQuery( req, values );


      // if we stay in current module, we use the identifiers

      if (routes[name].module === app.get('name')) {

        url = base.path + url;

      } else if (routes[name].base) {

        values = lib.extend({}, base.values, values);

        url = routes[name].base + url;

      } else {

        values = lib.extend({}, base.values, values);

      }


      log('generating url of uri %s', url);

      uriParamNames = (routes[name].uri.match(/:[a-z|A-Z]+/g) || []).map(function(n) { return n.replace(/[:]/g,''); });

      uriParamNames.forEach(function(name) {

        url = url.replace(':' + name, values[name]);


      });

      // deal with non route params
      

      for ( var key in values ) {

        if ( !lib.contains( uriParamNames, key ) ) {

          query[key] = values[key];

        }

      }

      if ( lib.size(query) ) {

        url += '?' + qs.stringify(query);

      }

      
      log('generated %s', url);

      return url;

    };

    next();

  };

};

exports.redirect = function( req, res, name, values, maintain) {

  if (values === undefined) values = {};

  if ( maintain ) _maintainQuery( req, values );

  var url = req.genUrl(name, values);

  log('redirecting to %s', url);

  res.redirect(url);

};

var _registerRoute = function( name, params ) {

  log('registering route %s with uri "%s"', name, params.uri);

  routes[name] = params;

},

_getBasePath = function( app, req ) {

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

},

_maintainQuery =function( req, values ) {

  if ( req.query.page && !values.page ) values.page = req.query.page;

  if ( req.query.filters && !values.filters ) values.filters = req.query.filters;

};