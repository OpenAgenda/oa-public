/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var App = __webpack_require__(1),
	    deepExtend = __webpack_require__(36),
	    params = {
	  lang: 'fr',
	  selectors: {
	    canvas: '.js_canvas'
	  },
	  prefix: '/settings' // IMPORTANT url for prefix redux router
	};

	window.hook(function (options) {

	  deepExtend(params, options);

	  App({
	    canvas: params.selectors.canvas,
	    prefix: params.prefix
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(2);

	var ReactDom = __webpack_require__(3);

	var du = __webpack_require__(4);

	var utils = __webpack_require__(5);

	var _require = __webpack_require__(6);

	var Provider = _require.Provider;

	var _require2 = __webpack_require__(7);

	var syncHistoryWithStore = _require2.syncHistoryWithStore;

	var _require3 = __webpack_require__(8);

	var Router = _require3.Router;
	var useRouterHistory = _require3.useRouterHistory;

	var _require4 = __webpack_require__(9);

	var createHistory = _require4.createHistory;

	var routes = __webpack_require__(10);

	var createStore = __webpack_require__(25);

	var actions = __webpack_require__(18);

	var DevTools = __webpack_require__(29);

	var App = __webpack_require__(11);

	var SettingsContainer = __webpack_require__(14);

	__webpack_require__(35);

	module.exports = function (options) {

	  var params = utils.extend({
	    canvas: '.js_canvas',
	    prefix: '',
	    urls: {
	      getMe: '/getMe',
	      updateProfile: '/updateProfile',
	      changeEmail: '/changeEmail',
	      changePassword: '/changePassword'
	    }
	  }, options);

	  var browserHistory = useRouterHistory(createHistory)({ basename: params.prefix }),
	      store = createStore(browserHistory),
	      history = syncHistoryWithStore(browserHistory, store);

	  store.dispatch(actions.setAppSettings(params));

	  ReactDom.render(React.createElement(
	    Provider,
	    { store: store, key: 'provider' },
	    React.createElement(
	      'div',
	      null,
	      React.createElement(
	        Router,
	        { history: history },
	        routes(store)
	      ),
	      !window.devToolsExtension && window.env == 'dev' ? React.createElement(DevTools, null) : null
	    )
	  ), du.el(params.canvas));
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/ReactDOM\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__( !(function webpackMissingModule() { var e = new Error("Cannot find module \"utils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) );

	module.exports = {
	  el: el,
	  els: els,
	  addEvent: addEvent,     // add an event to an element 
	  removeEvent: removeEvent,
	  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
	  asapReady: asapReady, // executes cb as soon as elem targetted by elem ( or body by default ) exists.
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  forEach: forEach,
	  childObject: childObject,
	  preventDefault: preventDefault,
	  isElement: isElement,
	  nl2br: nl2br,
	  getScrollOffsets: getScrollOffsets,
	  windowInnerHeight: windowInnerHeight,
	  parseJsonAttribute: parseJsonAttribute
	}

	function isElement( o ) {

	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
	  );

	}

	function preventDefault( event ) {

	  event.preventDefault ? event.preventDefault() : event.returnValue = false;

	};

	function childObject( elem, index ) {

	  var i = 0, realI = 0;

	  while ( elem.childNodes[ i ] ) {

	    if ( elem.childNodes[ i ].nodeType == 1 ) {

	      if ( realI == index ) return elem.childNodes[ i ];

	      realI++;
	    }

	    i++;

	  }

	  return false;

	}


	function hasClass( element, cls ) {

	  return ( ' ' + element.className + ' ').indexOf( ' ' + cls + ' ' ) > -1;

	}

	function addClass( element, className ) {

	  if ( !hasClass( element, className ) ) element.className = element.className + ' ' + className;

	}

	function removeClass( element, cls ) {

	  if ( hasClass( element, cls ) ) {

	    var regex = new RegExp( cls, 'g' );

	    element.className = element.className.replace( regex, '' );

	  }

	}


	function els( node, selector ) {

	  if ( typeof node == 'string' ) {

	    selector = node;
	    node = document;

	  }

	  var prefix = selector.substr( 0, 1 );

	  if ( '.#,'.indexOf( prefix ) !== -1 ) {

	    selector = selector.substr( 1 );

	  }

	  if ( prefix == '.' ) {

	    return getElementsByClassName( node, selector );

	  } else if ( prefix == '#' ) {

	    var result = node.getElementById( selector );

	    if ( result ) {

	      return [ result ];

	    } else {

	      return [];

	    }

	  } else {

	    return node.getElementsByTagName( selector );

	  }

	};

	function el( node, selector ) {

	  var results = els( node, selector );

	  return results.length ? results[ 0 ] : null;

	}


	function whenReady( cb ) {

	  if ( document.readyState === 'complete' ) {

	    cb();

	  } else {

	    addEvent( window, 'load', cb );

	  }

	}

	function asapReady( selector, timeout, cb ) {

	  if ( arguments.length == 1 ) {

	    cb = selector;

	    timeout = 0;

	    selector = 'body'

	  } else if ( arguments.length == 2 ) {

	    cb = timeout;

	    timeout = 0;

	  }

	  if ( el( selector ) ) return cb();

	  setTimeout( function() {

	    asapReady( selector, Math.min( ( timeout + 10 ) * 2, 10000 ), cb );

	  }, timeout );

	}


	/**
	 * cross browser add event
	 */

	function addEvent( elem, types, eventHandle ) {

	  if ( elem == null || elem == undefined ) return;

	  if ( typeof types == 'string' ) types = [ types ];

	  forEach( types, function( type ) {

	    if ( elem.addEventListener ) {

	      elem.addEventListener( type, eventHandle, false );

	    } else if ( elem.attachEvent ) {

	      elem.attachEvent( 'on' + type, eventHandle );

	    } else {

	      elem[ 'on' + type ] = eventHandle;

	    }

	  } );

	}


	function removeEvent( elem, types, eventHandle ) {

	  if ( elem === null || elem === undefined ) return;

	  if ( typeof types == 'string' ) types = [ types ];

	  forEach( types, function( type ) {

	    if ( elem.removeEventListener ) {

	      elem.removeEventListener( type, eventHandle, false );

	    } else if ( elem.detachEvent ) {

	      elem.detachEvent( 'on' + type, eventHandle );

	    } else {

	      elem[ "on" + type ] = null;

	    }

	  } );

	};


	function forEach( array, action ) {

	  for ( var i = 0; i < array.length; i++ ) {

	    action( array[ i ] );

	  }

	}

	function getElementsByClassName( node, className ) {

	  if ( typeof node == 'string' ) {

	    className = node;
	    node = document;

	  }

	  var a = [],

	    re = new RegExp( '(^| )' + className + '( |$)' ),

	    els = node.getElementsByTagName( '*' );

	  for ( var i = 0, j = els.length; i < j; i++ ) {

	    if ( re.test( els[ i ].className ) ) {

	      a.push( els[ i ] );

	    }

	  }

	  return a;

	}


	function nl2br( str, is_xhtml ) {

	  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

	  return (str + '').replace( /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2' );

	}


	function windowInnerHeight( w, d ) {

	  if ( !w ) {
	    w = window;
	    d = document;
	  }

	  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName( 'body' )[ 0 ].clientHeight;

	}

	function getScrollOffsets( w ) {

	  // Use the specified window or the current window if no argument 
	  w = w || window;

	  // This works for all browsers except IE versions 8 and before
	  if ( typeof w.pageXOffset !== 'undefined' ) return {
	    x: w.pageXOffset,
	    y: w.pageYOffset
	  };

	  // For IE (or any browser) in Standards mode
	  var d = w.document;
	  if ( document.compatMode == "CSS1Compat" ) {
	    return {
	      x: d.documentElement.scrollLeft,
	      y: d.documentElement.scrollTop
	    };
	  }

	  // For browsers in Quirks mode
	  return {
	    x: d.body.scrollLeft,
	    y: d.body.scrollTop
	  };

	}

	function parseJsonAttribute( selector, tagName, defaultValue ) {

	  var data = defaultValue || {};

	  try {

	    data = utils.extend({}, data, JSON.parse( el( selector ).getAttribute( tagName ) ) );

	  } catch ( e ) {
	  }

	  return data;

	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  extend: extend,
	  filterByAttr: filterByAttr,
	  isArray: isArray,
	  size: size,
	  fZ: fZ,
	  unique: unique,
	  forEach: forEach, // for some older browsers
	  toCamelCase: toCamelCase,
	  toUnderscore: toUnderscore,
	  escape: escape,
	  truncate: truncate,
	  capitalize: capitalize,
	  uncapitalize: uncapitalize
	};


	function uncapitalize( str ) {

	  str = String(str);

	  if ( !str.length ) return '';

	  return str[ 0 ].toLowerCase() + str.substr( 1, str.length );

	}

	function capitalize( str ) {

	  str = String(str);

	  if ( !str.length ) return '';

	  return str[ 0 ].toUpperCase() + str.substr( 1, str.length );

	};


	function truncate( str, len, append ) {

	  str = String( str );

	  if ( str.length > len ) {

	    str = str.slice( 0, len );

	    if ( append ) str += append;

	  }

	  return str;
	  
	}

	function escape( str, escapeApostrophe ) {

	  if ( !str ) return str;

	  if ( escapeApostrophe === undefined ) {

	    escapeApostrophe = true;

	  }

	  var escaped = String( str )
	  
	  .replace( /&/g, '&amp;' )
	  
	  .replace( /</g, '&lt;' )
	  
	  .replace( />/g, '&gt;' )
	  
	  .replace( /"/g, '&quot;' );

	  if ( escapeApostrophe ) {

	    escaped = escaped.replace( /'/g, '&#39;' );

	  }

	  return escaped;

	}

	function toCamelCase( input ) {

	  if ( typeof input == 'object' ) {

	    var camelCased = {};

	    for ( var key in input ) {

	      camelCased[ toCamelCase(key) ] = input[ key ];

	    }

	    return camelCased;

	  }

	  return input.replace( /[-_](.)/g, function( match, group1 ) {

	    return group1.toUpperCase();

	  });

	}

	function toUnderscore( input ) {

	  if (typeof input == 'object') {

	    var underscored = {};

	    for (var key in input) {

	      underscored[toUnderscore(key)] = input[key];

	    }

	    return underscored;

	  }

	  return input.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});

	}

	function unique( arr ) {

	  var u = [];

	  arr.forEach( function( a ) {

	    if ( u.indexOf( a ) === -1 ) u.push( a );

	  });

	  return u;

	}


	function isArray( obj ) {

	  return Object.prototype.toString.call( obj ) === '[object Array]';

	}

	function size( obj ) {

	  var size = 0, key;

	  for ( key in obj ) {

	    if ( obj.hasOwnProperty( key ) ) size++;

	  }

	  return size;

	}


	function filterByAttr( obj, arr ) {

	  var newObj = {};

	  forEach( arr, function( name ) {

	    if ( obj[name] !== undefined ) newObj[name] = obj[name];

	  });

	  return newObj;

	};

	function forEach( array, action ) {

	  for ( var i = 0; i < array.length; i++ ) {

	    action( array[i] );

	  }

	};

	function extend() {

	  for ( var i=1; i<arguments.length; i++ ) {

	    for ( var key in arguments[i] ) {

	      if ( arguments[i].hasOwnProperty( key ) ) {

	        arguments[ 0 ][ key ] = arguments[ i ][ key ];

	      }

	    }

	  }
	        
	  return arguments[ 0 ];

	}

	function fZ( n, size ) {

	  if ( !size ) size = 2;

	  var s = n + '',

	  sign = s.substr( 0, 1 ) == '-' ? '-' : '';

	  if ( sign.length ) {

	    s = s.substr( 1 );

	  }

	  while ( s.length < size ) s = '0' + s;

	  return sign + s; 
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.connect = exports.Provider = undefined;

	var _Provider = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./components/Provider\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Provider2 = _interopRequireDefault(_Provider);

	var _connect = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./components/connect\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _connect2 = _interopRequireDefault(_connect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	exports.Provider = _Provider2["default"];
	exports.connect = _connect2["default"];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.routerMiddleware = exports.routerActions = exports.goForward = exports.goBack = exports.go = exports.replace = exports.push = exports.CALL_HISTORY_METHOD = exports.routerReducer = exports.LOCATION_CHANGE = exports.syncHistoryWithStore = undefined;

	var _reducer = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./reducer\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'LOCATION_CHANGE', {
	  enumerable: true,
	  get: function get() {
	    return _reducer.LOCATION_CHANGE;
	  }
	});
	Object.defineProperty(exports, 'routerReducer', {
	  enumerable: true,
	  get: function get() {
	    return _reducer.routerReducer;
	  }
	});

	var _actions = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./actions\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'CALL_HISTORY_METHOD', {
	  enumerable: true,
	  get: function get() {
	    return _actions.CALL_HISTORY_METHOD;
	  }
	});
	Object.defineProperty(exports, 'push', {
	  enumerable: true,
	  get: function get() {
	    return _actions.push;
	  }
	});
	Object.defineProperty(exports, 'replace', {
	  enumerable: true,
	  get: function get() {
	    return _actions.replace;
	  }
	});
	Object.defineProperty(exports, 'go', {
	  enumerable: true,
	  get: function get() {
	    return _actions.go;
	  }
	});
	Object.defineProperty(exports, 'goBack', {
	  enumerable: true,
	  get: function get() {
	    return _actions.goBack;
	  }
	});
	Object.defineProperty(exports, 'goForward', {
	  enumerable: true,
	  get: function get() {
	    return _actions.goForward;
	  }
	});
	Object.defineProperty(exports, 'routerActions', {
	  enumerable: true,
	  get: function get() {
	    return _actions.routerActions;
	  }
	});

	var _sync = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./sync\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _sync2 = _interopRequireDefault(_sync);

	var _middleware = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./middleware\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _middleware2 = _interopRequireDefault(_middleware);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	exports.syncHistoryWithStore = _sync2['default'];
	exports.routerMiddleware = _middleware2['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.createMemoryHistory = exports.hashHistory = exports.browserHistory = exports.applyRouterMiddleware = exports.formatPattern = exports.useRouterHistory = exports.match = exports.routerShape = exports.locationShape = exports.PropTypes = exports.RoutingContext = exports.RouterContext = exports.createRoutes = exports.useRoutes = exports.RouteContext = exports.Lifecycle = exports.History = exports.Route = exports.Redirect = exports.IndexRoute = exports.IndexRedirect = exports.withRouter = exports.IndexLink = exports.Link = exports.Router = undefined;

	var _RouteUtils = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./RouteUtils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'createRoutes', {
	  enumerable: true,
	  get: function get() {
	    return _RouteUtils.createRoutes;
	  }
	});

	var _PropTypes2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./PropTypes\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'locationShape', {
	  enumerable: true,
	  get: function get() {
	    return _PropTypes2.locationShape;
	  }
	});
	Object.defineProperty(exports, 'routerShape', {
	  enumerable: true,
	  get: function get() {
	    return _PropTypes2.routerShape;
	  }
	});

	var _PatternUtils = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./PatternUtils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'formatPattern', {
	  enumerable: true,
	  get: function get() {
	    return _PatternUtils.formatPattern;
	  }
	});

	var _Router2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Router\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Router3 = _interopRequireDefault(_Router2);

	var _Link2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Link\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Link3 = _interopRequireDefault(_Link2);

	var _IndexLink2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./IndexLink\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _IndexLink3 = _interopRequireDefault(_IndexLink2);

	var _withRouter2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./withRouter\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _withRouter3 = _interopRequireDefault(_withRouter2);

	var _IndexRedirect2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./IndexRedirect\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _IndexRedirect3 = _interopRequireDefault(_IndexRedirect2);

	var _IndexRoute2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./IndexRoute\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _IndexRoute3 = _interopRequireDefault(_IndexRoute2);

	var _Redirect2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Redirect\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Redirect3 = _interopRequireDefault(_Redirect2);

	var _Route2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Route\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Route3 = _interopRequireDefault(_Route2);

	var _History2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./History\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _History3 = _interopRequireDefault(_History2);

	var _Lifecycle2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Lifecycle\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Lifecycle3 = _interopRequireDefault(_Lifecycle2);

	var _RouteContext2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./RouteContext\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _RouteContext3 = _interopRequireDefault(_RouteContext2);

	var _useRoutes2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./useRoutes\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _useRoutes3 = _interopRequireDefault(_useRoutes2);

	var _RouterContext2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./RouterContext\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _RouterContext3 = _interopRequireDefault(_RouterContext2);

	var _RoutingContext2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./RoutingContext\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _RoutingContext3 = _interopRequireDefault(_RoutingContext2);

	var _PropTypes3 = _interopRequireDefault(_PropTypes2);

	var _match2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./match\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _match3 = _interopRequireDefault(_match2);

	var _useRouterHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./useRouterHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _useRouterHistory3 = _interopRequireDefault(_useRouterHistory2);

	var _applyRouterMiddleware2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./applyRouterMiddleware\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _applyRouterMiddleware3 = _interopRequireDefault(_applyRouterMiddleware2);

	var _browserHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./browserHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _browserHistory3 = _interopRequireDefault(_browserHistory2);

	var _hashHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./hashHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _hashHistory3 = _interopRequireDefault(_hashHistory2);

	var _createMemoryHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createMemoryHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createMemoryHistory3 = _interopRequireDefault(_createMemoryHistory2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.Router = _Router3.default; /* components */

	exports.Link = _Link3.default;
	exports.IndexLink = _IndexLink3.default;
	exports.withRouter = _withRouter3.default;

	/* components (configuration) */

	exports.IndexRedirect = _IndexRedirect3.default;
	exports.IndexRoute = _IndexRoute3.default;
	exports.Redirect = _Redirect3.default;
	exports.Route = _Route3.default;

	/* mixins */

	exports.History = _History3.default;
	exports.Lifecycle = _Lifecycle3.default;
	exports.RouteContext = _RouteContext3.default;

	/* utils */

	exports.useRoutes = _useRoutes3.default;
	exports.RouterContext = _RouterContext3.default;
	exports.RoutingContext = _RoutingContext3.default;
	exports.PropTypes = _PropTypes3.default;
	exports.match = _match3.default;
	exports.useRouterHistory = _useRouterHistory3.default;
	exports.applyRouterMiddleware = _applyRouterMiddleware3.default;

	/* histories */

	exports.browserHistory = _browserHistory3.default;
	exports.hashHistory = _hashHistory3.default;
	exports.createMemoryHistory = _createMemoryHistory3.default;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _deprecate = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./deprecate\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _deprecate2 = _interopRequireDefault(_deprecate);

	var _createLocation2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createLocation\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createLocation3 = _interopRequireDefault(_createLocation2);

	var _createBrowserHistory = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createBrowserHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

	exports.createHistory = _createBrowserHistory2['default'];

	var _createHashHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createHashHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createHashHistory3 = _interopRequireDefault(_createHashHistory2);

	exports.createHashHistory = _createHashHistory3['default'];

	var _createMemoryHistory2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createMemoryHistory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createMemoryHistory3 = _interopRequireDefault(_createMemoryHistory2);

	exports.createMemoryHistory = _createMemoryHistory3['default'];

	var _useBasename2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./useBasename\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _useBasename3 = _interopRequireDefault(_useBasename2);

	exports.useBasename = _useBasename3['default'];

	var _useBeforeUnload2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./useBeforeUnload\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _useBeforeUnload3 = _interopRequireDefault(_useBeforeUnload2);

	exports.useBeforeUnload = _useBeforeUnload3['default'];

	var _useQueries2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./useQueries\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _useQueries3 = _interopRequireDefault(_useQueries2);

	exports.useQueries = _useQueries3['default'];

	var _Actions2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Actions\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Actions3 = _interopRequireDefault(_Actions2);

	exports.Actions = _Actions3['default'];

	// deprecated

	var _enableBeforeUnload2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./enableBeforeUnload\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _enableBeforeUnload3 = _interopRequireDefault(_enableBeforeUnload2);

	exports.enableBeforeUnload = _enableBeforeUnload3['default'];

	var _enableQueries2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./enableQueries\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _enableQueries3 = _interopRequireDefault(_enableQueries2);

	exports.enableQueries = _enableQueries3['default'];
	var createLocation = _deprecate2['default'](_createLocation3['default'], 'Using createLocation without a history instance is deprecated; please use history.createLocation instead');
	exports.createLocation = createLocation;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(2);

	var _require = __webpack_require__(8);

	var Route = _require.Route;
	var IndexRoute = _require.IndexRoute;

	var App = __webpack_require__(11);

	var SettingsContainer = __webpack_require__(14);

	module.exports = function (store) {

	  return React.createElement(
	    Route,
	    { path: '/', component: App },
	    React.createElement(IndexRoute, { component: SettingsContainer, activeTab: 'profile' }),
	    React.createElement(Route, { path: 'profile', component: SettingsContainer, activeTab: 'profile' }),
	    React.createElement(Route, { path: 'email', component: SettingsContainer, activeTab: 'email' }),
	    React.createElement(Route, { path: 'password', component: SettingsContainer, activeTab: 'password' }),
	    React.createElement(Route, { path: 'apiKey', component: SettingsContainer, activeTab: 'apiKey' })
	  );
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  App: {
	    displayName: 'App'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/containers/App.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(6);

	var connect = _require.connect;


	var App = _wrapComponent('App')(React.createClass({

	  displayName: 'App',

	  render: function render() {

	    return React.createElement(
	      'div',
	      { className: 'container user-settings' },
	      React.createElement(
	        'div',
	        { className: 'row' },
	        React.createElement(
	          'div',
	          { className: 'col-md-8 col-md-offset-2' },
	          React.createElement(
	            'div',
	            { className: 'top-margined wsq' },
	            React.createElement(
	              'div',
	              { className: 'content' },
	              React.createElement(
	                'div',
	                { className: 'header' },
	                React.createElement(
	                  'h2',
	                  null,
	                  'Paramètres du compte'
	                )
	              ),
	              this.props.children
	            )
	          )
	        )
	      )
	    );
	  }
	}));

	function mapStateToProps(_ref) {
	  var loading = _ref.app.loading;


	  return { loading: loading };
	}

	module.exports = connect(mapStateToProps)(App);

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _react2 = _interopRequireDefault(_react);

	var _styleJs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./style.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _styleJs2 = _interopRequireDefault(_styleJs);

	var _errorStackParser = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"error-stack-parser\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _errorStackParser2 = _interopRequireDefault(_errorStackParser);

	var _objectAssign = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"object-assign\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	var _lib = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var __$Getters__ = [];
	var __$Setters__ = [];
	var __$Resetters__ = [];

	function __GetDependency__(name) {
	  return __$Getters__[name]();
	}

	function __Rewire__(name, value) {
	  __$Setters__[name](value);
	}

	function __ResetDependency__(name) {
	  __$Resetters__[name]();
	}

	var __RewireAPI__ = {
	  '__GetDependency__': __GetDependency__,
	  '__get__': __GetDependency__,
	  '__Rewire__': __Rewire__,
	  '__set__': __Rewire__,
	  '__ResetDependency__': __ResetDependency__
	};
	var React = _react2['default'];
	var Component = _react.Component;
	var PropTypes = _react.PropTypes;

	__$Getters__['React'] = function () {
	  return React;
	};

	__$Setters__['React'] = function (value) {
	  React = value;
	};

	__$Resetters__['React'] = function () {
	  React = _react2['default'];
	};

	__$Getters__['Component'] = function () {
	  return Component;
	};

	__$Setters__['Component'] = function (value) {
	  Component = value;
	};

	__$Resetters__['Component'] = function () {
	  Component = _react.Component;
	};

	__$Getters__['PropTypes'] = function () {
	  return PropTypes;
	};

	__$Setters__['PropTypes'] = function (value) {
	  PropTypes = value;
	};

	__$Resetters__['PropTypes'] = function () {
	  PropTypes = _react.PropTypes;
	};

	var style = _styleJs2['default'];

	__$Getters__['style'] = function () {
	  return style;
	};

	__$Setters__['style'] = function (value) {
	  style = value;
	};

	__$Resetters__['style'] = function () {
	  style = _styleJs2['default'];
	};

	var ErrorStackParser = _errorStackParser2['default'];

	__$Getters__['ErrorStackParser'] = function () {
	  return ErrorStackParser;
	};

	__$Setters__['ErrorStackParser'] = function (value) {
	  ErrorStackParser = value;
	};

	__$Resetters__['ErrorStackParser'] = function () {
	  ErrorStackParser = _errorStackParser2['default'];
	};

	var assign = _objectAssign2['default'];

	__$Getters__['assign'] = function () {
	  return assign;
	};

	__$Setters__['assign'] = function (value) {
	  assign = value;
	};

	__$Resetters__['assign'] = function () {
	  assign = _objectAssign2['default'];
	};

	var isFilenameAbsolute = _lib.isFilenameAbsolute;
	var makeUrl = _lib.makeUrl;
	var makeLinkText = _lib.makeLinkText;

	__$Getters__['isFilenameAbsolute'] = function () {
	  return isFilenameAbsolute;
	};

	__$Setters__['isFilenameAbsolute'] = function (value) {
	  isFilenameAbsolute = value;
	};

	__$Resetters__['isFilenameAbsolute'] = function () {
	  isFilenameAbsolute = _lib.isFilenameAbsolute;
	};

	__$Getters__['makeUrl'] = function () {
	  return makeUrl;
	};

	__$Setters__['makeUrl'] = function (value) {
	  makeUrl = value;
	};

	__$Resetters__['makeUrl'] = function () {
	  makeUrl = _lib.makeUrl;
	};

	__$Getters__['makeLinkText'] = function () {
	  return makeLinkText;
	};

	__$Setters__['makeLinkText'] = function (value) {
	  makeLinkText = value;
	};

	__$Resetters__['makeLinkText'] = function () {
	  makeLinkText = _lib.makeLinkText;
	};

	var RedBox = (function (_Component) {
	  _inherits(RedBox, _Component);

	  function RedBox() {
	    _classCallCheck(this, RedBox);

	    _Component.apply(this, arguments);
	  }

	  RedBox.prototype.render = function render() {
	    var _props = this.props;
	    var error = _props.error;
	    var filename = _props.filename;
	    var editorScheme = _props.editorScheme;
	    var useLines = _props.useLines;
	    var useColumns = _props.useColumns;

	    var _assign = assign({}, style, this.props.style);

	    var redbox = _assign.redbox;
	    var message = _assign.message;
	    var stack = _assign.stack;
	    var frame = _assign.frame;
	    var file = _assign.file;
	    var linkToFile = _assign.linkToFile;

	    var frames = ErrorStackParser.parse(error).map(function (f, index) {
	      var text = undefined;
	      var url = undefined;

	      if (index === 0 && filename && !isFilenameAbsolute(f.fileName)) {
	        url = makeUrl(filename, editorScheme);
	        text = makeLinkText(filename);
	      } else {
	        var lines = useLines ? f.lineNumber : null;
	        var columns = useColumns ? f.columnNumber : null;
	        url = makeUrl(f.fileName, editorScheme, lines, columns);
	        text = makeLinkText(f.fileName, lines, columns);
	      }

	      return React.createElement(
	        'div',
	        { style: frame, key: index },
	        React.createElement(
	          'div',
	          null,
	          f.functionName
	        ),
	        React.createElement(
	          'div',
	          { style: file },
	          React.createElement(
	            'a',
	            { href: url, style: linkToFile },
	            text
	          )
	        )
	      );
	    });
	    return React.createElement(
	      'div',
	      { style: redbox },
	      React.createElement(
	        'div',
	        { style: message },
	        error.name,
	        ': ',
	        error.message
	      ),
	      React.createElement(
	        'div',
	        { style: stack },
	        frames
	      )
	    );
	  };

	  _createClass(RedBox, null, [{
	    key: 'propTypes',
	    value: {
	      error: PropTypes.instanceOf(Error).isRequired,
	      filename: PropTypes.string,
	      editorScheme: PropTypes.string,
	      useLines: PropTypes.bool,
	      useColumns: PropTypes.bool,
	      style: PropTypes.object
	    },
	    enumerable: true
	  }, {
	    key: 'displayName',
	    value: 'RedBox',
	    enumerable: true
	  }, {
	    key: 'defaultProps',
	    value: {
	      useLines: true,
	      useColumns: true
	    },
	    enumerable: true
	  }]);

	  return RedBox;
	})(Component);

	var _defaultExport = RedBox;

	if (typeof _defaultExport === 'object' || typeof _defaultExport === 'function') {
	  Object.defineProperty(_defaultExport, '__Rewire__', {
	    'value': __Rewire__,
	    'enumberable': false
	  });
	  Object.defineProperty(_defaultExport, '__set__', {
	    'value': __Rewire__,
	    'enumberable': false
	  });
	  Object.defineProperty(_defaultExport, '__ResetDependency__', {
	    'value': __ResetDependency__,
	    'enumberable': false
	  });
	  Object.defineProperty(_defaultExport, '__GetDependency__', {
	    'value': __GetDependency__,
	    'enumberable': false
	  });
	  Object.defineProperty(_defaultExport, '__get__', {
	    'value': __GetDependency__,
	    'enumberable': false
	  });
	  Object.defineProperty(_defaultExport, '__RewireAPI__', {
	    'value': __RewireAPI__,
	    'enumberable': false
	  });
	}

	exports['default'] = _defaultExport;
	exports.__GetDependency__ = __GetDependency__;
	exports.__get__ = __GetDependency__;
	exports.__Rewire__ = __Rewire__;
	exports.__set__ = __Rewire__;
	exports.__ResetDependency__ = __ResetDependency__;
	exports.__RewireAPI__ = __RewireAPI__;
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = catchErrors;
	function catchErrors(_ref) {
	  var filename = _ref.filename;
	  var components = _ref.components;
	  var imports = _ref.imports;

	  var _imports = _slicedToArray(imports, 3);

	  var React = _imports[0];
	  var ErrorReporter = _imports[1];
	  var reporterOptions = _imports[2];

	  if (!React || !React.Component) {
	    throw new Error('imports[0] for react-transform-catch-errors does not look like React.');
	  }
	  if (typeof ErrorReporter !== 'function') {
	    throw new Error('imports[1] for react-transform-catch-errors does not look like a React component.');
	  }

	  return function wrapToCatchErrors(ReactClass, componentId) {
	    var originalRender = ReactClass.prototype.render;

	    ReactClass.prototype.render = function tryRender() {
	      try {
	        return originalRender.apply(this, arguments);
	      } catch (err) {
	        setTimeout(function () {
	          if (typeof console.reportErrorsAsExceptions !== 'undefined') {
	            var prevReportErrorAsExceptions = console.reportErrorsAsExceptions;
	            // We're in React Native. Don't throw.
	            // Stop react-native from triggering its own error handler
	            console.reportErrorsAsExceptions = false;
	            // Log an error
	            console.error(err);
	            // Reactivate it so other errors are still handled
	            console.reportErrorsAsExceptions = prevReportErrorAsExceptions;
	          } else {
	            throw err;
	          }
	        });

	        return React.createElement(ErrorReporter, _extends({
	          error: err,
	          filename: filename
	        }, reporterOptions));
	      }
	    };

	    return ReactClass;
	  };
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _assign = __webpack_require__(15);

	var _assign2 = _interopRequireDefault(_assign);

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  SettingsContainer: {
	    displayName: 'SettingsContainer'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/containers/SettingsContainer.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(6);

	var connect = _require.connect;

	var _require2 = __webpack_require__(7);

	var push = _require2.push;

	var _require3 = __webpack_require__(16);

	var changeFieldValue = _require3.change;

	var get = __webpack_require__(17);

	var actions = __webpack_require__(18);

	var ProfileSettings = __webpack_require__(20);

	var EmailSettings = __webpack_require__(22);

	var PasswordSettings = __webpack_require__(23);

	var ApiKeySettings = __webpack_require__(24);

	var SettingsContainer = _wrapComponent('SettingsContainer')(React.createClass({

	  displayName: 'SettingsContainer',

	  componentWillMount: function componentWillMount() {

	    this.props.getMe();
	  },
	  render: function render() {
	    var _props = this.props;
	    var activeTab = _props.route.activeTab;
	    var user = _props.user;
	    var updateProfile = _props.updateProfile;
	    var changeEmail = _props.changeEmail;
	    var changePassword = _props.changePassword;


	    return React.createElement(
	      'div',
	      { style: { padding: '15px 0' } },
	      React.createElement(ProfileSettings, { activeTab: activeTab == 'profile', onSubmit: updateProfile }),
	      React.createElement(EmailSettings, { activeTab: activeTab == 'email', onSubmit: changeEmail }),
	      React.createElement(PasswordSettings, { activeTab: activeTab == 'password', onSubmit: changePassword }),
	      React.createElement(ApiKeySettings, { activeTab: activeTab == 'apiKey' })
	    );
	  }
	}));

	function mapStateToProps(_ref) {
	  var appSettings = _ref.app.appSettings;
	  var user = _ref.userSettings.user;


	  return {
	    appSettings: appSettings,
	    user: user
	  };
	}

	function mergeProps(stateProps, dispatchProps, ownProps) {
	  var dispatch = dispatchProps.dispatch;
	  var appSettings = stateProps.appSettings;


	  var mapDispatchToProps = {
	    getMe: getMe,
	    updateProfile: updateProfile,
	    changeEmail: changeEmail,
	    changePassword: changePassword
	  };

	  return (0, _assign2.default)({}, ownProps, stateProps, mapDispatchToProps);

	  function getMe() {
	    dispatch(actions.getMe('request'));

	    get(url('getMe'), function (err, result) {
	      if (!err) {
	        dispatch(actions.getMe('response', result));
	        dispatch(changeFieldValue('profileSettings', 'fullname', result.user.full_name));
	        dispatch(changeFieldValue('profileSettings', 'culture', result.user.culture));
	        dispatch(changeFieldValue('emailSettings', 'email', result.user.email));
	        dispatch(changeFieldValue('apiKeySettings', 'apiKey', result.user.api_key));
	      }
	    });
	  }

	  function updateProfile(_ref2) {
	    var fullname = _ref2.fullname;
	    var culture = _ref2.culture;

	    dispatch(actions.updateProfile('request'));

	    get(url('updateProfile'), { full_name: fullname, culture: culture }, function (err, result) {
	      if (!err) {
	        dispatch(actions.updateProfile('response', result));
	      }
	    });
	  }

	  function changeEmail(_ref3) {
	    var email = _ref3.email;
	    var password = _ref3.password;

	    dispatch(actions.changeEmail('request'));

	    get(url('changeEmail'), { email: email, password: password }, function (err, result) {
	      if (!err) {
	        dispatch(actions.changeEmail('response', result));
	      }
	    });
	  }

	  function changePassword(_ref4) {
	    var old_password = _ref4.old_password;
	    var new_password = _ref4.new_password;
	    var confirmation = _ref4.confirmation;

	    dispatch(actions.changePassword('request'));

	    get(url('changePassword'), { old_password: old_password, new_password: new_password, confirmation: confirmation }, function (err, result) {
	      if (!err) {
	        dispatch(actions.changePassword('response', result));
	      }
	    });
	  }

	  function url(name) {
	    return appSettings.prefix + appSettings.urls[name];
	  }
	}

	module.exports = connect(mapStateToProps, function (dispatch) {
	  return { dispatch: dispatch };
	}, mergeProps)(SettingsContainer);

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"core-js/library/fn/object/assign\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())), __esModule: true };

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.untouchWithKey = exports.untouch = exports.touchWithKey = exports.touch = exports.swapArrayValues = exports.stopSubmit = exports.stopAsyncValidation = exports.startSubmit = exports.startAsyncValidation = exports.reset = exports.propTypes = exports.initializeWithKey = exports.initialize = exports.getValues = exports.removeArrayValue = exports.reduxForm = exports.reducer = exports.focus = exports.destroy = exports.changeWithKey = exports.change = exports.blur = exports.autofillWithKey = exports.autofill = exports.addArrayValue = exports.actionTypes = undefined;

	var _react = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-redux\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createAll2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createAll\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createAll3 = _interopRequireDefault(_createAll2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var isNative = typeof window !== 'undefined' && window.navigator && window.navigator.product && window.navigator.product === 'ReactNative';

	var _createAll = (0, _createAll3.default)(isNative, _react2.default, _reactRedux.connect);

	var actionTypes = _createAll.actionTypes;
	var addArrayValue = _createAll.addArrayValue;
	var autofill = _createAll.autofill;
	var autofillWithKey = _createAll.autofillWithKey;
	var blur = _createAll.blur;
	var change = _createAll.change;
	var changeWithKey = _createAll.changeWithKey;
	var destroy = _createAll.destroy;
	var focus = _createAll.focus;
	var reducer = _createAll.reducer;
	var reduxForm = _createAll.reduxForm;
	var removeArrayValue = _createAll.removeArrayValue;
	var getValues = _createAll.getValues;
	var initialize = _createAll.initialize;
	var initializeWithKey = _createAll.initializeWithKey;
	var propTypes = _createAll.propTypes;
	var reset = _createAll.reset;
	var startAsyncValidation = _createAll.startAsyncValidation;
	var startSubmit = _createAll.startSubmit;
	var stopAsyncValidation = _createAll.stopAsyncValidation;
	var stopSubmit = _createAll.stopSubmit;
	var swapArrayValues = _createAll.swapArrayValues;
	var touch = _createAll.touch;
	var touchWithKey = _createAll.touchWithKey;
	var untouch = _createAll.untouch;
	var untouchWithKey = _createAll.untouchWithKey;
	exports.actionTypes = actionTypes;
	exports.addArrayValue = addArrayValue;
	exports.autofill = autofill;
	exports.autofillWithKey = autofillWithKey;
	exports.blur = blur;
	exports.change = change;
	exports.changeWithKey = changeWithKey;
	exports.destroy = destroy;
	exports.focus = focus;
	exports.reducer = reducer;
	exports.reduxForm = reduxForm;
	exports.removeArrayValue = removeArrayValue;
	exports.getValues = getValues;
	exports.initialize = initialize;
	exports.initializeWithKey = initializeWithKey;
	exports.propTypes = propTypes;
	exports.reset = reset;
	exports.startAsyncValidation = startAsyncValidation;
	exports.startSubmit = startSubmit;
	exports.stopAsyncValidation = stopAsyncValidation;
	exports.stopSubmit = stopSubmit;
	exports.swapArrayValues = swapArrayValues;
	exports.touch = touch;
	exports.touchWithKey = touchWithKey;
	exports.untouch = untouch;
	exports.untouchWithKey = untouchWithKey;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var xhr = __webpack_require__( !(function webpackMissingModule() { var e = new Error("Cannot find module \"xhr\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) ),

	  qs = __webpack_require__( !(function webpackMissingModule() { var e = new Error("Cannot find module \"qs\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) );

	module.exports = function( res, data, cb ) {

	  if ( arguments.length === 2 ) {

	    cb = data;

	    data = {};

	  }

	  var query = qs.stringify( data );

	  xhr( {
	    uri: res + ( query ? '?' + query : '' ),
	    method: 'get',
	    json: true,
	    headers: {
	      'X-Requested-With': 'XMLHttpRequest'
	    }
	  }, function( err, result ) {

	    if ( err ) {

	      return cb( err );

	    }

	    if ( result.statusCode !== 200 ) {

	      return cb( { statusCode: result.statusCode } );

	    }

	    cb( null, result.body );

	  } );

	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var types = __webpack_require__(19);

	module.exports = {
	  setAppSettings: function setAppSettings(settings) {
	    return { type: types.SET_APP_SETTINGS, settings: settings };
	  },
	  loading: function loading(_loading) {
	    return { type: types.LOADING, loading: _loading };
	  },

	  getMe: function getMe() {
	    var status = arguments.length <= 0 || arguments[0] === undefined ? 'request' : arguments[0];
	    var data = arguments[1];
	    return { type: types.GET_ME, status: status, data: data };
	  },
	  updateProfile: function updateProfile() {
	    var status = arguments.length <= 0 || arguments[0] === undefined ? 'request' : arguments[0];
	    var data = arguments[1];
	    return { type: types.UPDATE_PROFILE, status: status, data: data };
	  },
	  changeEmail: function changeEmail() {
	    var status = arguments.length <= 0 || arguments[0] === undefined ? 'request' : arguments[0];
	    var data = arguments[1];
	    return { type: types.CHANGE_EMAIL, status: status, data: data };
	  },
	  changePassword: function changePassword() {
	    var status = arguments.length <= 0 || arguments[0] === undefined ? 'request' : arguments[0];
	    var data = arguments[1];
	    return { type: types.CHANGE_PASSWORD, status: status, data: data };
	  }
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	var TYPES = {
	  SET_APP_SETTINGS: 'SET_APP_SETTINGS',
	  LOADING: 'LOADING',

	  GET_ME: 'GET_ME',
	  UPDATE_PROFILE: 'UPDATE_PROFILE',
	  CHANGE_EMAIL: 'CHANGE_EMAIL',
	  CHANGE_PASSWORD: 'CHANGE_PASSWORD'
	};

	module.exports = TYPES;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends2 = __webpack_require__(21);

	var _extends3 = _interopRequireDefault(_extends2);

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  ProfileSettings: {
	    displayName: 'ProfileSettings'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/components/ProfileSettings.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(8);

	var Link = _require.Link;

	var _require2 = __webpack_require__(16);

	var reduxForm = _require2.reduxForm;


	var ProfileSettings = _wrapComponent('ProfileSettings')(React.createClass({

	  displayName: 'ProfileSettings',

	  propTypes: {
	    activeTab: React.PropTypes.bool
	  },

	  render: function render() {
	    var _props = this.props;
	    var activeTab = _props.activeTab;
	    var _props$fields = _props.fields;
	    var fullname = _props$fields.fullname;
	    var culture = _props$fields.culture;
	    var handleSubmit = _props.handleSubmit;


	    return activeTab ? React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'h4',
	        null,
	        React.createElement('i', { className: 'fa fa-caret-down', 'aria-hidden': 'true' }),
	        ' Profil utilisateur'
	      ),
	      React.createElement(
	        'div',
	        { style: { padding: '0 5px' } },
	        React.createElement(
	          'form',
	          { onSubmit: handleSubmit, style: { paddingBottom: '8px' } },
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'fullname' },
	              'Nom complet *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'fullname' }, fullname))
	          ),
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'culture' },
	              'Langue *'
	            ),
	            React.createElement(
	              'select',
	              (0, _extends3.default)({ name: 'culture', className: 'form-control' }, culture),
	              React.createElement(
	                'option',
	                { value: 'fr' },
	                'Français'
	              ),
	              React.createElement(
	                'option',
	                { value: 'en' },
	                'Anglais'
	              )
	            )
	          ),
	          React.createElement(
	            'button',
	            { type: 'submit', className: 'btn btn-success' },
	            'Sauvegarder'
	          ),
	          React.createElement(
	            'div',
	            { className: 'pull-right' },
	            React.createElement(
	              'a',
	              { href: '#', className: 'text-danger' },
	              'Supprimer mon compte'
	            )
	          )
	        )
	      )
	    ) : React.createElement(
	      'h4',
	      null,
	      React.createElement(
	        Link,
	        { to: '/profile' },
	        React.createElement('i', { className: 'fa fa-caret-right', 'aria-hidden': 'true' }),
	        ' Profil utilisateur'
	      )
	    );
	  }

	}));

	module.exports = reduxForm({
	  form: 'profileSettings',
	  fields: ['fullname', 'culture']
	})(ProfileSettings);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _assign = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/object/assign\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _assign2.default || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends2 = __webpack_require__(21);

	var _extends3 = _interopRequireDefault(_extends2);

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  EmailSettings: {
	    displayName: 'EmailSettings'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/components/EmailSettings.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(8);

	var Link = _require.Link;

	var _require2 = __webpack_require__(16);

	var reduxForm = _require2.reduxForm;


	var EmailSettings = _wrapComponent('EmailSettings')(React.createClass({

	  displayName: 'EmailSettings',

	  propTypes: {
	    activeTab: React.PropTypes.bool
	  },

	  render: function render() {
	    var _props = this.props;
	    var activeTab = _props.activeTab;
	    var _props$fields = _props.fields;
	    var email = _props$fields.email;
	    var password = _props$fields.password;
	    var handleSubmit = _props.handleSubmit;


	    return activeTab ? React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'h4',
	        null,
	        React.createElement('i', { className: 'fa fa-caret-down', 'aria-hidden': 'true' }),
	        ' Email'
	      ),
	      React.createElement(
	        'div',
	        { style: { padding: '0 5px' } },
	        React.createElement(
	          'form',
	          { onSubmit: handleSubmit, style: { paddingBottom: '8px' } },
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'email' },
	              'Email *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'email' }, email))
	          ),
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'password' },
	              'Mot de passe *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'password', className: 'form-control', name: 'password' }, password))
	          ),
	          React.createElement(
	            'button',
	            { type: 'submit', className: 'btn btn-success' },
	            'Sauvegarder'
	          )
	        )
	      )
	    ) : React.createElement(
	      'h4',
	      null,
	      React.createElement(
	        Link,
	        { to: '/email' },
	        React.createElement('i', { className: 'fa fa-caret-right', 'aria-hidden': 'true' }),
	        ' Email'
	      )
	    );
	  }

	}));

	module.exports = reduxForm({
	  form: 'emailSettings',
	  fields: ['email', 'password']
	})(EmailSettings);

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends2 = __webpack_require__(21);

	var _extends3 = _interopRequireDefault(_extends2);

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  PasswordSettings: {
	    displayName: 'PasswordSettings'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/components/PasswordSettings.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(8);

	var Link = _require.Link;

	var _require2 = __webpack_require__(16);

	var reduxForm = _require2.reduxForm;


	var PasswordSettings = _wrapComponent('PasswordSettings')(React.createClass({

	  displayName: 'PasswordSettings',

	  propTypes: {
	    activeTab: React.PropTypes.bool
	  },

	  render: function render() {
	    var _props = this.props;
	    var activeTab = _props.activeTab;
	    var _props$fields = _props.fields;
	    var old_password = _props$fields.old_password;
	    var new_password = _props$fields.new_password;
	    var confirmation = _props$fields.confirmation;
	    var handleSubmit = _props.handleSubmit;


	    return activeTab ? React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'h4',
	        null,
	        React.createElement('i', { className: 'fa fa-caret-down', 'aria-hidden': 'true' }),
	        ' Mot de passe'
	      ),
	      React.createElement(
	        'div',
	        { style: { padding: '0 5px' } },
	        React.createElement(
	          'form',
	          { onSubmit: handleSubmit, style: { paddingBottom: '8px' } },
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'old_password' },
	              'Mot de passe actuel *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'password', className: 'form-control', name: 'old_password' }, old_password))
	          ),
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'new_password' },
	              'Nouveau mot de passe *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'password', className: 'form-control', name: 'new_password' }, new_password))
	          ),
	          React.createElement(
	            'div',
	            { className: 'form-group' },
	            React.createElement(
	              'label',
	              { htmlFor: 'confirmation' },
	              'Répétez le mot de passe *'
	            ),
	            React.createElement('input', (0, _extends3.default)({ type: 'password', className: 'form-control', name: 'confirmation' }, confirmation))
	          ),
	          React.createElement(
	            'button',
	            { type: 'submit', className: 'btn btn-success' },
	            'Sauvegarder'
	          )
	        )
	      )
	    ) : React.createElement(
	      'h4',
	      null,
	      React.createElement(
	        Link,
	        { to: '/password' },
	        React.createElement('i', { className: 'fa fa-caret-right', 'aria-hidden': 'true' }),
	        ' Mot de passe'
	      )
	    );
	  }

	}));

	module.exports = reduxForm({
	  form: 'passwordSettings',
	  fields: ['old_password', 'new_password', 'confirmation']
	})(PasswordSettings);

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends2 = __webpack_require__(21);

	var _extends3 = _interopRequireDefault(_extends2);

	var _redboxReact2 = __webpack_require__(12);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(2);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  ApiKeySettings: {
	    displayName: 'ApiKeySettings'
	  }
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/users/react/components/ApiKeySettings.js',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(2);

	var _require = __webpack_require__(8);

	var Link = _require.Link;

	var _require2 = __webpack_require__(16);

	var reduxForm = _require2.reduxForm;


	var ApiKeySettings = _wrapComponent('ApiKeySettings')(React.createClass({

	  displayName: 'ApiKeySettings',

	  propTypes: {
	    activeTab: React.PropTypes.bool
	  },

	  render: function render() {
	    var _props = this.props;
	    var activeTab = _props.activeTab;
	    var apiKey = _props.fields.apiKey;


	    return activeTab ? React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'h4',
	        null,
	        React.createElement('i', { className: 'fa fa-caret-down', 'aria-hidden': 'true' }),
	        ' Clé API'
	      ),
	      React.createElement(
	        'div',
	        { style: { padding: '0 5px' } },
	        React.createElement(
	          'p',
	          null,
	          'La clé API permet de lire les données publiées sur OpenAgenda via l\'API.'
	        ),
	        React.createElement(
	          'p',
	          null,
	          React.createElement(
	            'a',
	            { href: '#' },
	            'Voir la documentation'
	          )
	        ),
	        React.createElement(
	          'div',
	          { className: 'form-group' },
	          React.createElement(
	            'label',
	            { htmlFor: 'email' },
	            'Ma clé API'
	          ),
	          React.createElement('input', (0, _extends3.default)({ type: 'text', className: 'form-control', name: 'api_key', readOnly: true }, apiKey))
	        )
	      )
	    ) : React.createElement(
	      'h4',
	      null,
	      React.createElement(
	        Link,
	        { to: '/apiKey' },
	        React.createElement('i', { className: 'fa fa-caret-right', 'aria-hidden': 'true' }),
	        ' Clé API'
	      )
	    );
	  }

	}));

	module.exports = reduxForm({
	  form: 'apiKeySettings',
	  fields: ['apiKey']
	})(ApiKeySettings);

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _assign = __webpack_require__(15);

	var _assign2 = _interopRequireDefault(_assign);

	var _slicedToArray2 = __webpack_require__(26);

	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _require = __webpack_require__(27);

	var createStore = _require.createStore;
	var compose = _require.compose;
	var applyMiddleware = _require.applyMiddleware;

	var _require2 = __webpack_require__(7);

	var routerMiddleware = _require2.routerMiddleware;


	module.exports = function (history) {

	  var enhancer;

	  if (typeof window !== 'undefined' && window.env == 'dev') {
	    var _require3 = __webpack_require__(28);

	    var persistState = _require3.persistState;
	    var DevTools = __webpack_require__(29);

	    enhancer = compose(applyMiddleware(routerMiddleware(history), promiseMiddleware), window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(), persistState(getDebugSessionKey()));
	  } else {
	    enhancer = compose(applyMiddleware(routerMiddleware(history), promiseMiddleware));
	  }

	  var reducers = __webpack_require__(32);
	  var store = createStore(reducers, typeof window !== 'undefined' ? window.__data : undefined, enhancer);

	  return store;
	};

	function getDebugSessionKey() {
	  // You can write custom logic here!
	  // By default we try to read the key from ?debug_session=<key> in the address bar
	  var matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
	  return matches && matches.length > 0 ? matches[1] : null;
	}

	function promiseMiddleware() {

	  return function (next) {
	    return function (action) {
	      var promise = action.promise;
	      var types = action.types;

	      var rest = removeObjectProperties(action, ["promise", "types"]);

	      if (!promise) {
	        return next(action);
	      }

	      var _types = (0, _slicedToArray3.default)(types, 3);

	      var REQUEST = _types[0];
	      var SUCCESS = _types[1];
	      var FAILURE = _types[2];


	      next((0, _assign2.default)({}, rest, { type: REQUEST }));

	      return promise.then(function (result) {
	        return next((0, _assign2.default)({}, rest, { result: result, type: SUCCESS }));
	      }, function (error) {
	        return next((0, _assign2.default)({}, rest, { error: error, type: FAILURE }));
	      });
	    };
	  };
	}

	function removeObjectProperties(obj, keys) {

	  var target = {};

	  for (var i in obj) {

	    if (keys.indexOf(i) >= 0) continue;

	    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;

	    target[i] = obj[i];
	  }

	  return target;
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _isIterable2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/is-iterable\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _isIterable3 = _interopRequireDefault(_isIterable2);

	var _getIterator2 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/get-iterator\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if ((0, _isIterable3.default)(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

	var _createStore = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createStore\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _createStore2 = _interopRequireDefault(_createStore);

	var _combineReducers = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./combineReducers\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _combineReducers2 = _interopRequireDefault(_combineReducers);

	var _bindActionCreators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./bindActionCreators\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

	var _applyMiddleware = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./applyMiddleware\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

	var _compose = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./compose\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _compose2 = _interopRequireDefault(_compose);

	var _warning = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./utils/warning\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}

	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}

	exports.createStore = _createStore2["default"];
	exports.combineReducers = _combineReducers2["default"];
	exports.bindActionCreators = _bindActionCreators2["default"];
	exports.applyMiddleware = _applyMiddleware2["default"];
	exports.compose = _compose2["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"/var/www/html/OpenAgenda/cibul-templates/node_modules/process/browser.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _reduxDevtoolsInstrument = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"redux-devtools-instrument\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'instrument', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_reduxDevtoolsInstrument).default;
	  }
	});
	Object.defineProperty(exports, 'ActionCreators', {
	  enumerable: true,
	  get: function get() {
	    return _reduxDevtoolsInstrument.ActionCreators;
	  }
	});
	Object.defineProperty(exports, 'ActionTypes', {
	  enumerable: true,
	  get: function get() {
	    return _reduxDevtoolsInstrument.ActionTypes;
	  }
	});

	var _persistState = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./persistState\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'persistState', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_persistState).default;
	  }
	});

	var _createDevTools = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./createDevTools\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	Object.defineProperty(exports, 'createDevTools', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_createDevTools).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(2);

	var _require = __webpack_require__(28);

	var createDevTools = _require.createDevTools;

	var DockMonitor = __webpack_require__(30).default;

	var LogMonitor = __webpack_require__(31).default;

	module.exports = createDevTools(React.createElement(
	  DockMonitor,
	  { toggleVisibilityKey: 'ctrl-h', changePositionKey: 'ctrl-p', defaultPosition: 'bottom' },
	  React.createElement(LogMonitor, null)
	));

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.default = undefined;

	var _DockMonitor = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./DockMonitor\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _DockMonitor2 = _interopRequireDefault(_DockMonitor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _DockMonitor2.default;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.default = undefined;

	var _LogMonitor = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LogMonitor\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _LogMonitor2 = _interopRequireDefault(_LogMonitor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _LogMonitor2.default;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(27);

	var combineReducers = _require.combineReducers;

	var _require2 = __webpack_require__(7);

	var routerReducer = _require2.routerReducer;

	var _require3 = __webpack_require__(16);

	var form = _require3.reducer;

	var app = __webpack_require__(33);

	var userSettings = __webpack_require__(34);

	module.exports = combineReducers({
	  routing: routerReducer,
	  form: form,
	  app: app,
	  userSettings: userSettings
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _assign = __webpack_require__(15);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var types = __webpack_require__(19);

	var initialState = {
	  appSettings: {},
	  loading: false
	};

	function app() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];


	  switch (action.type) {
	    case types.SET_APP_SETTINGS:
	      return (0, _assign2.default)({}, state, { appSettings: action.settings });
	    case types.LOADING:
	      return (0, _assign2.default)({}, state, { loading: action.loading });
	    default:
	      return state;
	  }
	}

	module.exports = app;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _assign = __webpack_require__(15);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var types = __webpack_require__(19);

	var initialState = {
	  user: null
	};

	function userSettings() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];


	  switch (action.type) {
	    case types.GET_ME:
	      return getMe(state, action.status, action.data);
	    case types.UPDATE_PROFILE:
	      return updateProfile(state, action.status, action.data);
	    case types.CHANGE_EMAIL:
	      return changeEmail(state, action.status, action.data);
	    case types.CHANGE_PASSWORD:
	      return changePassword(state, action.status, action.data);
	    default:
	      return state;
	  }
	}

	function getMe(state, status) {
	  var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  switch (status) {
	    case 'response':
	      return (0, _assign2.default)({}, state, { user: data.user });
	    default:
	      return state;
	  }
	}

	function updateProfile(state, status) {
	  var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  switch (status) {
	    case 'response':
	      return (0, _assign2.default)({}, state);
	    default:
	      return state;
	  }
	}

	function changeEmail(state, status) {
	  var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  switch (status) {
	    case 'response':
	      return (0, _assign2.default)({}, state);
	    default:
	      return state;
	  }
	}

	function changePassword(state, status) {
	  var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  switch (status) {
	    case 'response':
	      return (0, _assign2.default)({}, state);
	    default:
	      return state;
	  }
	}

	module.exports = userSettings;

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	if (!Object.assign) {
	    Object.assign = function(target, sources) {
	        if (target === null || target === undefined) {
	            throw new TypeError('Object.assign target cannot be null or undefined');
	        }

	        var to = Object(target);
	        var hasOwnProperty = Object.prototype.hasOwnProperty;

	        for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
	            var nextSource = arguments[nextIndex];
	            if (nextSource === null || nextSource === undefined) {
	                continue;
	            }

	            var from = Object(nextSource);

	            // We don't currently support accessors nor proxies. Therefore this
	            // copy cannot throw. If we ever supported this then we must handle
	            // exceptions and side-effects.

	            for (var key in from) {
	                if (hasOwnProperty.call(from, key)) {
	                    to[key] = from[key];
	                }
	            }
	        }

	        return to;
	    };
	}

	// Add ECMA262-5 method binding if not supported natively
	if ( !( 'bind' in Function.prototype ) ) {

	    Function.prototype.bind= function(owner) {

	        var that = this;

	        if (arguments.length<=1) {
	            return function() {
	                return that.apply(owner, arguments);
	            };
	        } else {
	            var args= Array.prototype.slice.call(arguments, 1);
	            return function() {
	                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
	            };
	        }

	    };
	}

	// Add ECMA262-5 string trim if not supported natively
	//
	if ( !('trim' in String.prototype) ) {
	    String.prototype.trim= function() {
	        return this.replace(/^\s+/, '').replace(/\s+$/, '');
	    };
	}

	// Add ECMA262-5 Array methods if not supported natively
	//
	if ( !('indexOf' in Array.prototype) ) {
	    Array.prototype.indexOf= function(find, i /*opt*/) {
	        if (i===undefined) i= 0;
	        if (i<0) i+= this.length;
	        if (i<0) i= 0;
	        for (var n= this.length; i<n; i++)
	            if (i in this && this[i]===find)
	                return i;
	        return -1;
	    };
	}

	if ( !('lastIndexOf' in Array.prototype) ) {
	    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
	        if (i===undefined) i= this.length-1;
	        if (i<0) i+= this.length;
	        if (i>this.length-1) i= this.length-1;
	        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
	            if (i in this && this[i]===find)
	                return i;
	        return -1;
	    };
	}

	if ( !('forEach' in Array.prototype) ) {
	    Array.prototype.forEach= function(action, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this)
	                action.call(that, this[i], i, this);
	    };
	}

	if (!('map' in Array.prototype) ) {
	    Array.prototype.map= function(mapper, that /*opt*/) {
	        var other= new Array(this.length);
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this)
	                other[i]= mapper.call(that, this[i], i, this);
	        return other;
	    };
	}

	if (!('filter' in Array.prototype)) {
	    Array.prototype.filter= function(filter, that /*opt*/) {
	        var other= [], v;
	        for (var i=0, n= this.length; i<n; i++)
	            if (i in this && filter.call(that, v= this[i], i, this))
	                other.push(v);
	        return other;
	    };
	}

	if (!('every' in Array.prototype)) {
	    Array.prototype.every= function(tester, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this && !tester.call(that, this[i], i, this))
	                return false;
	        return true;
	    };
	}

	if (!('some' in Array.prototype)) {
	    Array.prototype.some= function(tester, that /*opt*/) {
	        for (var i= 0, n= this.length; i<n; i++)
	            if (i in this && tester.call(that, this[i], i, this))
	                return true;
	        return false;
	    };
	}


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * Node.JS module "Deep Extend"
	 * @description Recursive object extending.
	 * @author Viacheslav Lotsmanov (unclechu) <lotsmanov89@gmail.com>
	 * @license MIT
	 *
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2013 Viacheslav Lotsmanov
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of
	 * this software and associated documentation files (the "Software"), to deal in
	 * the Software without restriction, including without limitation the rights to
	 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	 * the Software, and to permit persons to whom the Software is furnished to do so,
	 * subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	 */

	/**
	 * Extening object that entered in first argument.
	 * Returns extended object or false if have no target object or incorrect type.
	 * If you wish to clone object, simply use that:
	 *  deepExtend({}, yourObj_1, [yourObj_N]) - first arg is new empty object
	 */
	var deepExtend = module.exports = function (/*obj_1, [obj_2], [obj_N]*/) {
		if (arguments.length < 1 || typeof arguments[0] !== 'object') {
			return false;
		}

		if (arguments.length < 2) return arguments[0];

		var target = arguments[0];

		// convert arguments to array and cut off target object
		var args = Array.prototype.slice.call(arguments, 1);

		var key, val, src, clone, tmpBuf;

		args.forEach(function (obj) {
			if (typeof obj !== 'object') return;

			for (key in obj) {
				if ( ! (key in obj)) continue;

				src = target[key];
				val = obj[key];

				if (val === target) continue;

				if (typeof val !== 'object' || val === null) {
					target[key] = val;
					continue;
				} else if (val instanceof Buffer) {
					tmpBuf = new Buffer(val.length);
					val.copy(tmpBuf);
					target[key] = tmpBuf;
					continue;
				} else if (val instanceof Date) {
					target[key] = new Date(val.getTime());
					continue;
				}

				if (typeof src !== 'object' || src === null) {
					clone = (Array.isArray(val)) ? [] : {};
					target[key] = deepExtend(clone, val);
					continue;
				}

				if (Array.isArray(val)) {
					clone = (Array.isArray(src)) ? src : [];
				} else {
					clone = (!Array.isArray(src)) ? src : {};
				}

				target[key] = deepExtend(clone, val);
			}
		});

		return target;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"/var/www/html/OpenAgenda/cibul-templates/node_modules/buffer/index.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).Buffer))

/***/ }
/******/ ]);