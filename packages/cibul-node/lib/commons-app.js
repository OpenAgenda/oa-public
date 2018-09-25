"use strict";

/**
 * common web app module middleware and initialization functions
 */

const _ = require( 'lodash' );
const async = require( 'async' );
const deepExtend = require( 'deep-extend' );
const hsts = require( 'hsts' );
const languages = require( 'languages' );
const qs = require( 'qs' );
const wn = require( 'when/node' );
const VError = require( 'verror' );

const agendas = require( '@openagenda/agendas' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const keys = require( '@openagenda/keys' );
const logger = require( '@openagenda/logger' );
const sessions = require( '@openagenda/sessions' );
const templater = require( '@openagenda/cibul-templates' );
const utils = require( '@openagenda/utils' );

const getUnauthLabels = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/unauthorized' ) );

const config = require( '../config' );
const detailedSessionLoad = sessions.middleware.load( { detailed: true } );
const genUrl = require( '../services/genUrl' );
const i18n = require( '../i18n/i18n.js' );
const model = require( '../services/model' );

const log = logger( 'commons-app' );

const labels = {
  unauthorized: require( '@openagenda/labels/errors/unauthorized' )
};

const verifyIPMiddleware = [
  agendas.middleware.load( {
    namespaces: {
      identifiers: { slug: 'params.slug' },
      result: 'agendaFromService'
    },
    private: null
  } ),
  agendas.middleware.evaluateIPAddress( {
    namespaces: {
      agenda: 'agendaFromService'
    },
    onUnauthorizedIPAddress: ( req, res, next ) => {

      if ( process.env.NODE_ENV === 'development' ) return next();

      res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agendaFromService.slug } ) );

    }
  } )
];

const verifyAdminModMiddleware = agendaIdentifiers => [
  agendas.middleware.load( {
    namespaces: {
      identifiers: agendaIdentifiers || { slug: 'params.slug' },
      result: 'agenda'
    },
    private: null,
    internal: true
  } ),
  loadMemberRole.bind( null, 'agenda' ),
  ( req, res, next ) => {

    if ( ![ 'administrator', 'moderator' ].includes( req.role ) ) {

      return next( { code: 403 } );

    }

    next();

  }
]

module.exports = {

  loadLogger,

  favoriteLinkHTML,

  render,                       // render and serve response
  renderJson,                   // render and serve json
  renderTemplate,               // render and serve template
  errorResponse,                // render error page
  catchError,                   // the heir of standard error handling

  https,                        // middleware. force https ( redirect to when not )

  requireAdmin,
  loadBaseData,                 // middleware.
  assign,                       // middleware for assigning values to req or res
  checkCredential,              // middleware. check that request agenda has required credential

  checkAdministrator,           // middleware. checks that logged user is administrator of loaded agenda
  checkModerator,
  checkContributor,
  checkAdminOrModerator,
  checkAdminOrModeratorOrKey,
  checkStakeholder,
  loadMemberRole,
  renderUnauthorized,

  verifyAdminModMiddleware,
  verifyIPMiddleware,

  useEmbedGoogleAnalytics,

  getRedirect,                  // get redirect

  writeToCookie,
  clearCookie,
  readCookie,

  redirectLegacySearch,
  loadLegacyRoutes,

  redirectTo,
  redirectToSignin,

  agendaMailTo,

  ifIs: ( path, fn ) => ( req, res, next ) => _.get( req, path, false ) ? fn( req, res, next ) : next(),
  ifIsNot: ( path, fn ) => ( req, res, next ) => _.get( req, path, false ) ? next() : fn( req, res, next ),

  lang

}


function agendaMailTo( agenda ) {

  const config = _.get( agenda, 'settings.inbox.mailto' );

  if ( !config ) return null;

  if ( !_.get( config, 'enabled' ) ) return null;

  const queryParts = [ 'subject', 'body' ]
    .map( key => ( { key, value: _.get( config, key ) } ) )
    .filter( item => item.value )
    .map( item => item.key + '=' + encodeURIComponent( item.value ) );

  if ( !queryParts.length ) return 'mailto:' + config.email;

  return 'mailto:' + config.email + '?' + queryParts.join( '&' );

}


/**
 * middleware for checking that logged user is administrator of
 * agenda loaded in request
 */

