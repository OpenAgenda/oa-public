'use strict';

const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'auth/reset.front' );
const cmn = require( '../lib/commons-app' );
const app = require( '../app' );

const config = require( '../config' );

const preMw = [
  cmn.loadBaseData(),
  sessions.middleware.ifLogged( ( req, res ) => res.redirect( 302, '/' ) )
];


module.exports = app => {

  app.get( '/password/lost', preMw, lostPassword );
  app.post( '/password/lost', preMw, lostPasswordSubmit );
  app.get( '/password/reset/:token', preMw, resetPassword );
  app.post( '/password/reset/:token', preMw, resetPasswordSubmit );

};


/**
 * controllers
 */

function lostPassword( req, res ) {

  cmn.render( req, res, 'auth/lostPassword' );

}

function lostPasswordSubmit( req, res ) {

  _createAndSend( { email: req.body.email } )

    .then( _ifValueIs( 'sent', true, _redirectToSignin( req, res, 'A password reset is being sent to your email' ) ) )

    .then( _ifValueIsNot( 'sent', true, _render( req, res, 'auth/lostPassword' ) ) )

    .then( () => log( 'done' ), cmn.catchError( req, res ) );

}

function resetPassword( req, res ) {

  _verifyToken( { token: req.params.token } )

    .then( _ifValueIs( 'valid', true, _render( req, res, 'auth/resetPassword' ) ) )

    .then( _ifValueIsNot( 'resolved', true, _redirectToSignin( req, res, 'The link is outdated. Try again.' ) ) )

    .then( () => log( 'done' ), cmn.catchError( req, res ) );

}

function resetPasswordSubmit( req, res ) {

  updatePassword( {
    token: req.params.token,
    password: req.body.password,
    repeat: req.body.repeat,
  } )

    .then( _ifValueIs( 'success', true, _redirectToSignin( req, res, 'Your password has been updated.' ) ) )

    .then( _ifValueIsNot( 'resolved', true, _render( req, res, 'auth/resetPassword' ) ) )

    .then( () => log( 'done' ), cmn.catchError( req, res ) );

}


function _ifValueIs( name, expected, func ) {

  return function ( values ) {

    if ( expected == values[ name ] ) return func( values );

    return values;

  };

}

function _ifValueIsNot( name, expected, func ) {

  return function ( values ) {

    if ( expected !== values[ name ] ) return func( values );

    return values;

  };

}


function _render( req, res, uri, data ) {

  return function ( values ) {

    cmn.render( req, res, uri, values );

    values.resolved = true;

    return values;

  };

}


function _redirectToSignin( req, res, message ) {

  return values => {

    sessions.setFlash( req, res, message );

    res.redirect( 302, '/signin' );

    values.resolved = true;

    return values;

  };

}

async function _createAndSend( values ) {

  const usersSvc = app.service( '/users' );

  log( 'creating activation token' );

  const user = values.user ? _.pick( values.user, 'id', 'uid', 'email' ) : { email: values.email };

  if ( user.id && user.email && user.isActivated ) {

    log( 'user is already loaded: %s', JSON.stringify( user ) );

    return values;

  } else {

    log( 'loading user based on values %s', JSON.stringify( user ) );

    const result = await usersSvc.findOne( { query: user, detailed: true } );

    log( 'loaded user %s', JSON.stringify( result ) );

    if ( !result ) throw 'No account matching this email was found';

    if ( !result.isActivated ) throw 'The account matching this email is not yet activated';

    values.user = result;

  }

  let token = await usersSvc.tokens.findOne( {
    query: {
      userId: values.user.id,
      email: values.user.email,
      type: 'lp',
    },
  } );

  if ( token ) {
    await usersSvc.config.interfaces.sendToken( config )( { result: token, params: { user: values.user } } );
  } else {
    token = await usersSvc.tokens.create(
      {
        userId: values.user.id,
        email: values.user.email,
        type: 'lp',
      },
      { user: values.user },
    );
  }

  values.token = token.token;
  values.sent = true;

  log( 'info', 'lost password token created for %s', values.user.email );

  return values;

}

async function _verifyToken( values ) {

  const usersSvc = app.service( '/users' );

  const token = await usersSvc.tokens.findOne( {
    query: {
      token: values.token,
      type: 'lp',
    },
  } );

  values.valid = !!token;

  values.loadedToken = token;

  if ( !values.valid ) {

    values.message = 'token is not valid';

  }

  return values;

}

async function updatePassword( values ) {

  const usersSvc = app.service( '/users' );

  await _verifyToken( values );

  if ( values.valid ) {

    const result = await usersSvc.findOne( { query: { id: values.loadedToken.userId }, detailed: true } );

    if ( !result ) {

      values.message = 'user was not found';

    } else if ( !result.isActivated ) {

      values.message = 'user is not activated';

    } else {

      values.user = result;

    }

    if ( values.user ) {

      if ( values.password !== values.repeat ) {

        values.message = 'Passwords must match.';

        return values;

      } else if ( !values.password.length ) {

        values.message = 'Field cannot be empty.';

        return values;

      }

      try {

        await usersSvc.changePassword( values.user.uid, { password: values.password } );

        values.success = true;

      } catch ( e ) {

        throw 'the password could not be modified';

      }

      if ( values.success ) {

        await usersSvc.tokens.remove( values.loadedToken.id );

        log( 'token was successfully removed' );

      }

    }

  }

  return values;

}
