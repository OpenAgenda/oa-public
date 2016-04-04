"use strict";

var model = require( '../model' ),

config = require( '../../config' );

module.exports = {
  getMailIdentifier: getMailIdentifier,
  loadUserFromMailIdentifier: loadUserFromMailIdentifier
}

function getMailIdentifier( invitation, cb ) {

  if ( !invitation.creatorId ) {

    return cb( null, 'no-reply@openagenda.com' );

  }

  model.users().get( { id: invitation.creatorId }, ( err, u ) => {

    if ( err ) return cb( err );

    cb( null, [ invitation.token, u.uid, 'invitation' ].join( '.' ) + '@' + config.mailerDomain );

  } );

}

function loadUserFromMailIdentifier( identifier, cb ) {

  if ( typeof identifier !== 'string' ) {

    return cb( 'wrong identifier type' );

  }

  let parts = identifier.split( '@' )[ 0 ].split( '.' );

  if ( parts.length !== 3 ) {

    return cb( 'wrong identifier format' );

  }

  model.users().get( { uid: parts[ 1 ] }, cb );

}