function checkAdministrator( options ) {

  const params = utils.extend( {
    name: 'agenda',
    message: 'You do not have access to the administration of this agenda.',
    redirect: false,
    useLegagy: true
  }, options ? options : {} );

  return function ( req, res, next ) {

    function _resolve( isAdmin ) {

      if ( isAdmin ) return next();

      if ( params.redirect ) {

        sessions.setFlash( req, res, params.message );

        return res.redirect( params.redirect );

      }

      next( {
        message: params.message,
        code: 403
      } );

    }

    _prepareSession( req, res, err => {

      if ( err ) return next( err );

      if ( !req.user ) return next( { code: 403 } );

      if ( !params.useLegacy ) {

        // rely on agenda-stakeholders

        return agendaStakeholders( req[ params.name ].id ).get( { userId: req.user.id }, ( err, stakeholder ) => {

          if ( !stakeholder ) {
            return _resolve( false );
          }

          const role = agendaStakeholders.types.codes.get( stakeholder.credential );

          _resolve( role === 'administrator' );

        } );

      }

      wn.call( req[ params.name ].isAdministrator, { id: req.user.id } )

        .then( _resolve )

        .catch( errorResponse.bind( null, req, res ) );

    } );
  }

}

function checkModerator( req, res, next ) {

  _prepareSession( req, res, err => {

    if ( err ) return next( err );

    if ( !req.user ) return next( { code: 403 } );

    wn.call( req.agenda.isModerator, { id: req.user.id } )

      .then( function ( isModerator ) {

        if ( !isModerator ) throw { message: 'You do not have access to the moderation of this agenda.', code: 403 };

        next();

      } )

      .catch( function ( err ) {

        errorResponse( req, res, err );

      } );

  } );

}


function checkContributor( req, res, next ) {

  _prepareSession( req, res, err => {

    if ( err ) return next( err );

    if ( !req.user ) return next( { code: 403 } );

    async.parallel( [
      async.apply( req.agenda.isAdministrator, { id: req.user.id } ),
      async.apply( req.agenda.isModerator, { id: req.user.id } ),
      async.apply( req.agenda.isContributor, { id: req.user.id } )
    ], ( err, results ) => {

      if ( err ) return next( err );

      if ( !results.filter( ( r ) => {
          return r;
        } ).length ) {

        return next( { code: 403 } );

      }

      next();

    } );

  } );

}



function loadMemberRole( agendaNamespace, req, res, next ) {

  req.role = null;

  _prepareSession( req, res, err => {

    if ( err ) return next( err );

    agendaStakeholders( req[ agendaNamespace ].id ).get( { userId: req.user.id }, ( err, stakeholder ) => {

      if ( !stakeholder ) {
        return next( {
          message: 'Not authorized',
          code: 403
        } );
      }

      req.role = agendaStakeholders.types.codes.get( stakeholder.credential );

      next();

    } );

  } )

}


function checkAdminOrModerator( req, res, next ) {

  _prepareSession( req, res, err => {

    if ( err ) return next( err );

    if ( !req.user ) return next( { code: 403 } );

    async.parallel( [
      async.apply( req.agenda.isAdministrator, { id: req.user.id } ),
      async.apply( req.agenda.isModerator, { id: req.user.id } )
    ], function ( err, results ) {

      if ( err ) return next( err );

      if ( !results[ 0 ] && !results[ 1 ] ) return next( { code: 403 } );

      req.access = results[ 0 ] ? 'administrator' : 'moderator';

      next();

    } );

  } );

}

function checkStakeholder( req, res, next ) {

  _prepareSession( req, res, err => {

    if ( err ) return next( err );

    if ( !req.user ) {

      return next( { code: 403 } );

    }

    req.agenda.isStakeholder( { id: req.user.id }, ( err, is ) => {

      if ( err ) return next( err );

      if ( !is ) return next( { code: 403 } );

      next();

    } );

  } );

}

function checkAdminOrModeratorOrKey( req, res, next ) {

  checkAdminOrModerator( req, res, async err => {

    if ( !err ) return next(); // If admin or moderator

    let key;

    try {
      key = await keys( { type: 'agendaFullRead', identifier: req.agenda.uid, key: req.query.key } ).get();
    } catch ( e ) {
    }

    if ( !key ) {

      return next( {
        message: 'the key is invalid',
        code: 403
      } );

    }

    next();

  } );

}


function renderUnauthorized() {

  return ( req, res, next ) => {

    loadBaseData( 'oasfmain.css' )( req, res, () => {

      render( req, res, 'dialog/index', {
        agenda: req.agenda,
        title: getUnauthLabels( 'title', req.lang ),
        content: getUnauthLabels( 'message', req.lang ),
        actions: [ {
          type: 'primary',
          href: req.agenda.slug + '/contact',
          label: getUnauthLabels( 'contactAdmin', req.lang )
        } ]
      } );

    } );

  }

}


