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

	"use strict";

	var du = __webpack_require__(1),
	    deepExtend = __webpack_require__(5),
	    params = {
	  lang: 'en',
	  res: {
	    index: '#'
	  },
	  selectors: {
	    canvas: '.js_canvas'
	  },
	  useTags: false // display tags menu & category additional fields
	},
	    React = __webpack_require__(6),
	    ReactDom = __webpack_require__(7),
	    LocactionsAdmin = __webpack_require__(8);

	window.hook(function (options) {

	  deepExtend(params, options);

	  ReactDom.render(React.createElement(LocactionsAdmin, {
	    agenda: params.agenda,
	    settings: params.settings,
	    lang: params.lang,
	    detailedInfo: true,
	    res: params.res }), du.el(params.selectors.canvas));
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(2);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(3),
	    utils = __webpack_require__(4);

	module.exports = {
	  el: el,
	  els: els,
	  addEvent: addEvent, // add an event to an element
	  removeEvent: removeEvent,
	  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
	  asapReady: asapReady, // executes cb as soon as elem targetted by elem ( or body by default ) exists.
	  loadInLocation: loadInLocation,
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  forEach: forEach,
	  childObject: childObject,
	  preventDefault: preventDefault,
	  isElement: isElement,
	  nl2br: nl2br
	};

	function isElement(o) {

	  return (typeof HTMLElement === 'undefined' ? 'undefined' : (0, _typeof3.default)(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
	  o && (typeof o === 'undefined' ? 'undefined' : (0, _typeof3.default)(o)) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
	}

	function preventDefault(event) {

	  event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};

	function childObject(elem, index) {

	  var i = 0,
	      realI = 0;

	  while (elem.childNodes[i]) {

	    if (elem.childNodes[i].nodeType == 1) {

	      if (realI == index) return elem.childNodes[i];

	      realI++;
	    }

	    i++;
	  }

	  return false;
	}

	function hasClass(element, cls) {

	  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	function addClass(element, className) {

	  if (!hasClass(element, className)) element.className = element.className + ' ' + className;
	}

	function removeClass(element, cls) {

	  if (hasClass(element, cls)) {

	    var regex = new RegExp(cls, 'g');

	    element.className = element.className.replace(regex, '');
	  }
	}

	function els(node, selector) {

	  if (typeof node == 'string') {

	    selector = node;
	    node = document;
	  }

	  var prefix = selector.substr(0, 1);

	  if ('.#,'.indexOf(prefix) !== -1) {

	    selector = selector.substr(1);
	  }

	  if (prefix == '.') {

	    return getElementsByClassName(node, selector);
	  } else if (prefix == '#') {

	    var result = node.getElementById(selector);

	    if (result) {

	      return [result];
	    } else {

	      return [];
	    }
	  } else {

	    return node.getElementsByTagName(selector);
	  }
	};

	function el(node, selector) {

	  var results = els(node, selector);

	  return results.length ? results[0] : null;
	}

	function whenReady(cb) {

	  if (document.readyState === 'complete') {

	    cb();
	  } else {

	    addEvent(window, 'load', cb);
	  }
	}

	function asapReady(selector, timeout, cb) {

	  if (arguments.length == 1) {

	    cb = selector;

	    timeout = 0;

	    selector = 'body';
	  } else if (arguments.length == 2) {

	    cb = timeout;

	    timeout = 0;
	  }

	  if (el(selector)) return cb();

	  setTimeout(function () {

	    asapReady(selector, Math.min((timeout + 10) * 2, 10000), cb);
	  }, timeout);
	}

	function loadInLocation(values) {

	  var href = window.location.href.split('?')[0];

	  if (utils.size(values)) {

	    href += '?' + qs.stringify(values);
	  }

	  return href;
	}

	/**
	 * cross browser add event
	 */

	function addEvent(elem, types, eventHandle) {

	  if (elem == null || elem == undefined) return;

	  if (typeof types == 'string') types = [types];

	  forEach(types, function (type) {

	    if (elem.addEventListener) {

	      elem.addEventListener(type, eventHandle, false);
	    } else if (elem.attachEvent) {

	      elem.attachEvent('on' + type, eventHandle);
	    } else {

	      elem['on' + type] = eventHandle;
	    }
	  });
	}

	function removeEvent(elem, types, eventHandle) {

	  if (elem === null || elem === undefined) return;

	  if (typeof types == 'string') types = [types];

	  forEach(types, function (type) {

	    if (elem.removeEventListener) {

	      elem.removeEventListener(type, eventHandle, false);
	    } else if (elem.detachEvent) {

	      elem.detachEvent('on' + type, eventHandle);
	    } else {

	      elem["on" + type] = null;
	    }
	  });
	};

	function forEach(array, action) {

	  for (var i = 0; i < array.length; i++) {

	    action(array[i]);
	  }
	}

	function getElementsByClassName(node, className) {

	  if (typeof node == 'string') {

	    className = node;
	    node = document;
	  }

	  var a = [],
	      re = new RegExp('(^| )' + className + '( |$)'),
	      els = node.getElementsByTagName('*');

	  for (var i = 0, j = els.length; i < j; i++) {

	    if (re.test(els[i].className)) {

	      a.push(els[i]);
	    }
	  }

	  return a;
	}

	function nl2br(str, is_xhtml) {

	  var breakTag = is_xhtml || typeof is_xhtml === 'undefined' ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

	  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/symbol/iterator\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/symbol\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 4 */
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
/* 5 */
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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/ReactDOM\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _actions = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./actions\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _actions2 = _interopRequireDefault(_actions);

	var _countries = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../lib/countries\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _countries2 = _interopRequireDefault(_countries);

	var _Filters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Filters\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Filters2 = _interopRequireDefault(_Filters);

	var _get = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./List/lib/get\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _get2 = _interopRequireDefault(_get);

	var _list = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"labels/agenda-locations/list\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _list2 = _interopRequireDefault(_list);

	var _List = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./List/List\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _List2 = _interopRequireDefault(_List);

	var _MergeForm = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./MergeForm\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _MergeForm2 = _interopRequireDefault(_MergeForm);

	var _UpdateForm = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./UpdateForm\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _UpdateForm2 = _interopRequireDefault(_UpdateForm);

	var _CreateForm = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./CreateForm\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _CreateForm2 = _interopRequireDefault(_CreateForm);

	var _LocationForm = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LocationForm\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _LocationForm2 = _interopRequireDefault(_LocationForm);

	var _LocationItem = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LocationItem\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _LocationItem2 = _interopRequireDefault(_LocationItem);

	var _react = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _react2 = _interopRequireDefault(_react);

	var _SearchField = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-form-components/build/SearchField\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _SearchField2 = _interopRequireDefault(_SearchField);

	var _xhr = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"xhr\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _xhr2 = _interopRequireDefault(_xhr);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var loaded = {};

	module.exports = _react2.default.createClass({
	  displayName: 'exports',


	  propTypes: {

	    // general agenda info ( title, slug, )
	    agenda: _react2.default.PropTypes.object,

	    // optional settings of agenda ( such as tags requirements )
	    settings: _react2.default.PropTypes.object,

	    // server endpoints
	    res: _react2.default.PropTypes.object

	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      settings: {}
	    };
	  },
	  getInitialState: function getInitialState() {

	    return {
	      // merge mode enabled or not.
	      // if enabled, shows selection checkboxes on list
	      // and merge menu on top
	      merge: false,
	      loading: false,
	      form: false,
	      query: {},
	      locations: [],
	      page: 1,
	      total: null
	    };
	  },
	  componentWillMount: function componentWillMount() {
	    var _this = this;

	    this.actions = (0, _actions2.default)({
	      getState: function getState() {
	        return _this.state;
	      },
	      setState: function setState(newState) {
	        _this.setState(newState);
	      }
	    });
	  },
	  onSearchChange: function onSearchChange(field, newSearchValue) {

	    if (arguments.length == 1) {

	      newSearchValue = field;

	      field = 'search';
	    }

	    this.actions.queryChange(_actions2.default.updateSearchQuery(this.state.query, field, newSearchValue));
	  },
	  getCountryLabel: function getCountryLabel(code) {

	    if (loaded[code] === undefined) {

	      loaded[code] = _countries2.default.getLabel(code);
	    }

	    return loaded[code] !== null ? loaded[code][this.props.lang] : null;
	  },
	  getLabel: function getLabel(name, values) {

	    var str = _list2.default[name][this.props.lang],
	        k;

	    if (values) {

	      for (k in values) {

	        str = str.replace(k, values[k]);
	      }
	    }

	    return str;
	  },
	  renderItem: function renderItem(item, itemActions, itemIndex) {

	    return _react2.default.createElement(_LocationItem2.default, {
	      merge: this.state.merge,
	      key: item.uid,
	      location: item,
	      agenda: this.props.agenda,
	      onSelect: this.state.merge ? this.actions.toggleMergeItem.bind(null, item) : this.actions.editLocation.bind(null, item, itemIndex),
	      onEdit: this.actions.editLocation.bind(null, item, itemIndex),
	      onRemove: this.onRemoveLocation.bind(null, item, itemIndex),
	      getLabel: this.getLabel,
	      getCountryLabel: this.getCountryLabel });
	  },
	  onRemoveLocation: function onRemoveLocation(location, index) {

	    (0, _xhr2.default)({
	      uri: this.props.res.remove,
	      method: 'post',
	      headers: {
	        'X-Requested-With': 'XMLHttpRequest',
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({ uid: location.uid })
	    }, function (err, result) {

	      if (err || result.statusCode !== 200) {

	        log('error', err || result.statusCode);
	      } else {

	        if (JSON.parse(result.body).removed) {

	          _actions2.default.removedLocation(index);
	        }
	      }
	    });
	  },
	  renderHead: function renderHead() {

	    return _react2.default.createElement(
	      'div',
	      { className: 'head' },
	      Object.keys(this.state.query).length ? _react2.default.createElement(_Filters2.default, {
	        locations: this.state.locations,
	        query: this.state.query,
	        getLabel: this.getLabel,
	        onQueryChange: this.actions.queryChange }) : null,
	      this.state.total ? _react2.default.createElement(
	        'p',
	        null,
	        this.getLabel('total', { '%count%': this.state.total })
	      ) : null,
	      this.state.total === 0 ? _react2.default.createElement(
	        'p',
	        null,
	        this.getLabel('totalzero')
	      ) : null
	    );
	  },
	  launchMerge: function launchMerge() {
	    var _this2 = this;

	    if (!this.state.merge || !this.state.merge.locationUids.length) return;

	    (0, _get2.default)(this.props.res.index, {
	      uids: this.state.merge.locationUids
	    }, function (err, result) {

	      if (err) {

	        log('error', err);

	        return;
	      }

	      _this2.actions.launchMerge(result.items);
	    });
	  },
	  renderMergeMenu: function renderMergeMenu() {

	    return _react2.default.createElement(
	      'div',
	      { className: 'merge-menu' },
	      _react2.default.createElement(
	        'p',
	        null,
	        this.getLabel('mergedescription'),
	        ' ',
	        _react2.default.createElement(
	          'button',
	          {
	            onClick: this.launchMerge,
	            className: 'btn btn-primary' },
	          this.getLabel('launchmerge')
	        )
	      ),
	      this.state.merge.locationUids.length ? _react2.default.createElement(
	        'span',
	        { className: 'info' },
	        this.getLabel('mergeselection', { '%count%': this.state.merge.locationUids.length }),
	        _react2.default.createElement(
	          'a',
	          { onClick: this.onSearchChange.bind(null, 'uids', this.state.merge.locationUids) },
	          this.getLabel('seemergelist')
	        )
	      ) : _react2.default.createElement(
	        'span',
	        { className: 'info' },
	        this.getLabel('mergenoselection')
	      )
	    );
	  },
	  renderMergeAction: function renderMergeAction() {

	    return _react2.default.createElement(
	      'div',
	      { className: 'form-group' },
	      !this.state.merge ? _react2.default.createElement(
	        'button',
	        { className: 'btn btn-default', onClick: this.actions.toggleMerge.bind(null, true) },
	        this.getLabel('merge')
	      ) : _react2.default.createElement(
	        'button',
	        { className: 'btn btn-danger', onClick: this.actions.toggleMerge.bind(null, false) },
	        this.getLabel('cancelmerge')
	      )
	    );
	  },
	  getMode: function getMode() {

	    if (!this.state.form) return 'list';

	    if (this.state.form.suggestions && this.state.form.merge) return 'merge';

	    if (this.state.form.location) return 'update';

	    return 'create';
	  },
	  render: function render() {

	    switch (this.getMode()) {

	      case 'merge':
	        return _react2.default.createElement(
	          'div',
	          { className: 'agenda-admin-locations' },
	          _react2.default.createElement(_MergeForm2.default, _extends({}, this.props, { actions: this.actions }))
	        );

	      case 'create':
	        return _react2.default.createElement(
	          'div',
	          { className: 'agenda-admin-locations' },
	          _react2.default.createElement(_CreateForm2.default, _extends({}, this.props, { actions: this.actions }))
	        );

	      case 'update':
	        return _react2.default.createElement(
	          'div',
	          { className: 'agenda-admin-locations' },
	          _react2.default.createElement(_UpdateForm2.default, _extends({}, this.props, { actions: this.actions }))
	        );

	    }

	    return _react2.default.createElement(
	      'div',
	      { className: 'agenda-admin-locations' },
	      _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(
	          'div',
	          { className: 'row list-actions' },
	          _react2.default.createElement(
	            'div',
	            { className: 'col col-sm-12' },
	            _react2.default.createElement(
	              'div',
	              { className: 'form-inline' },
	              _react2.default.createElement(
	                'div',
	                { className: 'form-group' },
	                _react2.default.createElement(
	                  'button',
	                  {
	                    className: 'btn btn-primary',
	                    onClick: this.actions.newLocation.bind(null) },
	                  this.getLabel('create')
	                )
	              ),
	              this.renderMergeAction()
	            )
	          )
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'row list-filters' },
	          _react2.default.createElement(
	            'div',
	            { className: 'col col-sm-12' },
	            _react2.default.createElement(
	              'div',
	              { className: 'form-inline' },
	              _react2.default.createElement(
	                'div',
	                { className: 'form-group' },
	                _react2.default.createElement(_SearchField2.default, {
	                  value: this.state.query.search,
	                  label: this.getLabel('search'),
	                  placeholder: this.getLabel('search'),
	                  onChange: this.onSearchChange })
	              ),
	              _react2.default.createElement(
	                'div',
	                { className: 'checkbox' },
	                _react2.default.createElement(
	                  'label',
	                  null,
	                  _react2.default.createElement('input', {
	                    type: 'checkbox',
	                    onChange: this.onSearchChange.bind(null, 'state', this.state.query.state === 0 ? undefined : 0),
	                    checked: this.state.query.state === 0 }),
	                  ' ',
	                  this.getLabel('toverify')
	                )
	              )
	            )
	          )
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'row list' },
	          _react2.default.createElement(
	            'div',
	            { className: 'col col-sm-12' },
	            this.state.merge ? this.renderMergeMenu() : null,
	            _react2.default.createElement(_List2.default, {
	              res: this.props.res.index,
	              query: this.state.query,
	              renderItem: this.renderItem,
	              renderHead: this.renderHead,
	              items: this.state.locations,
	              page: this.state.page,
	              total: this.state.total,
	              onItemsUpdate: this.actions.updateLocationList })
	          )
	        )
	      )
	    );
	  }
	});

	function log() {

	  console.log.apply(console, arguments);
	}

/***/ }
/******/ ]);