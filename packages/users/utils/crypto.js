"use strict";

const crypto = require( 'crypto' );

module.exports = {
  randomHash,
  hashPassword,
  verifyPassword
};


function randomHash( length ) {

  if ( typeof length === 'undefined' ) length = 32;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  let salt = '';

  for ( let i = 0; i < length; i++ ) {
    salt += chars[ Math.floor( Math.random() * chars.length ) ];
  }

  return salt;

}

function hashPassword( password, salt ) {

  return crypto.createHash( 'sha1' ).update( salt + password ).digest( 'hex' );

}

function verifyPassword( hashedPassword, password, salt ) {

  return hashedPassword === crypto.createHash( 'sha1' ).update( salt + password, 'utf-8' ).digest( 'hex' );

}