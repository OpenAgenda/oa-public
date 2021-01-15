var handleSession = function(params) {

  // add event support you mofo.

  params = extend({
    url: false, // required - where to get the data
    debug: false,
    cookie: 'cibul',
    cookieFlag: 'refresh',
    cookieLogged: 'logged',
    local: 'cibul',
    onLoaded: false,
    events: { fetch: 'getsessiondata', clear: false }
  }, params);

  var stack = [],

  isReady = false,

  eh = sEventHandler.getInstance(),

  run = function() {

    if ( !_hasStorage() || _flaggedCookie() || !_hasSessionData() || params.debug || _contradictingCookie() ) {

      _fetch( function(data) {

        _setSessionData( data );
        isReady = true;
        _processStack();

      } );

    } else {

      isReady = true;

    }

    var cbId = eh.on(params.events.fetch, _handleFetchRequest);

    if ( params.events.clear ) var cbIdOnClear = eh.on(params.events.clear, function() {

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

    forEach(stack, function(callback) {
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

    try {
      var flagged = _getCookieValue(params.cookieFlag);
    } catch (e) {
      return false;
    }

    _setCookieValue(params.cookieFlag, false);

    return flagged;

  },

  _contradictingCookie = function() {

    try {
      var cookieValue = _getCookieValue( params.cookieLogged );
    } catch (e) {
      return false;
    }

    var logged = _getSessionData().logged;

    if (logged !== cookieValue) return true;

    return false;

  },

  _fetch = function(callback) {

    var qParams = params.debug?{format: 'jsonp', force: ''}:{};

    remote.get(params.url, {data: qParams}, function(responseType, data){
      if (responseType=='success') callback(data);
    }, params.debug?false:true);

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