"use strict";

/**
 * common web app module middleware and initialization functions
 */


module.exports = {

  loadLogger,

  render,                       // render and serve response
  renderJson,                   // render and serve json
  renderTemplate,               // render and serve template
  errorResponse,                // render error page
  catchError,                   // the heir of standard error handling

  isLogged,                     // this guy speaks for himself.
  requireLogged,                // middleware. verify if user is logged
  requireUnlogged,
  https,                        // middleware. force https ( redirect to when not )

  requireAdmin,
  loadBaseData,                 // middleware. 
  loadSession,                  // middleware. load session data
  loadUserUid,
  checkCredential,              // middleware. check that request agenda has required credential
  flashSetter,                  // middleware. set a flash prior to redirect

  checkAdministrator,           // middleware. checks that logged user is administrator of loaded agenda
  checkModerator,
  checkContributor,
  checkAdminOrModerator,
  checkAdminOrModeratorOrKey,
  checkStakeholder,

  useEmbedGoogleAnalytics,

  getRedirect,                  // get redirect

  writeToCookie,
  clearCookie,
  readCookie,

  redirectLegacySearch,
  loadLegacyRoutes

}

/**
 * dependencies and constant declarations
 */

var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2, R_MW = 3,

  express = require( 'express' ),

  logger = require( 'logger' ),

  log = logger( 'commons-app' ),

  config = require( '../config' ),

  w = require( 'when' ),

  wn = require( 'when/node' ),

  model = require( '../services/model' ),

  templater = require( 'cibulTemplates' ),

  i18n = require( '../i18n/i18n.js' ),

  deepExtend = require( 'deep-extend' ),

  utils = require( 'utils' ),

  agendaSvc = require( '../services/agenda' ),

  async = require( 'async' ),

  genUrl = require( '../services/genUrl' ),

  languages = require( 'languages' ),

  userSvc = require( '../services/user' ),

  labels = {
    unauthorized: require( 'labels/errors/unauthorized' )
  },

  qs = require( 'qs' );


function loadEvent( paramName, fieldName ) {

  return function ( req, res, next ) {

    var identifiers = {};

    if ( !req.params[ paramName ] ) {

      return next();

    } else {

      identifiers[ fieldName ] = req.params[ paramName ];

    }

    log( 'retrieving event for %s', JSON.stringify( identifier ) );

    wn.call( model.events().get, identifiers )

      .then( function ( data ) {

        if ( !data ) throw { code: 404 };

        req.event = model.events().instance( data );

        req.log.load( { event: req.event.slug } );

        next();

      } )

      .catch( catchError( req, res ) );

  }

}


/**
 * middleware for checking that logged user is administrator of
 * agenda loaded in request
 */

function checkAdministrator( options ) {

  var params = utils.extend( {
    name: 'agenda',
    message: 'You do not have access to the administration of this agenda.',
    redirect: false
  }, options ? options : {} );

  return function ( req, res, next ) {

    wn.call( req[ params.name ].isAdministrator, { id: req.session.userId } )

      .then( isAdmin => {

        if ( !isAdmin ) {

          if ( params.redirect ) {

            res.setFlash( req, params.message );

            return res.redirect( params.redirect );

          }

          throw {
            message: params.message,
            code: 403
          };

        }

        next();

      } )

      .catch( err => {

        errorResponse( req, res, err );

      } );

  }

}

function checkModerator( req, res, next ) {

  wn.call( req.agenda.isModerator, { id: req.session.userId } )

    .then( function ( isModerator ) {

      if ( !isModerator ) throw { message: 'You do not have access to the moderation of this agenda.', code: 403 };

      next();

    } )

    .catch( function ( err ) {

      errorResponse( req, res, err );

    } );

}


function checkContributor( req, res, next ) {

  async.parallel( [
    async.apply( req.agenda.isAdministrator, { id: req.session.userId } ),
    async.apply( req.agenda.isModerator, { id: req.session.userId } ),
    async.apply( req.agenda.isContributor, { id: req.session.userId } )
  ], ( err, results ) => {

    if ( err ) return next( err );

    if ( !results.filter( ( r ) => {
        return r;
      } ).length ) {

      return next( { code: 403 } );

    }

    next();

  } );

}


function checkAdminOrModerator( req, res, next ) {

  async.parallel( [
    async.apply( req.agenda.isAdministrator, { id: req.session.userId } ),
    async.apply( req.agenda.isModerator, { id: req.session.userId } )
  ], function ( err, results ) {

    if ( err ) return next( err );

    if ( !results[ 0 ] && !results[ 1 ] ) return next( { code: 403 } );

    req.access = results[ 0 ] ? 'administrator' : 'moderator';

    next();

  } );

}

