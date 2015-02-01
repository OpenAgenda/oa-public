"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

Cookies = require( '../../js/vendors/Cookies-master/src/cookies.js' ),

Base64 = require( '../../js/lib/Base64/Base64.mod.js' );

module.exports = function( eh, options ) {

  // add event support you mofo.

  var params = cn.extend({
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
    events: { fetch: 'getsessiondata', clear: false }
  }, params),

  url,

  stack = [], windowStack = [],

  isReady = false,

  sessionData,

  run = function() {

    if ( window.env ) params.env = window.env;

    url = _defineUrl();

    if ( !_hasStorage() || _flaggedCookie() || !_hasSessionData() || params.debug || _contradictingCookie()) {

      _fetch(function( data ) {

        _setSessionData( data );

        isReady = true;

        _processStack();
        
      });

    } else {
      isReady = true;
    }

    return _handleFetchRequest;

  },
  
  _handleFetchRequest = function( cb ) {

    if ( !isReady ) {

      return stack.push( cb );

    }

    cb( _getSessionData() );

  },

  _defineUrl = function() {

    var env = window.env ? window.env : 'all',

    url = params.url[ env ];

    if ( typeof url !== 'string' ) {

      url = url[ window.location.href.indexOf( 'logged=' ) == -1 ? 'unlogged' : 'logged' ];

    }

    return url;

  },

  _processStack = function() {

    var data = _getSessionData();

    cn.forEach( stack, function( cb ) {

      cb( data );

    });

    stack = undefined;

  },

  _hasSessionData = function() {

    if ( window.env == 'tpl' ) {

      return false;

    }

    return (null !== localStorage.getItem(params.local));

  },

  _getSessionData = function() {

    if ( !sessionData ) {

      sessionData = JSON.parse( localStorage.getItem( params.local ) );

    }

    return sessionData;

  },

  _setSessionData = function(data) {

    sessionData = null;

    return localStorage.setItem( params.local, JSON.stringify(data) );

  },

  _getCookieValue = function(name, defaultValue) {

    if (typeof defaultValue == 'undefined') defaultValue = false;

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse(Base64.decode(Cookies.get(params.cookie)));

    return (typeof values[name] == 'undefined')?defaultValue:values[name];
  },

  _setCookieValue = function(name, value) {

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse(Base64.decode(Cookies.get(params.cookie)));

    values[name] = value;

    Cookies.set(params.cookie, Base64.encode(JSON.stringify(values)));

  },

  _flaggedCookie = function() {

    var flagged;

    try {
      flagged = _getCookieValue(params.cookieFlag);
    } catch (e) {
      return false;
    }

    _setCookieValue(params.cookieFlag, false);

    return flagged;

  },

  _contradictingCookie = function() {

    var cookieValue;

    try {
      cookieValue = _getCookieValue( 'logged' );
    } catch (e) {
      return false;
    }

    var logged = _getSessionData().logged;

    if (logged !== cookieValue) return true;

    return false;

  },

  _fetch = function( cb ) {

    remote.get( url, {}, function( responseType, data ){

      if ( responseType == 'success' ) cb( data );

    }, true );

  },

  _hasStorage = function() {

    var mod='yeepeekayyay';
    
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch(e) {
      return false;
    }
    
  };

  return run();

};