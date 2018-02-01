"use strict";

const _ = require( 'lodash' );

const base64 = require( '@openagenda/utils/base64' );

const config = require( '../../iso/config' );
const validate = require( '../../iso/cookie.validate.js' );

let cookies = require( 'cookies-js' );

module.exports = {
  getUser,
  notifications: {
    getCount: getNotificationCount,
    setCount: setNotificationCount
  },
  inbox: {
    getSummary: getInboxSummary,
    setSummary: setInboxSummary
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


function getInboxSummary() {

  return _.get( _getWritable(), 'inbox' );

}

function setInboxSummary( update ) {

  let session = _getWritable() || {};

  session.inbox = update;

  _setWritable( session );

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

  return _get( config.cookies.writable, validate.writable, true );

}


function _get( name, validate, useDefault = false ) {

  let cookieValue = cookies.get( name ), clean;

  if ( !cookieValue ) return useDefault ? validate.default : null;

  try {

    clean = validate( JSON.parse( base64.decode( cookieValue ) ) );

  } catch( e ) {

    return useDefault ? validate.default : null;

  }

  return clean;

}