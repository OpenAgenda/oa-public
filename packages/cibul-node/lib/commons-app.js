/**
 * common web app module middleware and initialization functions
 */

exports.loadApp = loadApp;                        // load module web app in main app
exports.loadRoutes = loadRoutes;                  // load module web app routes

exports.getCibulModel = getCibulModel;            // get model instance
exports.render = render;                          // render templates. cibul-templates caller
exports.renderJson = renderJson;                  // render json data
exports.errorResponse = errorResponse;            // render error page

exports.loadAgenda = loadAgenda;                  // middleware. loads an agenda in the request based on its slug
exports.requireLogged = requireLogged;            // middleware. verify if user is logged
exports.requireAdmin = requireAdmin;
exports.loadBaseData = loadBaseData;              // middleware. 
exports.loadSession = loadSession;                // middleware. load session data
exports.checkCredential = checkCredential;        // middleware. check that request agenda has required credential
exports.flashSetter = flashSetter;                // middleware. set a flash prior to redirect
exports.checkAdministrator = checkAdministrator;  // middleware. checks that logged user is administrator of loaded agenda

exports.urlGenSetter = urlGenSetter;              // router proxy function & middleware. load url generator in request
exports.registerRoutes = registerRoutes;          // router proxy function. register app module routes in router
exports.redirect = redirect;                      // router proxy function. do a redirect



/**
 * dependencies and constant declarations
 */

var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2,

express = require( 'express' ),

log = require('./logger')( 'common-apps' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath } ),

router = require( './router' ),

redisCli = require( 'redis' ).createClient( config.redis.port, config.redis.host ),

templater = require( 'cibulTemplates/server/templater' ),

i18n = require( '../i18n/i18n.js' ),

deepExtend = require( 'deep-extend' );



/**
 * common app load handlings:
 *   - create express app
 *   - name app
 *   - handover to parent
 *   - load routes
 */

function loadApp( parent, path, name ) {

  var app = express();

  app.set( 'name', name );

  app.set( 'path', path );

  parent.use( app );

  return app;

}



/**
 * load app module routes and middlewares
 */

function loadRoutes( app, routes, middlewares ) {

  var path = app.get( 'path' ),

  name = app.get( 'name' );

  for ( var name in routes ) {

    if ( middlewares ) {

      middlewares.forEach( function( middleware ) {

        app.route( path + routes[name][R_URI] ).all( middleware );

      });

    }

    log( 'loading route "%s" of uri "%s"', name, path + routes[name][R_URI] );

    app[routes[name][R_METHOD]]( path + routes[name][R_URI], routes[name][R_CONTROLLER] );

  }

}



/**
 * get a model instance
 */

function getCibulModel() {

  return model;

}



/**
 * middleware for loading an agenda and shoving it in the request using app.param
 */

function loadAgenda( req, res, next, slug ) {

  wn.call( model.agendas().get, { slug: slug })

  .then( function( data ) {

    if ( data === null ) throw { message : 'Whoops. Could not retrieve the agenda.' };

    req.agenda = model.agendas().instance( data );

    next();

  })

  .catch( function( err ) {

    errorResponse( req, res, err );

  } );

}


/**
 * middleware for checking that logged user is administrator of 
 * agenda loaded in request
 */

function checkAdministrator( req, res, next ) {

  wn.call( req.agenda.isAdministrator, { id: req.session.id } )

  .then( function( isAdmin ) {

    if ( !isAdmin ) throw { message : 'You do not have access to the administration of this agenda.' };

    next();

  } )

  .catch( function( err ) {

    errorResponse( req, res, err );

  } );

}


/**
 * what to do with errors... make a redirect
 */

function errorResponse( req, res, error ) {

  log( 'received error: %s', error.toString() );

  error = typeof error == 'string' ? { message: error } : error;

  error.head = {
    css: {
      main: '//d.cibul.net/css/compiled.css'
    }
  };

  error.scriptsBase = '/js';

  render( req, res, 'error/404', error );

}



/**
 * cibul-templates caller
 */

function render( req, res, templatePath, data, maintain ) {

  if ( !data ) data = {};

  if ( req.baseData ) {

    deepExtend( data, req.baseData );

  }

  data.genUrl = req.genUrl;


  // maintain navigation query values

  if ( maintain ) {

    data.page = req.query.page ? req.query.page : 1;
    data.filters = req.query.filters ? req.query.filters : {};

  }

  data.lang = _getLang( req );

  data.env = process.env.NODE_ENV;

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

      renderJson( req, res, {
        success: true,
        partial: render
      } );

    }

  });

}


