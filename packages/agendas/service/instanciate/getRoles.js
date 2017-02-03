"use strict";

const _ = require( 'lodash' );

module.exports = function( cb ) {

  const get = _getRoles.bind( this, cb );

  if ( this.data.credentials ) {

    return get();

  }

  this._loadInternals( err => {

    if ( err ) return cb( err );

    get();

  } );

}

function _getRoles( cb ) {

  const existingRoles = this._getExistingRoles();

  let roles = [ 1, 2 ]; // contributor and administrators are given

  if ( this.data.credentials.moderators ) {

    roles.push( 3 ); // moderator

  }

  if ( this.data.private ) {

    roles.push( 4 ); // reader

  }

  cb( null, existingRoles.filter( r => _.includes( roles, r.value ) ) );

}