function checkStakeholder( req, res, next ) {

  req.agenda.isStakeholder( { id: req.session.userId }, ( err, is ) => {

    if ( !is ) return next( { code: 403 } );

    next();

  } );

}

function checkAdminOrModeratorOrKey( req, res, next ) {

  checkAdminOrModerator( req, res, err => {

    if ( !err ) return next();

    if ( !req.agenda.isKeyValid( req.query.key ) ) {

      return next( {
        message: 'the key is invalid',
        code: 403
      } );

    }

    next();

  } );

}


/**
 * what to do with errors... make a redirect
 */

function errorResponse( req, res, error, jsonResponse ) {

  var errorTemplate;

  if ( error.statusCode && !error.code ) {

    error.code = error.statusCode;

  }

  if ( !req.log ) {

    loadLogger( 'express' )( req, res );

  }

  if ( !req.lang ) {

    _defineLang( req );

  }

  req.log( 'preparing error response' );

  if ( jsonResponse === undefined ) {

    jsonResponse = /\.json$/.test( req.path );

  }

  if ( [ 401, 403, 404, 413 ].indexOf( error.code ) == -1 ) {

    req.log.load( { errorStack: error.stack } );

    req.log( 'error', 'received error: %s', JSON.stringify( error ) );

    console.error( ( new Date ).toUTCString(), 'uncaught: %s', JSON.stringify( error ) );

    console.error( error.stack ? error.stack : 'no stack' );

    errorTemplate = 'error/show';

    res.code = 500;

  } else {

    errorTemplate = 'error/show';

    res.code = error.code;

  }

  error = typeof error == 'string' ? { message: error } : error;

  if ( !req.genUrl ) {

    req.genUrl = genUrl;

  }


  if ( res.code === 413 ) {

    error.message = i18n( 'Your submission is too large: maximum allowed is %max%kb, you submitted %sub%kb', {
      '%max%': Math.ceil( error.limit / 1000 ),
      '%sub%': Math.ceil( error.length / 1000 )
    }, req.lang );

  } else if ( error.message ) {

    error.message = i18n( error.message, {}, req.lang );

  }


  if ( jsonResponse ) {

    renderJson( req, res, {
      success: false,
      message: error.message ? error.message : 'There was a problem during the handling of the request'
    } );

    return;

  }

  if ( req.baseData ) {

    req.baseData.head.css.main = '/css/compiled.css';

    render( req, res, errorTemplate, error );

  } else {

    loadBaseData()( req, res, function () {

      render( req, res, errorTemplate, error );

    } );

  }

}

function catchError( req, res, jsonResponse ) {

  return function ( err ) {

    log( 'error', 'caught error: %s', typeof err == 'object' && err.message ? err.message : JSON.stringify( err ) );

    if ( err.code == 404 ) {

      if ( !err.message ) err.message = 'The page you requested does not exist';

      res.code = 404;

      req.log( 'error', err );

    } else if ( err.code == 403 && err.messageCode ) {

      err.message = labels.unauthorized[ err.messageCode ][ req.lang ];

    }

    errorResponse( req, res, err, jsonResponse );

  }

}


/**
 * render template and send response
 */

function render( req, res, templatePath, data, maintain ) {

  renderTemplate( req, templatePath, data, maintain, function ( err, render ) {

    if ( err ) return catchError( req, res )( err );

    if ( err ) throw err;

    var statusCode = res.code ? res.code : 200;

    if ( !req.xhr ) {

      res.writeHead( statusCode, {
        "Content-Type": "text/html; charset=utf-8",
        'Cache-Control': res.get( 'Cache-Control' ) || 'no-cache'
      } );

      res.write( render );

      res.end();

      req.log( 'info', { code: statusCode, message: 'response sent' } );

    } else {

      renderJson( req, res, {
        success: true,
        partial: render
      } );

    }

  } );

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

  templater( templatePath + ( req.xhr ? '.part' : '' ), compiledData, function ( err, result ) {

    if ( err && req.xhr ) { // xhr request has no corresponding partial

      templater( templatePath, compiledData, cb );

      return;

    }

    cb( err, result );

  } );

}


function useEmbedGoogleAnalytics( req, res, next ) {

  req.googleAnalyticsId = config.embedGoogleAnalyticsId;

  next();

}


