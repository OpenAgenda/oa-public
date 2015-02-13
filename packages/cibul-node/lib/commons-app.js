

/**
 * common web app module middleware and initialization functions
 */

exports.loadApp = loadApp;                        // load module web app in main app
exports.loadRoutes = loadRoutes;                  // load module web app routes
exports.loadMiddlewares = loadMiddlewares;        // load specific middleware libs

exports.getCibulModel = getCibulModel;            // get model instance
exports.render = render;                          // render and serve response
exports.renderJson = renderJson;                  // render and serve json
exports.renderTemplate = renderTemplate;          // render and serve template
exports.errorResponse = errorResponse;            // render error page
exports.catchError = catchError;                  // the heir of standard error handling

exports.loadAgenda = loadAgenda;                  // middleware. loads an agenda in the request based on its slug
exports.requireLogged = requireLogged;            // middleware. verify if user is logged
exports.requireUnlogged = requireUnlogged;
exports.https = https;                            // middleware. force https ( redirect to when not )
exports.requireAdmin = requireAdmin;
exports.loadBaseData = loadBaseData;              // middleware. 
exports.loadSession = loadSession;                // middleware. load session data
exports.checkCredential = checkCredential;        // middleware. check that request agenda has required credential
exports.flashSetter = flashSetter;                // middleware. set a flash prior to redirect
exports.checkAdministrator = checkAdministrator;  // middleware. checks that logged user is administrator of loaded agenda

exports.urlGenSetter = urlGenSetter;              // router proxy function & middleware. load url generator in request
exports.makeGenUrl = makeGenUrl;
exports.registerRoutes = registerRoutes;          // router proxy function. register app module routes in router
exports.redirect = redirect;                      // router proxy function. do a redirect

exports.writeToCookie = writeToCookie;
exports.clearCookie = clearCookie
exports.readCookie = readCookie

/**
 * dependencies and constant declarations
 */

var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2, R_MW = 3,

express = require( 'express' ),

log = require( './logger' )( 'commons-app' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath, useCache: config.db.cache } ),

router = require( './router' ),

redisCli = require( 'redis' ).createClient( config.redis.port, config.redis.host ),

templater = require( 'cibulTemplates/server/templater' ),

i18n = require( '../i18n/i18n.js' ),

deepExtend = require( 'deep-extend' ),

lib = require( './lib' );



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

  app.use( _loadLogger( name ) );

  parent.use( app );

  return app;

}


/**
 * load specific middleware routes
 */

function loadMiddlewares( names ) {

  if ( typeof names == 'string' ) {

    names = [ names ];

  }

  var mw = {};

  names.forEach( function( name ) {

    mw[ name ] = require( './middlewares/' + name );

  });

  return mw;

}



/**
 * load app module routes and middlewares
 */

