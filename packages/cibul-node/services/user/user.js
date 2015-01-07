"use strict";

var log = require( '../../lib/logger' )( 'user service' ),

lib = require( '../../lib/lib' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db );

module.exports = {
  auth: {
    email: authenticate
  }
}

function authenticate( email, password, cb ) {

  async.waterfall([
    
    _findUserByEmail,
    _verifyActivation,
    _verifyUserPassword,
    
    function( user ) {

      cb( null, user );

    }
  ]);

  return;

  function _findUserByEmail( wcb ) {

    model.users().get( { email: email }, function( err, user ) {

      if ( err ) return cb( err );

      if ( !user ) {

        cb( null, false, { 
          errors: { 
            email: 'This email does not match any known account' 
          } 
        } );

      } else {

        wcb( null, user );

      }

    });

  }

  function _verifyActivation( user, wcb ) {

    if ( !user.isActivated ) {

      cb( null, false, { 
        errors: {
          global: 'The account matching this email is not activated'
        } 
      });

    } else {

      wcb( null, user );

    }

  }

  function _verifyUserPassword( user, wcb ) {

    model.users().validateEmailAndPassword( email, password, function( err, ok ) {

      if( !ok ) {

        cb( null, false, { errors: { password: 'This password is incorrect' } });

      } else {

        wcb( null, user );

      }

    });  

  }

}