/**
 * load static data to be used in template
 *
 * @param function func  -  optionnally shove in controller specific static data
 */

function loadBaseData( func, cssFile ) {

  if ( typeof func == 'string' ) {

    cssFile = func;

    func = false;

  } else if ( !cssFile ) {

    cssFile = 'compiled.css';

  }

  cssFile += '?v=' + config.cssVersion;

  return ( req, res, next ) => {

    req.log( 'loading base data' );

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

    if ( req.layoutData ) {

      deepExtend( baseData, req.layoutData );

    }

    if ( config.env == 'prod' ) {

      let googleAnalyticsId = req.googleAnalyticsId || config.googleAnalyticsId;

      baseData.bottom.scripts.push( 'var _gaq = _gaq || [];var pluginUrl =\'//www.google-analytics.com/plugins/ga/inpage_linkid.js\';_gaq.push([\'_require\', \'inpage_linkid\', pluginUrl]);_gaq.push([\'_setAccount\', \'' + googleAnalyticsId + '\']);_gaq.push([\'_trackPageview\']);(function() {var ga = document.createElement(\'script\'); ga.type = \'text/javascript\'; ga.async = true;ga.src = (\'https:\' == document.location.protocol ? \'https://ssl\' : \'http://www\') + \'.google-analytics.com/ga.js\';var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(ga, s);})();' );
      baseData.bottom.scripts.push( `var errorsTrackingConfig = ${JSON.stringify( config.logger.errorsTracking )}` );

    }

    if ( req.agenda && req.agenda.hasChatbox() ) {

      baseData.bottom.scripts.push( 'CRISP_WEBSITE_ID = "-KC1cwSWCMI3qYiWHBSI";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.im/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();' );

    }

    req.baseData = deepExtend( req.baseData ? req.baseData : {}, baseData );

    next();

  }

}


function loadUserUid( req, res, next ) {

  userSvc.get( { id: req.user.id }, ( err, user ) => {

    if ( err ) return next( err );

    req.userUid = user.uid;

    next();

  } );

}


/**
 * load session data
 */

function loadSession( req, res, next ) {

  if ( req.cookies[ config.cookie.name ] ) {

    req.log.load( {
      session: req.cookies[ config.cookie.name ].substr( 0, 10 )
    } );

  }

  if ( req.session && req.session.userId ) {

    req.session.logged = true;

    var user = {};

    user.id = req.session.userId;

    req.user = user;

    req.log.load( { userId: user.id } );

  } else {

    // super basic init
    if ( !req.session ) req.session = {};

    req.session.logged = false;

    req.log.load( { userId: false } );

  }

  _defineLang( req );

  next();

}


function isLogged( req ) {

  return !!req.session.logged;

}

/**
 * requiring logged client
 *
 * redirects to authShow if user is not logged
 */

function requireLogged( options ) {

  var params = Object.assign( {
    redirect: false,
    redirectParams: []
  }, options || {} );

  return ( req, res, next ) => {

    if ( isLogged( req ) ) {

      next();

      return;

    }

    // is not logged, redirect to login screen

    if ( req.xhr ) {

      renderJson( req, res, {
        success: false
      } );

    } else {

      let redirectTo;

      if ( !params.redirect ) {

        redirectTo = req.genUrl( 'authShow', { redirect: ( new Buffer( req.originalUrl ) ).toString( 'base64' ) } );

      } else {

        let redirectValues = {};

        params.redirectParams.forEach( ( p ) => {

          redirectValues[ p ] = req.params[ p ];

        } );

        redirectTo = req.genUrl( params.redirect, redirectValues );

      }

      res.redirect( 302, redirectTo );

    }

  }

}


function requireUnlogged( req, res, next ) {

  if ( !isLogged( req ) ) {

    next();

    return;

  }

  if ( req.xhr ) {

    renderJson( req, res, {
      success: false
    } );

  } else {

    res.redirect( 302, req.genUrl( 'homeShow' ) );

  }

}


function https( req, res, next ) {

  var redirectTo;

  if ( req.headers[ 'x-forwarded-proto' ] == 'https' ) {

    next();

    return;

  }

  redirectTo = 'https://' + req.hostname + req.originalUrl;

  req.log( 'forcing https: redirecting to %s', redirectTo );

  res.redirect( 301, redirectTo );

}


