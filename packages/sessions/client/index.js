"use strict";

const config = require( '../iso/config' ),

  validate = require( '../iso/cookie.validate.js' ),

  base64 = require( 'utils/base64' ),

  extend = require( 'lodash/extend' );

let cookies = require( 'cookies-js' );

module.exports = {
  getUser,
  isLogged,
  flash,
  test: {
    loadCookiesLib: c => cookies = c
  }
}


function getUser() {

  return _get().user || null;

}


function isLogged() {

  return !!_get().user;

}

function flash() {

  let values = _get(),

  flash = values.flash;

  _set( extend( values, { flash: null } ) );

  return flash;

}

function _set( update ) {

  let clean;

  try {

    clean = validate( update );

  } catch ( e ) {

    clean = validate.validateUnlogged.default;

  }

  cookies.set( config.cookie, base64.encode( JSON.stringify( clean ) ) );

}

function _get() {

  let cookieValue = cookies.get( config.cookie ),

  clean;

  if ( !cookieValue ) {

    return validate.validateUnlogged.default;

  }

  try {

    clean = validate( JSON.parse( base64.decode( cookieValue ) ) );

  } catch ( e ) {

    return validate.validateUnlogged.default;

  }

  return clean;

}