"use strict";

/**
 * common web app module middleware and initialization functions
 */

const _ = require( 'lodash' );
const async = require( 'async' );
const hsts = require( 'hsts' );
const fs = require( 'fs' );
const languages = require( 'languages' );
const qs = require( 'qs' );
const wn = require( 'when/node' );
const VError = require( 'verror' );

const agendasSvc = require( '@openagenda/agendas' );
const keysSvc = require( '@openagenda/keys' );
const logger = require( '@openagenda/logs' );
const sessions = require( '@openagenda/sessions' );
const templater = require( '@openagenda/cibul-templates' );
const utils = require( '@openagenda/utils' );

const getUnauthLabels = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/unauthorized' ) );
const getErrorLabel = require( '@openagenda/labels/makeLabelGetter' )( require( '@openagenda/labels/errors' ) );

const config = require( '../config' );
const detailedSessionLoad = sessions.middleware.load( { detailed: true } );
const genUrl = require( '../services/genUrl' );
const errorLogger = require( '../services/errors' );
const i18n = require( '../i18n/i18n.js' );
const model = require( '../services/model' );
const members = require( '../services/members' );
const usersSvc = require( '../services/users' );

const layouts = require( '../services/lib/layouts' );
const renderError = _.template( fs.readFileSync( __dirname + '/error.tpl', 'utf-8' ) );

const log = logger( 'commons-app' );

const labels = {
  unauthorized: require( '@openagenda/labels/errors/unauthorized' )
};

const verifyIPMiddleware = [
  agendasSvc.middleware.load( {
    namespaces: {
      identifiers: { slug: 'params.slug' },
      result: 'agendaFromService'
    },
    private: null
  } ),
  agendasSvc.middleware.evaluateIPAddress( {
    namespaces: {
      agenda: 'agendaFromService'
    },
    onUnauthorizedIPAddress: ( req, res, next ) => {

      if ( process.env.NODE_ENV === 'development' ) return next();

      res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agendaFromService.slug } ) );

    }
  } )
];

module.exports = {

  loadLogger,

  favoriteLinkHTML,

  render,                       // render and serve response
  renderJson,                   // render and serve json
  renderTemplate,               // render and serve template
  errorResponse,                // render error page
  catchError,                   // the heir of standard error handling

  https,                        // middleware. force https ( redirect to when not )

  requireSuperAdmin,
  loadBaseData,                 // middleware.
  loadAgenda: loadAgendaBy( 'slug' ),
  loadAgendaBy,
  assign,                       // middleware for assigning values to req or res
  checkCredential,              // middleware. check that request agenda has required credential
  checkAgendaCredential,
  checkAdminOrModeratorOrKey,
  renderUnauthorized,

  verifyIPMiddleware,

  useEmbedGoogleAnalytics,

  makeRedirect,
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

  lang,

  extractGoogleAnalytics

}


