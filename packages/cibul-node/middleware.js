/**
 * general web app middleware functions
 */

module.exports = function( model, config ) {

  var redisCli = require('redis').createClient(config.redis.port, config.redis.host);

  return {
    render: render,
    requireLogged: requireLogged(redisCli, config.session),
    loadSession: loadSession(redisCli, config.session),
    loadAgenda: loadAgenda(model),
    checkCredential: checkCredential,
    errorResponse: errorResponse,
    unkownResponse: unkownResponse
  };

};

var log = require('debug')('middleware'),

templater = require('cibulTemplates/server/templater')(),


render = function( req, res, templatePath, data, maintain ) {

  data.genUrl = req.genUrl;

  if ( maintain ) {

    data.page = req.query.page ? req.query.page : 1;
    data.filters = req.query.filters ? req.query.filters : {};

  }

  templater(templatePath, data, function(err, render) {

    if (err) throw err;

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      'Cache-Control': 'no-cache'
    });

    res.write(render);
    res.end();

    res.send();

  });

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

      log('session is loaded');

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

      req.agenda = model.agendas().instance(data);

      next();

    });

  };

},



checkCredential = function( model, name ) {

  return function(req, res, next) {

    model.agendas().instance(req.agenda).hasCredential(name, function(err, has) {

      if (err) return errorResponse(req, res, err);

      if (!has) return errorResponse(req, res, 'user does not have required creds');

      log('agenda has credentials "%s"', name);

      next();

    });

  };

},

errorResponse = function(req, res, message) {

  res.send('error: ' + message);

},

unkownResponse = function(req, res, value) {

  res.send('unknown: ' + value);

};