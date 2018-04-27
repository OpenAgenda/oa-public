"use strict";

const w = require( 'when' );
const get = require( '../get' );

module.exports = function _checkEmailTaken( v ) {

  if ( v.query.email ) {

    return _emailAlreadyTaken( v.query.email )

      .then( emailTaken => {

        if ( emailTaken ) {

          v.errors.push( {
            field: 'email',
            code: 'email.alreadytaken',
            message: 'this email is not available',
            origin: v.query.email
          } );

        }

        return v;

      } );

  }

  return v;

};

function _emailAlreadyTaken( email ) {

  var d = w.defer();

  get( { email }, ( err, user ) => {

    if ( err ) return d.reject( err );

    if ( user ) return d.resolve( true );

    return d.resolve( false );

  } );

  return d.promise;

};
