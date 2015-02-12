"use strict";

var log = require( '../../../lib/logger' )( 'user svc - activation' ),

lib = require( '../../../lib/lib' ),

config = require( '../../../config' ),

mailer = require( '../../mailer/mailer' ),

model = require( 'cibulModel' )( config.db ),

w = require( 'when' ),

wn = require( 'when/node' ),

userSvc;

function init( svc ) {

  userSvc = svc;

  return module.exports;

}

module.exports = lib.extend( init, {
  verify: verify,
  createAndSend: createAndSend,
  activateByToken: activateByToken,
  activate: activate
} );


function createAndSend( values ) {

  log( 'creating and sending activation token' );

  return w.promise( function( resolve, reject ) {

    _loadInactiveUser( values )

    .then( _createToken )

    .then( _sendToken )

    .done( function( values ) {

      log( 'info', 'token created and sent at %s - activation link: "%s"', values.user.email, values.link );

      resolve( values );

    }, function( err ) {

      log( 'error', 'createAndSend failed: %s', err );

      reject( err );

    });

  });

}



/**
 * get user from activate token,
 * activate user,
 * delete token,
 * give user as successful result
 */

function activateByToken( token, options, cb ) {

  if ( !cb ) {

    cb = options;

    options = {};

  }

  model.tokens().getActivation( { token: token }, function( err, tokenObj ) {

    if ( err ) return cb( err );

    if ( !tokenObj ) {

      log( 'info', 'token could not be found: %s', token );

      return cb( null, false );

    }

    model.users().get( { id: tokenObj.userId }, function( err, user ) {

      if ( err ) return cb( err );

      if ( !user ) {

        log( 'info', 'user could not be found for token: %s', token );

        return cb( null, false );

      }

      options.tokenObj = tokenObj;

      activate( user, options, cb );

    } );

  });

}


function activate( user, options, cb ) {

  if ( !cb ) {

    cb = options;

    options = {}

  };

  if ( user.isActivated ) {

    log( 'info', 'user was already activated: %s', token );

    if ( !options.tokenObj ) return cb( null, user );

    model.tokens().removeActivation( options.tokenObj, function( err ) {

      if ( err ) return cb( err );

      cb( null, user );

    } );

  } else {

    model.users().update( user, { isActivated: true }, function( err ) {

      if ( err ) return cb( err );

      user.isActivated = true;

      if ( !options.tokenObj ) {

        userSvc.onActivation( lib.extend( { user: user }, options ) ).then( function() {

          cb( null, user );

        }, cb );

      } else {

        model.tokens().removeActivation( options.tokenObj, function( err ) {

          if ( err ) return cb( err );

          userSvc.onActivation( lib.extend( { user: user }, options ) ).then( function() {

            cb( null, user );

          }, cb );

        });

      }

    });

  }

} 


/**
 * verify that account is activated
 */

function verify( values ) {

  if ( !values.user ) return values;

  if ( values.user.isActivated ) return values;

  // user is not activated
  
  values.inactive = true;

  if ( !values.errors ) values.errors = {}

  values.errors.message = 'The account matching this email is not activated';

  return values;

} 



function _loadInactiveUser( values ) {

  var user = values.user ? values.user : { email: values.email };

  if ( user.id && user.email && ( user.isActivated === false ) ) {

    log( 'user is already loaded: %s', JSON.stringify( user ) );

    return w( values );

  } else {

    log( 'loading user based on values %s', JSON.stringify( user ) );

    return w.promise( function( resolve, reject ) {

      model.users().get( user, function( err, result ) {

        log( 'loaded user %s', JSON.stringify( result ) );

        if ( err ) return reject( err );

        if ( !result ) return reject( 'no account was found' );

        if ( result.isActivated ) return reject( 'the account is already activated' );

        values.user = result;

        resolve( values );

      } );

    });

  }

}


function _createToken( values ) {

  return w.promise( function( resolve, reject ) {

    log( 'creating/fetching token with values %s', JSON.stringify( values ) );

    model.tokens().getActivation( { userId: values.user.id, email: values.user.email }, true, function( err, token ) {

      log( 'token retrieved: %s', JSON.stringify( token ) );

      if ( err ) return reject( err );

      values.token = token.token;

      resolve( values );

    } );

  } );

}

function _sendToken( values ) {

  log( 'sending activation token %s', JSON.stringify( values ) );

  var linkParams = { token: values.token };

  if ( values.iToken ) linkParams.iToken = values.iToken;

  if ( values.redirect ) linkParams.redirect = values.redirect;

  var link = mailer.genUrl( 'activate', linkParams ),

  text = "Congratulations!, You just created your Cibul account. Click on the following link to activate it \n %link%";

  values.link = link;

  return wn.call( mailer.queueMail, {
    recipient: values.user.email,
    subject: 'Activate your Cibul Account',
    text: [ text, { '%link%' : link } ],
    lang: values.user.culture
  } ).then( function( result ) {

    return values;

  } );

}