function loadRoutes( app, routes, middlewares ) {

  var path = app.get( 'path' ),

  appName = app.get( 'name' );

  for ( var name in routes ) {

    app.route( path + routes[name][R_URI] ).all( _logRoute( name ) );

    if ( middlewares ) {

      middlewares.forEach( function( middleware ) {

        app.route( path + routes[name][R_URI] ).all( middleware );

      });

    }

    if ( routes[ name ][ R_MW ] ) {

      routes[ name ][ R_MW ].forEach( function( routeMiddleware ) {

        app.route( path + routes[ name ][ R_URI ] ).all( routeMiddleware );

      });

    }

    app.route( path + routes[name][R_URI] ).all( _logRequest );

    log( 'debug', 'loading route "%s" of uri "%s"', name, path + routes[name][R_URI] );

    if ( typeof routes[name][R_CONTROLLER] == 'undefined' ) {

      throw 'no controller is defined for route ' + name;

    }

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

function loadAgenda( paramName ) {

  return function( req, res, next ) {

    var identifiers = {};

    if ( !req.params[ paramName ] ) {

      return next();

    } else {

      identifiers[ paramName ] = req.params[ paramName ];

    }

    wn.call( model.agendas().get, identifiers )

    .then( function( data ) {

      if ( !data ) throw { code: 404 };

      req.agenda = model.agendas().instance( data );

      req.log.load({ agenda: req.agenda.slug });

      next();

    })

    .catch( catchError( req, res ) );

  }

}




/**
 * middleware for checking that logged user is administrator of 
 * agenda loaded in request
 */

function checkAdministrator( req, res, next ) {

  wn.call( req.agenda.isAdministrator, { id: req.session.userId } )

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

function errorResponse( req, res, error, jsonResponse ) {

  req.log( 'preparing error response' );

  if ( error.code !== 404 ) {

    req.log.load( { errorStack: error.stack } );

    req.log( 'error', 'received error: %s', JSON.stringify( error ) );

  }

  error = typeof error == 'string' ? { message: error } : error;

  if ( !req.genUrl ) {

    req.genUrl = makeGenUrl({
      root: config.root,
      base: { path: '' }
    });

  }


  if ( jsonResponse ) {

    renderJson( req, res, {
      success: false,
      message: error.message ? error.message : 'There was a problem during the handling of the request'
    });

    return;

  }


  if ( req.baseData ) {

    render( req, res, 'error/404', error );
    
  } else {

    loadBaseData()( req, res, function() {

      render( req, res, 'error/404', error );

    });

  }

}

function catchError( req, res, jsonResponse ) {

  return function( err ) {

    log( 'caught error', JSON.stringify( err ) );

    if ( err.code == 404 ) {

      if ( !err.message ) err.message = 'The page you requested does not exist';

      req.log.load( { code: 404 } );

      res.code = 404;

      req.log( 'info', err.message );

    } else {

      req.log( 'error', err );

    }

    errorResponse( req, res, err, jsonResponse );  

  }

}



/**
 * render template and send response
 */

function render( req, res, templatePath, data, maintain ) {

  renderTemplate( req, templatePath, data, maintain, function( err, render ) {

    if ( err ) throw err;

    if ( !req.xhr ) {

      res.writeHead( res.code ? res.code : 200, {
        "Content-Type" : "text/html; charset=utf-8",
        'Cache-Control' : 'no-cache'
      });

      res.write( render );

      res.end();

      res.send();

      req.log( 'info', 'sent html response >>>' );

    } else {

      renderJson( req, res, {
        success: true,
        partial: render
      } );

    }

  });

}


function renderTemplate( req, templatePath, data, maintain, cb ) {

  var compiledData = deepExtend( {}, 
    req.baseData ? req.baseData : {},
    data ? data : {}
  );

  if ( !cb ) {

    cb = maintain;

    maintain = false;

  }

  compiledData.genUrl = req.genUrl;

  // maintain navigation query values

  if ( maintain ) {

    compiledData.page = req.query.page ? req.query.page : 1;
    compiledData.filters = req.query.filters ? req.query.filters : {};

  }

  compiledData.lang = _getLang( req );

  compiledData.env = process.env.NODE_ENV;

  templater( templatePath + ( req.xhr ? '.part' : '' ), compiledData, cb );

}


/**
 * load static data to be used in template
 *
 * @param function func  -  optionnally shove in controller specific static data
 */

function loadBaseData( func, cssFile ) {

  if ( !cssFile ) cssFile = 'compiled.css';

  return function( req, res, next ) {

    var baseData = {
      head: {
        css: {
          main: '/css/' + cssFile
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

      baseData.bottom.scripts.push('var _gaq = _gaq || [];var pluginUrl =\'//www.google-analytics.com/plugins/ga/inpage_linkid.js\';_gaq.push([\'_require\', \'inpage_linkid\', pluginUrl]);_gaq.push([\'_setAccount\', \'UA-9353107-11\']);_gaq.push([\'_trackPageview\']);(function() {var ga = document.createElement(\'script\'); ga.type = \'text/javascript\'; ga.async = true;ga.src = (\'https:\' == document.location.protocol ? \'https://ssl\' : \'http://www\') + \'.google-analytics.com/ga.js\';var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(ga, s);})();');

    }

    req.baseData = deepExtend( req.baseData ? req.baseData : {}, baseData );

    next();

  }

}



/**
 * load session data 
 */

function loadSession( req, res, next ) {

  log( 'loading session' );


  if ( req.session && req.session.userId ) {

    log( 'session found' );

    req.session.logged = true;

    var user = {};

    user.id = req.session.userId;

    req.user = user;

  } else {

    // super basic init
    if ( !req.session ) req.session = {};

    req.session.logged = false;

  }

  _defineLang( req );

  next();

}




/**
 * requiring logged client
 *
 * redirects to authShow if user is not logged
 */

function requireLogged( req, res, next ) {

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

function requireUnlogged( req, res, next ) {

  if ( !req.session.logged ) {

    next();

    return;

  }

  if ( req.xhr ) {

    renderJson( {
      success: false
    } );

  } else {

    router.redirect( req, res, 'homeShow' );

  }

}


function https( req, res, next ) {

  var redirectTo;

  if ( req.headers['x-forwarded-proto'] == 'https' ) {

    next();

    return;

  }

  redirectTo = 'https://' + req.hostname + req.originalUrl;

  req.log( 'forcing https: redirecting to %s', redirectTo );

  res.redirect( 301, redirectTo );

}


function requireAdmin( req, res, next ) {

  var id = req.user.id;

  if ( [ 1, 2, 2608 ].indexOf( parseInt( id, 10 ) ) !== -1 ) {

    next();

  } else {

    redirect( req, res, 'presentation', {}, 'Beat it.' );

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

      log( 'debug', 'agenda has credentials "%s"', name );

      next();

    });

  };

}



/**
 * add setFlash to response
 */

function flashSetter( req, res, next ) {

  res.setFlash = function( req, text, values ) {

    if ( !values ) values = {};

    req.log( 'debug', 'setting flash to "%s"', text );

    writeToCookie( req, res, 'flash', i18n( text, values, _getLang( req ) ) );

  };

  next();

}



/**
 * router proxy function - set url generator
 */

function urlGenSetter( name, path ) {

  return router.loadUrlGen( name, path );

}

function makeGenUrl( options ) {

  return router.makeGenUrl( options );

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

  res.writeHead( 200, {
    "Content-Type" : "application/json; charset=utf-8",
    'Cache-Control' : 'no-cache'
  });

  var body = JSON.stringify( data );

  if ( req.query.callback ) {

    body = req.query.callback + '(' + body + ')';

  }

  res.write( body );

  res.end();

  res.send();

  req.log( 'info', 'sent json response >>>' );

}


/**
 * middleware for loading an logger and shoving it in the request
 */

function _loadLogger( name ) {

  return function( req, res, next ) {

    req.log = require( './logger' )( 'req' );

    req.log.load( {
      module: name,
      url: req.originalUrl
    } );

    next();

  }

}

function _logRoute( name ) {

  return function( req, res, next ) {

    log( 'request %s goes to controller %s', req.originalUrl, name );

    req.log.load({
      controller: name,
      ip: req.header( 'x-forwarded-for' )
    });

    next();

  }

}


function clearCookie( req, res, key ) {

  var cookieValues = _decodeCookie( req );

  if ( cookieValues[ key ] === undefined ) {

    log( 'info', 'cookie value to be cleared is not set', key );

    return;

  }

  delete cookieValues[ key ];

  _saveCookie( req, res, cookieValues );

}

function readCookie( req, res, key, clearOnRead ) {

  var cookieValues = _decodeCookie( req );

  if ( clearOnRead ) {

    clearCookie( req, res, key );

  }

  return cookieValues[ key ];

}

function writeToCookie( req, res, key, value ) {

  var cookieValues = _decodeCookie( req );

  cookieValues[ key ] = value;

  _saveCookie( req, res, cookieValues );

}

function _saveCookie( req, res, cookieValues ) {

  var encodedCookieValues = ( new Buffer( JSON.stringify( cookieValues ) ) ).toString( 'base64' );

  // do this both in req and res.
  req.cookies[ config.cookie.name ] = encodedCookieValues;

  res.cookie( 
    config.cookie.name, 
    encodedCookieValues,
    { maxAge: 5*60*1000 }
  );

}

function _decodeCookie( req ) {

  var encodedCookie = req.cookies[ config.cookie.name ],

  cookieValues = {};

  if ( encodedCookie ) {

    try {

      cookieValues = JSON.parse( 
        ( new Buffer( encodedCookie, 'base64' ) ).toString()
      );

      return cookieValues;
      
    } catch( e ) {

      log( 'error', 'could not decode cookie' );

    }

  }

  return {};

}


function _logRequest( req, res, next ) {

  req.log( 'info', '>>> received request: %s', req.originalUrl );

  next();

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

  if ( req.query && req.query.lang ) return req.query.lang;

  // when in doubt, speak french
  log( 'did not detect any language' );

  return 'fr';

}