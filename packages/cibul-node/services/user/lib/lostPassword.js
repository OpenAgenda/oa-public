"use strict";

var log = require( '@openagenda/logger' )( 'user svc - activation' ),

lib = require( '../../../lib/lib' ),

model = require( '../../model' ),

mails = require( '@openagenda/mails' ),

genUrl = require( '../../genUrl' ),

w = require( 'when' ),

wn = require( 'when/node' ),

userSvc;

function init( svc ) {

  userSvc = svc;

  return module.exports;

}

module.exports = lib.extend( init, {
  verifyToken,
  createAndSend,
  updatePassword
});


function updatePassword( values ) {

  return verifyToken( values )

  .then( _ifIsValid( _loadUserFromToken ) )

  .then( _ifIsValid( _ifUserLoaded( _updatePassword ) ) )

  .then( _ifSuccess( true, _clearToken ) );

}


function createAndSend( values ) {

  log( 'creating and sending lost password token' );

  return _loadActiveUser( values )

  .then( _ifUserLoaded( _createToken ) )

  .then( _ifUserLoaded( _sendToken ) );

}


/**
 * check that token is valid
 */

function verifyToken( values ) {

  return wn.call( model.tokens().getLostPassword, { token: values.token } )

  .then( function( result ) {

    values.valid = !!result;

    values.loadedToken = result;

    if ( !values.valid ) {

      values.message = 'token is not valid';

    }

    return values;

  } );

}


function _sendToken( values ) {

  log( 'sending lost password token %s', JSON.stringify( values ) );

  const link = genUrl.abs( 'resetPassword', { token: values.token.token } );

  log( 'link: %s', link );

  values.link = link;

  return mails( {
    template: 'resetPassword',
    lang: values.user.culture,
    to: values.user.email,
    data: {
      resetLink: link
    }
  } )
    .then( () => {
      values.sent = true;

      return values;
    } );

}


function _createToken( values ) {

  return wn.call( model.tokens().getLostPassword, { userId: values.user.id, email: values.user.email }, true )

  .then( function( token ) {

    log( 'token retrieved: %s', JSON.stringify( token ) );

    values.token = token;

    return values;

  });

}


function _clearToken( values ) {

  return wn.call( model.tokens().removeLostPassword, { token: values.token } )

  .then( function( removeOk ) {

    if ( removeOk ) log( 'token was successfully removed' );

    return values;

  });

}


function _loadUserFromToken( values ) {

  return wn.call( model.users().get, { id: values.loadedToken.userId } )

  .then( function( result ) {

    if ( !result ) {

      values.message = 'user was not found';

    } else if ( !result.isActivated ) {

      values.message = 'user is not activated';

    } else {

      values.user = result;

    }

    return values;

  });

}

function _ifSuccess( success, func ) {

  return function( values ) {

    if ( !!values.success == success ) return func( values );

    return values;

  }

}


function _updatePassword( values ) {

  if ( !values.user ) return values;

  if ( values.password !== values.repeat ) {

    values.message = 'Passwords must match.';

    return values;

  } else if ( !values.password.length ) {

    values.message = 'Field cannot be empty.';

    return values;

  }

  return w.promise( function( resolve, reject) {

    model.users().update( { id: values.user.id }, { password: values.password }, function( err, result ) {

      if ( err ) return reject( 'the password could not be modified' );

      values.success = true;

      resolve( values );

    });

  });


}


function _loadActiveUser( values ) {

  var user = values.user ? values.user : { email: values.email };

  if ( user.id && user.email && user.isActivated ) {

    log( 'user is already loaded: %s', JSON.stringify( user ) );

    return w( values );

  } else {

    log( 'loading user based on values %s', JSON.stringify( user ) );

    return wn.call( model.users().get, user )

    .then( function( result ) {

      log( 'loaded user %s', JSON.stringify( result ) );

      if ( !result ) {

        values.message = 'No account matching this email was found';

      } else if ( !result.isActivated ) {

        values.message = 'The account matching this email is not yet activated';

      } else {

        values.user = result;

      }

      return values;

    } );

  }

}


function _ifIsValid( func ) {

  return function( values ) {

    if ( values.valid ) return func( values );

    return values;

  }

}


function _ifUserLoaded( func ) {

  return function( values ) {

    if ( values.user ) return func( values );

    return values;

  }

}
