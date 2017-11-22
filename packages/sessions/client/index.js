"use strict";

const _ = {
  extend: require( 'lodash/extend' ),
  set: require( 'lodash/set' ),
  get: require( 'lodash/get' )
};

const base64 = require( '@openagenda/utils/base64' );

const config = require( '../iso/config' );
const validate = require( '../iso/cookie.validate.js' );

let cookies = require( 'cookies-js' );

module.exports = {
  getUser,
  notifications: {
    getCount: getNotificationCount,
    setCount: setNotificationCount
  },
  messages: {
    setNewFlag: setMessageNewFlag,
    getNewFlag: getMessageNewFlag
  },
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

function getNotificationCount( now = null ) {

  let session = _getWritable() || {};

  if ( now === null ) {

    now = new Date();

  }

  if ( !_.get( session, 'notifications.updatedAt', null ) ) {

    return null;

  }

  if ( session.notifications.updatedAt.getTime() + config.notificationMaxAge < now.getTime() ) {

    return null;

  }

  return session.notifications.count;

}

function setMessageNewFlag( value = true ) {

  let session = _getWritable() || {};

  _.set( session, 'messages.newFlag', !!value );

  _setWritable( session );

}

function getMessageNewFlag( unset = false ) {

  let session = _getWritable() || {};

  const flag = _.get( session, 'messages.newFlag', false );

  if ( !unset ) return flag;

  _.set( session, 'messages.newFlag', false );

  _setWritable( session );

  return flag;

}

function setNotificationCount( count ) {

  let writable = _getWritable() || {};

  writable.notifications = {
    updatedAt: new Date(),
    count
  }

  _setWritable( writable );

}

function flash() {

  let values = _getWritable(),

  flash = values ? values.flash : null;

  _setWritable( _.extend( values, { flash: null } ) );

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

  return _get( config.cookies.session, validate ) || validate.validateUnlogged.defaultValue;

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