/**
 * what to do with errors... make a redirect
 */

function errorResponse( req, res, error, jsonResponse ) {

  let errorTemplate;

  if ( !error.code ) {

    if ( error.statusCode ) {

      error.code = error.statusCode;

    }

    if ( res.statusCode !== 200 ) {

      error.code = res.statusCode;

    }

  }

  if ( !req.log ) {

    loadLogger( 'express' )( req, res );

  }

  lang( req, res, () => {

    req.log( 'preparing error response' );

    if ( jsonResponse === undefined ) {

      jsonResponse = /\.json$/.test( req.path );

    }

    if ( [ 401, 403, 404, 413 ].indexOf( error.code ) == -1 ) {

      req.log.load( { errorStack: error.stack } );

      req.log( 'error', 'received error: %j', error );

      // replaced with 00_errors
      //console.error( ( new Date ).toUTCString() + ' caught: %j', error );

      //console.error( error.stack ? error.stack : 'no stack' );

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

  } );


}

function catchError( req, res, jsonResponse ) {

  return err => {

    if ( typeof err == 'object' && (err.stack || err.message) ) {

      log( 'error', `caught error: ${err.stack ? err.stack : err.message}` );

    } else {

      log( 'error', 'caught error: %j', err );

    }

    // For send directly a json error with next( err )
    if ( err.json ) {

      return res.status( err.code || 400 ).send( err.json );

    }

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

    const statusCode = res.code ? res.code : 200;

    if ( !req.xhr ) {

      try {

        res.writeHead( statusCode, {
          "Content-Type": "text/html; charset=utf-8",
          'Cache-Control': res.get( 'Cache-Control' ) || 'no-cache'
        } );

      } catch ( e ) {

        log.error( new VError( e, `Error in the render of the template ${templatePath}` ) );

      }

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

  const compiledData = deepExtend( {},
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

  compiledData.jsVersion = config.jsVersion;

  compiledData.originalUrl = req.originalUrl;

  templater( templatePath + (req.xhr ? '.part' : ''), compiledData, function ( err, result ) {

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

    const baseData = {
      head: {
        css: {
          main: '/css/' + cssFile
        },
        js: {
          outdated: '/js/outdated.js'
        }
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

    if ( config.env == 'production' ) {

      const googleAnalyticsId = _.get( req, 'googleAnalyticsId', config.googleAnalyticsId );

      baseData.bottom.scripts.push( 'var _gaq = _gaq || [];var pluginUrl =\'//www.google-analytics.com/plugins/ga/inpage_linkid.js\';_gaq.push([\'_require\', \'inpage_linkid\', pluginUrl]);_gaq.push([\'_setAccount\', \'' + googleAnalyticsId + '\']);_gaq.push([\'_trackPageview\']);(function() {var ga = document.createElement(\'script\'); ga.type = \'text/javascript\'; ga.async = true;ga.src = (\'https:\' == document.location.protocol ? \'https://ssl\' : \'http://www\') + \'.google-analytics.com/ga.js\';var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(ga, s);})();' );
      baseData.bottom.scripts.push( `var errorsTrackingConfig = ${JSON.stringify( config.logger.errorsTracking )}` );

    }

    if ( req.agenda && req.agenda.hasChatbox && req.agenda.hasChatbox() ) {

      baseData.bottom.scripts.push( 'CRISP_WEBSITE_ID = "-KC1cwSWCMI3qYiWHBSI";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.im/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();' );

    }

    req.baseData = deepExtend( req.baseData || {}, baseData );

    next();

  }

}

function assign( source, target ) {

  return ( req, res, next ) => {

    const obj = { req, res };

    _.set( obj, target, _.get( obj, source ) );

    next();

  }

}


/**
 * returns middleware that redirects to given route&params ( uses req.genUrl )
 */
function redirectTo( route = 'corpoHome', params = {}, options = {} ) {

  const redirectParams = _.extend( {
    code: 302,
    maintainQuery: false,
    raw: {}
  }, options );

  return ( req, res, next ) => {

    let paramValues = _.mapValues( params, k => {

      if ( !_.isObject( k ) ) {

        return _.get( req.params, k );

      }

      if ( k[ '$raw' ] ) {

        return k[ '$raw' ];

      }

      if ( k[ '$route' ] || k[ '$base64Route' ] ) {

        let key = k[ '$route' ] || k[ '$base64Route' ];

        let v = req.genUrl( key[ 0 ], _.mapValues( key[ 1 ], r => _.get( req.params, r ) ) );

        if ( k[ '$base64Route' ] ) {

          v = (new Buffer( v, 'utf-8' )).toString( 'base64' );

        }

        return v;

      }

      return null;

    } );

    if ( redirectParams.maintainQuery ) {

      _.extend( paramValues, req.query );

    }

    const redirect = req.genUrl( route, paramValues );

    req.log( 'redirecting to %s', redirect );

    if ( req.xhr ) {

      return renderJson( req, res, {
        success: false,
        redirect,
        code: redirectParams.code
      } )

    }

    res.redirect( redirectParams.code, redirect );

  };

}

function redirectToSignin( req, res, next ) {

  return redirectTo( 'signin', {
    redirect: {
      $raw: (new Buffer( req.originalUrl, 'utf-8' )).toString( 'base64' )
    }
  } )( req, res, next );

}


function https( req, res, next ) {

  var redirectTo;

  if ( req.headers[ 'x-forwarded-proto' ] == 'https' ) {

    next();

    return;

  }

  redirectTo = 'https://' + req.hostname + req.originalUrl;

  req.log( 'forcing https: redirecting to %s', redirectTo );

  hsts( {
    maxAge: 15552000,
    includeSubDomains: false
  } )( req, res, () => {

    res.redirect( 301, redirectTo );

  } );

}


function requireAdmin( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, session ) => {

    if ( err ) return next( err );

    let id = session.id;

    if ( [ 1, 2, 11258, 15453, 34577 ].indexOf( parseInt( id ) ) !== -1 ) {

      next();

    } else {

      sessions.setFlash( req, res, 'Eerrh nooo, no esta, nooo, bye bye.' );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

    }

  } )


}

/**
 * check if agenda has 'name' credential
 */

function checkCredential( name, options ) {

  const params = _.extend( {
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


function getRedirect( req, paramName ) {

  let redirectValue;

  if ( !paramName ) {

    paramName = 'redirect';

  }

  if ( !req.query[ paramName ] ) {

    return false;

  }

  try {

    redirectValue = (new Buffer( req.query[ paramName ], 'base64' )).toString()

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

  let body = JSON.stringify( data );

  if ( req.query.callback ) {

    body = req.query.callback + '(' + _filterNonParsable( body ) + ')';

  }

  res.write( body );

  res.end();

  req.log( 'info', 'sent json response >>>' );

}


function favoriteLinkHTML( uid ) {

  return '<span class="fav js_fav_item" data-event-uid="' + uid + '"></span>';

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
      ip: ( req.header( 'x-forwarded-for' ) || '' ).split( ', ' ).shift()
    } );

    if ( next ) next();

  }

}


function clearCookie( req, res, key ) {

  const cookieValues = _decodeCookie( req );

  if ( cookieValues[ key ] === undefined ) {

    log( 'info', 'cookie value to be cleared is not set', key );

    return;

  }

  delete cookieValues[ key ];

  _saveCookie( req, res, cookieValues );

}

function readCookie( req, res, key, clearOnRead ) {

  const cookieValues = _decodeCookie( req );

  if ( clearOnRead ) {

    clearCookie( req, res, key );

  }

  return cookieValues[ key ];

}

function writeToCookie( req, res, key, value ) {

  const cookieValues = _decodeCookie( req );

  cookieValues[ key ] = value;

  _saveCookie( req, res, cookieValues );

}

function _saveCookie( req, res, cookieValues ) {

  const encodedCookieValues = (new Buffer( JSON.stringify( cookieValues ) )).toString( 'base64' );

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
        (new Buffer( encodedCookie, 'base64' )).toString()
      );

      return cookieValues;

    } catch ( e ) {

      log( 'error', 'could not decode cookie' );

    }

  }

  return {};

}


/**
 * explicitely define lang value for current request
 */


function lang( req, res, next ) {

  req.lang = 'fr';

  sessions.isLogged( req ).then( isLogged => {
    if ( isLogged ) {
      req.lang = sessions.getCulture( req );
    }

    if ( req.query.lang ) {
      req.lang = _cleanLang( req.query.lang );
    }

    if ( (isLogged && req.lang !== sessions.getCulture( req )) || req.query.lang ) {
      req.genUrl.preload( { lang: req.lang } );
    }

    if ( next ) next();

  } );

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


function _prepareSession( req, res, cb ) {

  if ( !req.user || !req.user.id ) {

    detailedSessionLoad( req, res, err => {

      if ( err ) return cb( err );

      cb();

    } );

  } else {

    cb();

  }

}
