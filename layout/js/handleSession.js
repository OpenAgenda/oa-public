"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

Cookies = require( '../../js/vendors/Cookies-master/src/cookies.js' ),

Base64 = require( '../../js/lib/Base64/Base64.mod.js' ),

debug = require( 'debug' ), log,

store = require( 'store' ),

defaults = {
  url: {
    prod: '/session',
    dev: '/frontend_dev.php/session',
    test: '/frontend_test.php/session',
    tpl: {
      logged: '/server/testdata/opensession.json',
      unlogged: '/server/testdata/closedsession.json'
    }
  },
  env: false,
  cookie: 'cibul',
  cookieFlag: 'refresh',
  cookieLogged: 'logged',
  local: 'cibul',
  onLoaded: false,
  events: { fetch: 'getsessiondata', clear: false },
  lifetime: 60*60*1000
};

module.exports = function( eh, options ) {

  var params = cn.extend( {}, defaults, options ), url,

  stack = [], windowStack = [],

  isReady = false,

  sessionData;

  if ( window.env ) params.env = window.env;

  if ( cn.contains( [ 'dev', 'tpl' ], params.env ) ) debug.enable( '*' );

  log = debug( 'handleSession' );

  url = _defineUrl();

  if ( _flaggedCookie() || !_hasSessionData() || _contradictingCookie()) {

    _fetch( url, function( data ) {

      log( 'fetched session data, setting in local storage' );

      _setSessionData( data );

      isReady = true;

      _processStack();
      
    });

  } else {

    log( 'local storage is valid and can be used' );

    isReady = true;

  }

  return function( cb ) {

    if ( !isReady ) {

      return stack.push( cb );

    }

    cb( _getSessionData() );

  }

  function _defineUrl() {

    var env = window.env ? window.env : 'prod',

    url = params.url[ env ];

    if ( typeof url !== 'string' ) {

      url = url[ window.location.href.indexOf( 'logged=' ) == -1 ? 'unlogged' : 'logged' ];

    }

    return url;

  }

  function _processStack() {

    var data = _getSessionData();

    cn.forEach( stack, function( cb ) {

      cb( data );

    });

    stack = undefined;

  }

  function _hasSessionData() {

    var data = _getSessionData( true ),

    now = new Date().getTime();

    if ( window.env == 'tpl' ) {

      return false;

    }

    if ( !data ) {

      log( 'has no session data' );

      return false;

    }

    if ( !data.timestamp ) {

      log( 'timestamp is not set' );

      return false;

    }

    if ( data.timestamp + params.lifetime < now ) {

      log( 'localStorage is too old' );

      return false;

    }

    log( 'has valid local storage - expires in %s', ( ( params.lifetime - ( now - data.timestamp ) ) / 1000 ) + 's'  );

    return true;

  }

  function _getSessionData( force ) {

    if ( !sessionData || force ) {

      log( 'parsing session data from local storage' );

      try {

        sessionData = JSON.parse( store.get( params.local ) );
        
      } catch( e ) {

        return false;

      }


    }

    return sessionData;

  }


  function _setSessionData( data ) {

    var result;

    log( 'setting session data in local storage' );

    sessionData = null;

    data.timestamp = new Date().getTime();

    result = store.set( params.local, JSON.stringify( data ) );

    return result;

  }

  
  function _getCookieValue( name, defaultValue ) {

    if (typeof defaultValue == 'undefined') defaultValue = false;

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse( Base64.decode(Cookies.get(params.cookie)) );

    return (typeof values[name] == 'undefined')?defaultValue:values[name];
  }

  
  function _setCookieValue( name, value ) {

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse(Base64.decode(Cookies.get(params.cookie)));

    values[name] = value;

    Cookies.set(params.cookie, Base64.encode(JSON.stringify(values)));

  }

  
  function _flaggedCookie() {

    var flagged;

    try {

      flagged = _getCookieValue(params.cookieFlag);

    } catch (e) {

      log( 'could not read cookie' );

      return false;

    }

    log( 'cookie is %s', flagged ? 'flagged' : 'not flagged' );

    _setCookieValue(params.cookieFlag, false);

    return flagged;

  }


  function _contradictingCookie() {

    var cookieValue;

    try {

      cookieValue = _getCookieValue( 'logged' );

    } catch (e) {

      log( 'could not retrieved logged cookie value' );

      return false;

    }

    var logged = _getSessionData().logged;

    if (logged !== cookieValue) {

      log( 'logged cookie value is different from local storage' );

      return true;

    }

    log( 'logged cookie matches local storage state' );

    return false;

  }

}


function _fetch( url, cb ) {

  log( 'fetching %s', url );

  remote.get( url, {}, function( responseType, data ){

    if ( responseType == 'success' ) cb( data );

  }, true );

}