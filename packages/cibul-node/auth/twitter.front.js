"use strict";

const _ = require( 'lodash' );

const modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'twitter' ),

sessions = require( '@openagenda/sessions' ),

usersSvc = require( '@openagenda/users' ),

genUrl = require( '../services/genUrl' ),

agendaSvc = require( '../services/agenda' ),

w = require( 'when' ),

log = require( '@openagenda/logs' )( 'auth/twitter.front' ),

routes = {
  twitterSignin: [ 'get', '/twitter/signin', signin ],
  agendaTwitterSignin: [ 'get', '/:slug/twitter/signin', signin ],
  twitterSigninCallback: [ 'get', '/twitter/signin/callback', auth.serviceCallback( _processSignin ) ],
  twitterSignup: [ 'get', '/twitter/signup', signup ],
  agendaTwitterSignup: [ 'get', '/:slug/twitter/signup', signup ],
  twitterEmail: [ 'get', '/twitter/email', email ],
  agendaTwitterEmail: [ 'get', '/:slug/twitter/email', email ],
  twitterSignupCallback: [ 'get', '/twitter/signup/callback', auth.serviceCallback( _processSignup ) ]
};


module.exports = function( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oa.css' ),
    sessions.middleware.ifLogged( cmn.redirectTo() ),
  ] );

  return {
    load: load( router, path ),
    paths: modLib.getPaths( path, routes )
  }

}


function load( router, path ) {

  const key = _.get( config, 'auth.twitter.key' );
  const secret = _.get( config, 'auth.twitter.secret' );

  const twitterOptions = {
    consumerKey: key,
    consumerSecret: secret,
    passReqToCallback: true,
    skipExtendedUserProfile: true
  };

  return function( app ) {

    if ( key ) {

      pLib.loadStrategy( 'twitter', 'passport-twitter' );

      pLib.use( 'twitter-signin', 'twitter', lib.extend( {
        callbackURL: genUrl.abs( 'twitterSigninCallback' )
      }, twitterOptions ), _loadTwitterProfile );

      pLib.use( 'twitter-signup', 'twitter', lib.extend({
        callbackURL: genUrl.abs( 'twitterSignupCallback' )
      }, twitterOptions ), _loadTwitterProfile );

    }

    return router.load( path )( app );

  }

}


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'twitter-signin', {
    callbackURL: genUrl.abs( 'twitterSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  const additional = {};

  if ( req.query.email ) {

    req.log( 'retrieved email %s', req.query.email );

    additional.email = req.query.email;

  }

  if ( req.agenda ) {

    additional.agenda = req.agenda.slug;

  }

  auth.saveOptionals( req, res, additional );

  pLib.authenticate( 'twitter-signup', {
    callbackURL: genUrl.abs( 'twitterSignupCallback' )
  })( req, res, next );

}


function email( req, res, next ) {

  auth.renderEmail( req, res, {
    optionals: auth.loadOptionals( req ),
    uri: req.agenda ? 'agendaTwitterSignup' : 'twitterSignup'
  } );

}


function _processSignin( req, res, next ) {

  req.log( 'processing signin%s', req.agenda ? ' with agenda ' + req.agenda.slug : '' );

  pLib.authenticate( 'twitter-signin', {}, function( err, profile, data ) {

    w( { err, profile, req, res } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptUsernameLoad ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, _resendActivationToken ) ) )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( function( values ) {

      req.log( 'signinCallback controller complete' );

    }, cmn.catchError( req, res ) );

  } )(req, res, next );

}


function _processSignup( req, res, next ) {

  req.log( 'processing signup%s', req.agenda ? ' with agenda ' + req.agenda.slug : '' );

  pLib.authenticate( 'twitter-signup', {}, function( err, profile, data ) {

    w( { req: req, res: res, err: err, profile: profile, data: data } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ) )

    // .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( false, _resendActivationToken ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToComplete ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( auth.done, cmn.catchError( req, res ) );

  })( req, res, next );

}


function _resendActivationToken( values ) {

  values.req.log( 'resend activation token' )

  if ( values.req.agenda ) values.agenda = values.req.agenda;

  return w( values )

  .then( _createAndSend )

  .then( auth.redirectToComplete );

}


function _attemptTwitterCreate( values ) {

  values.req.log( 'attempting twitter create' );

  return w( values )

  .then( _redirectEmailFormIfNoProfileEmail )

  .then( auth.ifUnresolved( auth.attemptCreate ) )

  .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.existingEmail ) ) );

}



function _loadTwitterProfile( req, token, refreshToken, profile, done ) {

  var extracted = {
    id: profile.id,
    fullName: profile.username
  };

  if ( req.query.email ) {

    extracted.email = req.query.email;

  }

  done( null, extracted );

}


function _attemptUsernameLoad( values ) {

  return w.promise( function( resolve, reject ) {

    if ( !values.profile ) {

      return reject( values );

    }

    auth.authenticate( values.profile.fullName, async ( err, user, data ) => {

      if ( err ) values.err = err;

      if ( user ) values.user = user;

      if ( data ) _.merge( values.data, data );

      // do this while you are at it
      if ( values.user && values.profile ) {

        try {

          values.user = await usersSvc.patch( values.user.uid, { tweeterId: values.profile.id }, { internal: true } );

          log( 'info', 'twitter id has been fetched and saved for user %s: %s', user.id, JSON.stringify( result ) );

        } catch ( e ) {

          log( 'error', 'had trouble updating twitterId: %s', JSON.stringify( e ) );

        }

      }

      return resolve( values );

    });

  });

}


function _redirectEmailFormIfNoProfileEmail( values ) {

  values.req.log( 'redirect if no email is found in query' );

  var redirectUrl = values.req.genUrl( values.req.agenda ? 'agendaTwitterEmail' : 'twitterEmail', [
    values.req.query, values.req.agenda ? { slug: values.req.agenda.slug } : {}
  ] );

  if ( !values.req.query.email ) {

    values.req.log( 'no email is set in query' );

    values.res.redirect( 302, redirectUrl );

    values.resolved = true;

  }

  return values;

}

async function _createAndSend( values ) {

  log( 'creating activation token' );

  const user = values.user ? _.pick( values.user, 'id', 'uid', 'email' ) : { email: values.email };

  if ( user.id && user.email && !user.isActivated ) {

    log( 'user is already loaded: %s', JSON.stringify( user ) );

    return values;

  } else {

    log( 'loading user based on values %s', JSON.stringify( user ) );

    const result = await usersSvc.findOne( { query: user, detailed: true } );

    log( 'loaded user %s', JSON.stringify( result ) );

    if ( !result ) throw 'no account was found';

    if ( result.isActivated ) throw 'the account is already activated';

    values.user = result;

  }

  const optionals = _.pickBy( _.pick( values, 'iToken', 'invitation', 'redirect', 'agenda' ) );

  let token = await usersSvc.tokens.findOne( {
    query: { userId: values.user.id, email: values.user.email, type: 'aa' },
  } );

  if ( token ) {
    await usersSvc.config.interfaces.sendToken()( { result: token, params: { user: values.user, optionals } } );
  } else {
    token = await usersSvc.tokens.create(
      { userId: values.user.id, email: values.user.email, type: 'aa' },
      { user: values.user, optionals }
    );
  }

  values.token = token.token;

  log( 'info', 'activation token created for %s', values.user.email );

  return values;

}