/**
 * load static data to be used in template
 *
 * @param function func  -  optionnally shove in controller specific static data
 *
 */

function loadBaseData( func ) {

  return function( req, res, next ) {

    var baseData = {
      head: {
        css: {
          main: '/css/compiled.css'
        },
        js: {}
      },
      bottom: {
        scripts: []
      },
      scriptsBase: '/js'
    }

    if ( func ) {

      deepExtend( baseData, func( req, res ) );

    }

    if ( config.env == 'prod' ) {

      baseData.bottom.scripts.push('var _gaq = _gaq || [];_gaq.push([\'_setAccount\', \'UA-9353107-11\']);_gaq.push([\'_trackPageview\']);(function() {var ga = document.createElement(\'script\'); ga.type = \'text/javascript\'; ga.async = true;ga.src = (\'https:\' == document.location.protocol ? \'https://ssl\' : \'http://www\') + \'.google-analytics.com/ga.js\';var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(ga, s);})();');

    }

    req.baseData = baseData;

    next();

  }

}



/**
 * load session data 
 */

function loadSession( req, res, next ) {

  var sessionKey = config.session.prefix + req.cookies[ config.session.cookie ];

  redisCli.get( sessionKey, function( err, reply ) {

    if ( err || !reply ) {

      log( 'session not found. Assuming user is not logged' );

      req.session = {
        culture: 'fr',
        country: 'FR',
        logged: false
      }

    } else {

      log( 'session found and loaded' );

      req.session = JSON.parse( reply );

    }

    if ( !req.session.logged ) {

      _defineLang( req );

    } else {

      _defineLang( req, req.session.culture );

    }

    

    log( 'session is loaded: %s', sessionKey );

    next();

  });

}



/**
 * requiring logged client
 *
 * redirects to authShow if user is not logged
 */

function requireLogged( req, res, next ) {

  var error = { message: 'logged required' };

  if ( req.session.logged ) {

    next();

    return;

  }


  // is not logged, redirect to login screen

  if ( req.xhr ) {

    renderJson( {
      success: false
    } );

  } else {

    var currentResource = new Buffer( req.originalUrl );

    router.redirect( req, res, 'authShow', { redirect: currentResource.toString( 'base64' ) } );

  }

}

function requireAdmin( req, res, next ) {

  var id = req.session.id; //req.user.id;

  if ( id == 1 || id == 2 || id == 22 ) {

    next();

    return;

  } else {

    redirect( req, res, 'presentation', {}, 'You\'re not an Administrator' );

  }

}

/**
 * check if agenda has 'name' credential
 */

function checkCredential( name ) {

  return function( req, res, next ) {

    model.agendas().instance( req.agenda ).hasCredential( name, function( err, has ) {

      if ( err ) return errorResponse( req, res, err );

      if ( !has ) return errorResponse( req, res, 'user does not have required creds' );

      log( 'agenda has credentials "%s"', name );

      next();

    });

  };

}



/**
 * add setFlash to response
 */

function flashSetter( req, res, next ) {

  res.setFlash = function( req, text ) {

    log( 'setting flash to "%s"', text );

    var b = new Buffer( req.cookies[config.cookie.name], 'base64' ),

    cookieValues = JSON.parse( b.toString() );

    cookieValues.flash = i18n( text, _getLang( req ) );

    b = new Buffer( JSON.stringify( cookieValues ) );

    this.cookie( config.cookie.name, b.toString(  'base64' ) );

  };

  next();

}



/**
 * router proxy function - set url generator
 */

function urlGenSetter( name, path ) {

  return router.loadUrlGen( name, path );

}


/**
 * router proxy function - register app routes
 */

function registerRoutes( name, path, routes ) {

  return router.registerRoutes( name, path, routes );

}


/**
 * router proxy function - redirections
 */

function redirect() {

  var args = Array.prototype.slice.call( arguments );

  return router.redirect.apply( null, args );

}



/**
 * set json data in response
 */

function renderJson( req, res, data ) {

  var body = JSON.stringify( data );

  if ( req.query.callback ) {

    body = req.query.callback + '(' + body + ')';

  }

  res.write( body );

  res.end();

  res.send();

}



/**
 * explicitely define lang value for current request
 */

function _defineLang( req, lang ) {

  if ( !lang ) {

    req.lang = req.query.lang ? req.query.lang : 'fr'

  } else {

    req.lang = lang;
    
  }


}



/**
 * get current request language
 */

function _getLang( req ) {

  if ( req.lang ) return req.lang;

  if ( req.query.lang ) return req.query.lang;

  // when in doubt, speak french
  
  return 'fr';

}