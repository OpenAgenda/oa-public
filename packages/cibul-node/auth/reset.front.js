'use strict';

const _ = require('lodash');
const log = require( '@openagenda/logs' )( 'auth/reset.front' );
const labels = require('@openagenda/labels/auth/errors');
const makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
const cmn = require( '../lib/commons-app' );
const sessions = require('../../sessions');

const getLabel = makeLabelGetter(labels);

const config = require( '../config' );

const preMw = [
  cmn.loadBaseData('oa-main.css'),
  sessions.mw.ifLogged( ( req, res ) => res.redirect( 302, '/' ) )
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

  const { services } = req.app;

  _createAndSend( services, { email: req.body.email, req } )

    .then( _ifValueIs( 'sent', true, _redirectToSignin( req, res, getLabel('passwordResetSent', req.lang) ) ) )

    .then( _ifValueIsNot( 'sent', true, _render( req, res, 'auth/lostPassword' ) ) )

    .then( () => log( 'done' ), err => {
      services.sessions.setFlash(req, res, err.message);

      res.redirect('/');
    } );

}

function resetPassword( req, res ) {

  const { services } = req.app;

  _verifyToken( services, { token: req.params.token, req } )

    .then( _ifValueIs( 'valid', true, _render( req, res, 'auth/resetPassword' ) ) )

    .then( _ifValueIsNot( 'resolved', true, _redirectToSignin( req, res, getLabel('resetLinkOutdated', req.lang) ) ) )

    .then( () => log( 'done' ), cmn.catchError( req, res ) );

}

function resetPasswordSubmit( req, res ) {

  const { services } = req.app;

  updatePassword(
    services,
    {
      req,
      token: req.params.token,
      password: req.body.password,
      repeat: req.body.repeat,
    }
  )

    .then( _ifValueIs( 'success', true, _redirectToSignin( req, res, getLabel('passwordUpdated', req.lang) ) ) )

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

async function _createAndSend( services, values ) {

  log( 'creating activation token' );

  const {
    users: usersSvc,
    tokens: tokensSvc
  } = services;

  const user = values.user ? _.pick( values.user, 'id', 'uid', 'email' ) : { email: values.email };

  if ( user.id && user.email && user.isActivated ) {

    log( 'user is already loaded: %s', JSON.stringify( user ) );

    return values;

  } else {

    log( 'loading user based on values %s', JSON.stringify( user ) );

    const result = await usersSvc.findOne( { query: user, detailed: true } );

    log( 'loaded user %s', JSON.stringify( result ) );

    if ( !result ) throw new Error( getLabel('noAccountFound', values.req.lang) );

    if ( !result.isActivated ) throw new Error( getLabel('userNotActivated', values.req.lang) );

    values.user = result;

  }

  let token = await tokensSvc.findOne( {
    query: {
      userId: values.user.id,
      email: values.user.email,
      type: 'lp',
    },
  } );

  if ( token ) {
    await tokensSvc.config.interfaces.sendToken( config )( { result: token, params: { user: values.user } } );
  } else {
    token = await tokensSvc.create(
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

async function _verifyToken( services, values ) {

  const { tokens: tokensSvc } = services;

  const token = await tokensSvc.findOne( {
    query: {
      token: values.token,
      type: 'lp',
    },
  } );

  values.valid = !!token;

  values.loadedToken = token;

  if ( !values.valid ) {

    values.message = getLabel('invalidToken', values.req.lang);

  }

  return values;

}

async function updatePassword( services, values ) {

  const {
    users: usersSvc,
    tokens: tokensSvc
  } = services;

  await _verifyToken( services, values );

  if ( values.valid ) {

    const result = await usersSvc.findOne( { query: { id: values.loadedToken.userId }, detailed: true } );

    if ( !result ) {

      values.message = getLabel('userNotFound', values.req.lang);

    } else if ( !result.isActivated ) {

      values.message = getLabel('userNotActivated', values.req.lang);

    } else {

      values.user = result;

    }

    if ( values.user ) {

      if ( values.password !== values.repeat ) {

        values.message = getLabel('passwordsMustMatch', values.req.lang);

        return values;

      } else if ( !values.password.length ) {

        values.message = getLabel('fieldCannotBeEmpty', values.req.lang);

        return values;

      }

      try {

        await usersSvc.changePassword( values.user.uid, { password: values.password } );

        values.success = true;

      } catch ( e ) {

        throw getLabel('passwordCouldNotBeModified', values.req.lang);

      }

      if ( values.success ) {

        await tokensSvc.remove( values.loadedToken.id );

        log( 'token was successfully removed' );

      }

    }

  }

  return values;

}
