/**
 * general web app middleware functions
 */

module.exports = function( model, config ) {

  var redisCli = require('redis').createClient(config.redis.port, config.redis.host);

  return {
    basePath: basePath,
    loadUrlGenerator: loadUrlGenerator,
    requireLogged: requireLogged(redisCli, config.session),
    loadSession: loadSession(redisCli, config.session),
    loadAgenda: loadAgenda(model),
    checkCredential: checkCredential,
    errorResponse: errorResponse,
    unkownResponse: unkownResponse
  };

};

var R_URI = 2,


/**
 * determine the base path required for url rendering
 */

basePath = function( base ) {

  var basePathRegex = base.replace(/\//g, '\/');
    
  base.match(/:([a-zA-Z])+/g).forEach(function ( paramName ) {

    basePathRegex = basePathRegex.replace(paramName, '([a-zA-Z0-9\-])+');

  });

  return function ( req, res, next ) {

    req.basePath = req.path.match(basePathRegex)[0]

    next();

  };

},


/**
 * lookup in redis wether session can be found
 */

requireLogged = function( redisCli, sessionConfig ) {

  return function( req, res, next ) {

    var sessionCookie = req.cookies[sessionConfig.cookie];

    if (!sessionCookie) return errorResponse(req, res, 'logged required'); // this will need to redirect to the 

    redisCli.exists(sessionConfig.prefix + sessionCookie, function(err, reply) {

      if (err) return errorResponse(req, res, err);

      if (!reply) return errorResponse(req, res, 'logged required');

      next();

    });

  };

},


/**
 * load redis session data in req.session
 */

loadSession = function( redisCli, sessionConfig ) {

  return function(req, res, next) {

    redisCli.get(sessionConfig.prefix + req.cookies[sessionConfig.cookie], function( err, reply ) {

      if (err) return errorResponse(req, res, err);

      req.session = JSON.parse(reply);

      next();

    });

  };

},


/**
 * load agenda in req.agenda
 */

loadAgenda = function( model ) {

  return function( req, res, next, slug ) {

    model.agendas().get({slug: req.params.slug}, function( err, data ) {

      if (err) return errorResponse(req, res, err);

      if (data===null) return unkownResponse(req, res, slug);

      req.agenda = data;

      next();

    });

  };

},


// does not manage absolute routes yet. should embed those with relative routes
loadUrlGenerator = function( relativeRoutes ) {

  return function( req, res, next ) {

    req.genUrl = function(name, values) {

      if (typeof values == 'undefined') var values = {};

      var uri = relativeRoutes[name][R_URI],

      url = req.basePath, 

      uriParamNames = uri.match(/:[a-z|A-Z]+/g);

      if (uriParamNames === null) {

        uriParamNames = [];

      }

      uriParamNames.map(function(n) { return n.replace(/[:]/g,''); }).forEach(function(name) {

        uri.replace(':' + name, values[name]);

      });

      return req.basePath+uri;

    }

    next();

  }

},

checkCredential = function( model, name ) {

  return function(req, res, next) {

    model.agendas().instance(req.agenda).hasCredential(name, function(err, has) {

      if (err) return errorResponse(req, res, err);

      if (!has) return errorResponse(req, res, 'user does not have required creds');

      next();

    });

  }

},

errorResponse = function(req, res, message) {

  res.send('error: ' + message);

},

unkownResponse = function(req, res, value) {

  res.send('unknown: ' + value);

};