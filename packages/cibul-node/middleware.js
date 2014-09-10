/**
 * general web app middleware functions
 */

module.exports = function( model, router, config ) {

  var redisCli = require('redis').createClient(config.redis.port, config.redis.host);

  return {
    render: render,
    requireLogged: requireLogged( redisCli, router, config.session ),
    loadSession: loadSession( redisCli, config.session ),
    flashSetter: flashSetter( config.cookie ),
    loadAgenda: loadAgenda( model ),
    checkCredential: checkCredential,
    errorResponse: errorResponse,
    unkownResponse: unkownResponse
  };

};

var log = require('debug')('middleware'),

templater = require('cibulTemplates/server/templater'),

i18n = require('./i18n/i18n.js'),


/**
 * render template matching path
 */

render = function( req, res, templatePath, data, maintain ) {

  data.genUrl = req.genUrl;


  // maintain navigation query values

  if ( maintain ) {

    data.page = req.query.page ? req.query.page : 1;
    data.filters = req.query.filters ? req.query.filters : {};

  }

  data.lang = getLang( req );

  templater( templatePath + ( req.xhr ? '.part' : '' ), data, function( err, render ) {

    if ( err ) throw err;

    res.writeHead( 200, {
      "Content-Type" : "text/html; charset=utf-8",
      'Cache-Control' : 'no-cache'
    });

    if ( !req.xhr ) {

      res.write( render );

      res.end();

      res.send();

    } else {

      _renderJson( req, res, {
        success: true,
        partial: render
      } );

    }

  });

},

_renderJson = function( req, res, data ) {

  res.write( JSON.stringify( data ) );

  res.end();

  res.send();

},


/**
 * verify that user is logged
 */

requireLogged = function( redisCli, router, sessionConfig ) {

  var error = { message: 'logged required' };

  return function( req, res, next ) {

    if ( req.session.logged ) {

      next();

      return;

    }

    if ( req.xhr ) {

      _renderJson( { success: false } );

    } else {

      var currentResource = new Buffer( req.originalUrl );

      router.redirect( req, res, 'authShow', { redirect: currentResource.toString( 'base64' ) } );

    }

  };

},


/**
 * load redis session data in req.session
 */

loadSession = function( redisCli, sessionConfig ) {

  return function( req, res, next ) {

    redisCli.get( sessionConfig.prefix + req.cookies[sessionConfig.cookie], function( err, reply ) {

      if ( err || !reply ) {

        log('session not found. Assuming user is not logged');

        req.session = {
          culture: 'fr',
          country: 'FR',
          logged: false
        }

      } else {

        log('session found and loaded');

        req.session = JSON.parse( reply );

      }

      defineLang( req, req.session.culture );

      log('session is loaded');

      next();

    });

  };

},


/**
 * set flash message in response cookies
 */

flashSetter = function( cookieConfig ) {

  return function( req, res, next ) {

    res.setFlash = function( req, text ) {

      var b = new Buffer( req.cookies[cookieConfig.name], 'base64' ),

      cookieValues = JSON.parse( b.toString() );

      cookieValues.flash = i18n( text, getLang( req ) );

      b = new Buffer( JSON.stringify( cookieValues ) );

      this.cookie( cookieConfig.name, b.toString(  'base64' ) );

    };

    next();

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

    model.agendas().instance( req.agenda ).hasCredential( name, function(err, has) {

      if ( err ) return errorResponse( req, res, err );

      if ( !has ) return errorResponse( req, res, 'user does not have required creds' );

      log('agenda has credentials "%s"', name);

      next();

    });

  };

},


errorResponse = function(req, res, error ) {

  log( 'received error ');

  error = typeof error == 'string' ? { message: error } : error;

  error.head = {
    css: {
      main: '//d.cibul.net/css/compiled.css'
    }
  };

  error.scriptsBase = '/js';

  render( req, res, 'error/404', error );

},


unkownResponse = function(req, res, value) {

  res.send('unknown: ' + value);

},


/**
 * explicitely define lang value for current request
 */

defineLang = function( req, lang ) {

  req.lang = lang;

},


/**
 * get current request language
 */

getLang = function( req ) {

  if ( req.lang ) return req.lang;

  if ( req.query.lang ) return req.query.lang;

  // when in doubt, speak french
  
  return 'fr';

};