function requireAdmin( req, res, next ) {

  var id = req.user.id;

  if ( [ 1, 2, 9281, 11258, 15453 ].indexOf( parseInt( id, 10 ) ) !== -1 ) {

    next();

  } else {

    res.setFlash( req, 'Beat it.' );

    res.redirect( 302, req.genUrl( 'corpoHome' ) );

  }

}

/**
 * check if agenda has 'name' credential
 */

function checkCredential( name, options ) {

  var params = utils.extend( {
    name: 'agenda',
    namespace: false // if not set, response is error when cred is not assigned
  }, options ? options : {} );

  if ( !options ) options = {};

  return function ( req, res, next ) {

    model.agendas().instance( req[ params.name ] ).hasCredential( name, function ( err, has ) {

      if ( err ) return errorResponse( req, res, err );

      if ( !has && !params.namespace ) {

        return errorResponse( req, res, 'user does not have required creds' );

      }

      if ( has ) {

        log( 'debug', 'agenda has credentials "%s"', name );

      }

      if ( params.namespace ) {

        req[ params.namespace ] = has;

      }

      next();

    } );

  };

}


/**
 * add setFlash to response
 */

function flashSetter( req, res, next ) {

  res.setFlash = function ( req, text, values ) {

    if ( !values ) values = {};

    req.log( 'debug', 'setting flash to "%s"', text );

    writeToCookie( req, res, 'flash', i18n( text, values, _getLang( req ) ) );

  };

  req.setFlash = res.setFlash.bind( null, req );

  next();

}


function getRedirect( req, paramName ) {

  var redirectValue;

  if ( !paramName ) {

    paramName = 'redirect';

  }

  if ( !req.query[ paramName ] ) {

    return false;

  }

  try {

    redirectValue = ( new Buffer( req.query[ paramName ], 'base64' ) ).toString()

  } catch ( e ) {

    log( 'error', 'invalid redirect value in request: %s', req.query[ paramName ] );

  }

  return redirectValue;

}


/**
 * set json data in response
 */

function renderJson( req, res, data, options ) {

  res.set( 'Content-Type', 'application/json; charset=utf-8' );

  if ( !res.get( 'Last-Modified' ) ) {

    res.set( 'Cache-Control', 'no-cache' );

  }

  var body = JSON.stringify( data );

  if ( req.query.callback ) {

    body = req.query.callback + '(' + _filterNonParsable( body ) + ')';

  }

  res.write( body );

  res.end();

  req.log( 'info', 'sent json response >>>' );

}


/**
 * middleware for loading an logger and shoving it in the request
 */

function loadLogger( name ) {

  return function ( req, res, next ) {

    req.log = logger( 'req' );

    req.log.load( {
      module: name ? name : 'unknown',
      url: req.originalUrl,
      ip: req.header( 'x-forwarded-for' )
    } );

    if ( next ) next();

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
    { maxAge: 5 * 60 * 1000 }
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

    } catch ( e ) {

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

function _defineLang( req ) {

  if ( req.query.lang ) {

    req.lang = _cleanLang( req.query.lang );

  } else if ( req.session && req.session.lang ) {

    req.lang = _cleanLang( req.session.lang );

  } else {

    req.lang = 'fr';

  }

  if ( req.lang !== 'fr' ) {

    req.genUrl.preload( { lang: req.lang } );

  }

  req.log.load( { lang: req.lang } );

}


/**
 * get current request language
 */

function _getLang( req ) {

  return req.lang || _cleanLang( req.query ? req.query.lang : 'fr' );

}

function _cleanLang( dirtyLang ) {

  if ( languages.isValid( dirtyLang ) ) return dirtyLang;

  return 'fr';

}


/**
 * filter out characters that will cause parse errors on browser
 */

function _filterNonParsable( str ) {

  var rgx = new RegExp( '[' + [ 8232, 8233 ].map( String.fromCharCode ).join( '' ) + ']', 'g' );

  return str.replace( rgx, ' ' );

}


function loadLegacyRoutes( genUrl ) {

  var legacyRoutes = config.routes.globals;

  for ( var name in legacyRoutes ) {

    legacyRoutes[ name ] = config.routes.defaultGlobalsPrefix + legacyRoutes[ name ].uri;

  }

  genUrl.load( legacyRoutes );

}

function redirectLegacySearch( req, res, next ) {

  if ( req.query.search ) {

    var query = utils.extend( { oaq: req.query.search }, req.query );

    query.search = undefined;

    res.redirect( 301, req.baseUrl + req.path + '?' + qs.stringify( query ) );

    return;

  }

  next();

}