function extractGoogleAnalytics( agendas ) {

  return [].concat( agendas ).map( ( a, i ) => {

    const gaCode = _.get( a, 'settings.tracking.googleAnalytics' );

    if ( !gaCode ) return;

    return `ga( 'create', '${gaCode}', 'auto', 'clientTracker${i}' ); ga('clientTracker${i}.send', 'pageview');`;

  } ).filter( g => !!g ).join( '\n' );

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

async function checkAdminOrModeratorOrKey(req, res, next) {
  log('checkAdminOrModeratorOrKey');
  req.member = null;
  let hasAccess = false;

  try {
    // if is logged and is adminmod, we are good
    if (req.user) {
      try {
        log('evaluating logged user');
        const member = await members.get({
          agendaUid: req.agenda.uid,
          userUid: req.user.uid
        });
        if (member && members.utils.compareRoles.isSuperiorToOrEqual(member.role, 'moderator')) {
          log('user is logged and an adminmod, authorized');
          req.member = member;
          hasAccess = true;
        }
      } catch(e) {
        log('error', e);
      }
    }

    if (!hasAccess && req.query.key) {
      try {
        log('evaluating agenda key');
        const agendaKey = await keysSvc({
          type: 'agendaFullRead',
          identifier: req.agenda.uid,
          key: req.query.key
        }).get();

        if (agendaKey) {
          log('the agenda key is valid and provided, authorized');
          hasAccess = true;
        }
      } catch (e) {
        log('error', e);
      }
    }

    if (!hasAccess && req.query.key) {
      try {
        log('evaluating user key');
        const memberKey = await keysSvc({
          type: 'userPublic',
          key: req.query.key
        }).get();

        if (memberKey) {
          const user = await usersSvc.findOne( {
            query: { uid: memberKey.identifier },
            detailed: true
          } );

          if (!user) throw new Error('User not found');

          const member = await members.get( {
            agendaUid: req.agenda.uid,
            userUid: user.uid
          } );

          if (member && members.utils.compareRoles.isSuperiorToOrEqual(member.role, 'moderator')) {
            log('the user key is valid and identifies user as adminmod member, authorized');
            req.member = member;
            hasAccess = true;
          }
        } else {
          log('could not retrieve user key');
        }
      } catch (e) {
        log('error', e);
      }
    }

  } catch (err) {
    return next(err);
  }

  if (!hasAccess) {
    return next( {
      message: 'the key is invalid',
      code: 403
    } );
  }

  next();
}


function renderUnauthorized( req, res, next ) {

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


/**
 * what to do with errors... make a redirect
 */

function errorResponse( req, res, error, jsonResponse ) {

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

    if ( jsonResponse === undefined ) {

      jsonResponse = /\.json$/.test( req.path );

    }

    if ( [ 401, 403, 404, 413 ].indexOf( error.code ) === -1 ) {

      errorLogger( 'req', error );

      res.code = 500;

    } else {

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

    const data = {
      code: error.code,
      message: error.message,
      back: _.get( error, 'back', {
        label: getErrorLabel( 'defaultBack', req.lang ),
        link: '/'
      } )
    };

    const layoutData = {
      lang: req.lang,
      title: error.code
    };

    if ( !error.back && req.agenda ) {

      data.back = {
        label: getErrorLabel( 'defaultAgendaBack', req.lang ),
        link: `/${req.agenda.slug}`
      }

    }

    res.status( error.code || 500 );

    if ( req.agenda ) {

      layoutData.agenda = req.agenda;

      res.send( layouts.agenda( renderError( data ), layoutData ) );


    } else {

      res.send( layouts.main( renderError( data ), layoutData ) );

    }

  } );


}

function catchError( req, res, jsonResponse ) {

  return err => {

    // For send directly a json error with next( err )
    if ( err.json ) {

      return res.status( err.code || 400 ).send( err.json );

    }

    if ( err.code == 404 ) {

      if ( !err.message ) err.message = getErrorLabel( 'pageDoesNotExist', req.lang );

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

    if ( err ) {
      return catchError( req, res )( err );
    }

    const statusCode = res.code ? res.code : 200;

    if ( !req.xhr ) {

      try {

        res.writeHead( statusCode, {
          "Content-Type": "text/html; charset=utf-8",
          'Cache-Control': res.get( 'Cache-Control' ) || 'no-cache'
        } );

      } catch ( e ) {

        req.log( 'error', new VError( e, `Error in the render of the template ${templatePath}` ) );

      }

      res.write( render );

      res.end();

    } else {

      renderJson( req, res, {
        success: true,
        partial: render
      } );

    }

  } );

}


function renderTemplate( req, templatePath, data, maintain, cb ) {

  const compiledData = _.merge( {},
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

    const baseData = {
      head: {
        css: {
          main: '/css/' + cssFile
        },
        js: {
          outdated: '/js/outdated.js'
        }
      },
      scriptsBase: '/js'
    }

    if ( func ) {

      _.merge( baseData, func( req, res ) );

    }

    if ( req.layoutData ) {

      _.merge( baseData, req.layoutData );

    }

    req.baseData = _.merge( req.baseData || {}, baseData );

    if ( !_.get( req, 'baseData.bottom.scripts' ) ) {
      _.set( req, 'baseData.bottom.scripts', [] );
    }

    req.baseData.bottom.scripts.push(`
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    `);

    if ( config.env == 'production' ) {

      const googleAnalyticsId = _.get( req, 'googleAnalyticsId', config.googleAnalyticsId );

      if ( googleAnalyticsId ) req.baseData.bottom.scripts.push( `
          ga('create', '${googleAnalyticsId}', 'auto');
          ga('send', 'pageview');
      ` );

    }

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
function redirectTo( route, params = {}, options = {} ) {

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

          v = new Buffer( v, 'utf-8' ).toString( 'base64' );

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
  const agenda = req.agenda || _.get( req, 'agendaInstance.data' );
  res.redirect( 302, `${agenda ? '/' + agenda.slug : ''}/signin?redirect=${( new Buffer( req.originalUrl, 'utf-8' ) ).toString( 'base64' )}` );
}


function https( req, res, next ) {

  if ( req.headers[ 'x-forwarded-proto' ] == 'https' ) {

    next();

    return;

  }

  const redirectTo = 'https://' + req.hostname + req.originalUrl;

  req.log( 'forcing https: redirecting to %s', redirectTo );

  hsts( {
    maxAge: 15552000,
    includeSubDomains: false
  } )( req, res, () => {

    res.redirect( 301, redirectTo );

  } );

}


function requireSuperAdmin( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, session ) => {

    if ( err ) return next( err );

    const id = session.id;

    if ( [ 1, 2, 11258, 15453, 34577 ].indexOf( parseInt( id ) ) !== -1 ) {

      next();

    } else {

      sessions.setFlash( req, res, 'Eerrh nooo, no esta, nooo, bye bye.' );

      res.redirect( 302, '/' );

    }

  } )


}

function checkAgendaCredential(name) {
  return (req, res, next) => {
    if (!req.agenda.credentials[name]) {
      errorResponse( req, res, 'user does not have required creds' );
    } else {
      next();
    }
  }
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


function makeRedirect( urlOrReq ) {

  return new Buffer(
    _.isObject( urlOrReq ) ? urlOrReq.originalUrl : urlOrReq,
    'utf8'
  ).toString( 'base64' );

}

function getRedirect( req, paramName = 'redirect' ) {

  if ( !req.query[ paramName ] ) return false;

  try {
    return (new Buffer( req.query[ paramName ], 'base64' )).toString();
  } catch ( e ) {
    log( 'error', 'invalid redirect value in request: %s', req.query[ paramName ] );
  }

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

    req.log.loadMetadata( {
      module: name ? name : 'unknown',
      url: req.originalUrl,
      ip: ( req.header( 'x-forwarded-for' ) || '' ).split( ', ' ).shift()
    } );

    if ( next ) next();

  }

}

function loadAgendaBy( param ) {

  return ( req, res, next ) => {

    const identifier = _.isString( param )
      ? _.pick( req.params, [ param ] )
      : _.set( {}, _.keys( param )[ 0 ], req.params[ param[ _.keys( param )[ 0 ] ] ] );

    agendasSvc.get( identifier, {
      private: null,
      internal: true,
      includeImagePath: true
    } ).then( agenda => {

      if ( !agenda ) return next( { code: 404 } );

      _.assign( req, { agenda } );

      next();

    }, next );

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

  const legacyRoutes = config.routes.globals;
  const prefix = config.routes.defaultGlobalsPrefix;

  for ( const name in legacyRoutes ) {

    legacyRoutes[ name ] = `${legacyRoutes[ name ].legacy ? prefix : ''}${legacyRoutes[ name ].uri}`;

  }

  genUrl.load( legacyRoutes );

}

function redirectLegacySearch( req, res, next ) {

  if ( req.query.search ) {

    var query = utils.extend( { oaq: req.query.search }, req.query );

    query.search = undefined;

    res.redirect( 301, req.baseUrl + req.path + qs.stringify( query, { addQueryPrefix: true } ) );

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
