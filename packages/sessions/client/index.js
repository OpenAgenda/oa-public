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

  return _getSession().user || null;

}


function isLogged() {

  return !!getUser();

}

function flash() {

  let values = _getWritable(),

  flash = values ? values.flash : null;

  _setWritable( extend( values, { flash: null } ) );

  return flash;

}

function _setWritable( update ) {

  let clean;

  try {

    clean = validate.writable( update );

  } catch ( e ) {

    clean = {}

  }

  cookies.set( config.cookies.writable, base64.encode( JSON.stringify( clean ) ) );

}

function _getSession() {

  return _get( config.cookies.session, validate ) || validate.validateUnlogged.default;

}

function _getWritable() {

  return _get( config.cookies.writable, validate.writable );

}


function _get( name, validate ) {

  let cookieValue = cookies.get( name ), clean;

  if ( !cookieValue ) return null;

  try {

    clean = validate( JSON.parse( base64.decode( cookieValue ) ) );

  } catch( e ) {

    return null;

  }

  return clean;

}