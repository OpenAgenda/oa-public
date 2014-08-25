var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

Cookies = require('../../js/vendors/Cookies-master/src/cookies.js'),

Base64 = require('../../js/lib/Base64/Base64.mod.js');

module.exports = function( eh, options ) {

  // add event support you mofo.

  var params = cn.extend({
    url: '/session',
    debug: false,
    cookie: 'cibul_session',
    cookieFlag: 'refresh',
    cookieLogged: 'logged',
    local: 'cibul_session',
    onLoaded: false,
    events: { fetch: 'getsessiondata', clear: false }
  }, params),

  stack = [],

  isReady = false,

  run = function() {

    if ( window.env == 'dev' ) params.debug = true;

    if ( params.debug ) params.url = '//d.cibul.net/frontend_dev.php/session';

    if (!_hasStorage() || _flaggedCookie() || !_hasSessionData() || params.debug || _contradictingCookie()) {

      _fetch(function(data) {
        _setSessionData(data);
        isReady = true;
        _processStack();
      });

    } else {
      isReady = true;
    }

    var cbId = eh.on(params.events.fetch, _handleFetchRequest);

    if (params.events.clear) var cbIdOnClear = eh.on(params.events.clear, function() {

      eh.cancel( cbId );

      eh.cancel( cbIdOnClear );

      stack = [];

    });

  },
  
  _handleFetchRequest = function(callback) {

    if (!isReady) return stack.push(callback);

    callback(_getSessionData());

  },

  _processStack = function() {

    var data = _getSessionData();

    cn.forEach(stack, function(callback) {
      callback(data);
    });

    stack = undefined;

  },

  _hasSessionData = function() {

    return (null !== localStorage.getItem(params.local));

  },

  _getSessionData = function() {

    return JSON.parse(localStorage.getItem(params.local));

  },

  _setSessionData = function(data) {

    return localStorage.setItem(params.local, JSON.stringify(data));

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

  _fetch = function( callback ) {

    var qParams = params.debug ? {format: 'jsonp', force: ''} : {};

    remote.get(params.url, { data: qParams }, function(responseType, data){
      if (responseType=='success') callback(data);
    }, params.debug ? false : true );

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

  run();

};