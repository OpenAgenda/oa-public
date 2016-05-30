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
	  uploadRes: '#upload',
	  selectors: {
	    canvas: '.js_canvas'
	  },
	  useTags: false // display tags menu & category additional fields
	},
	    React = __webpack_require__(6),
	    ReactDom = __webpack_require__(7),
	    App = __webpack_require__(8);

	window.asap(function (options) {

	  deepExtend(params, options);

	  ReactDom.render(React.createElement(App, {
	    lang: params.lang,
	    tagSet: params.tagSet,
	    categorySet: params.categorySet,
	    uploadRes: params.uploadRes,
	    extraFeatures: params.useTags }), du.el(params.selectors.canvas));
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

	var _redboxReact2 = __webpack_require__(9);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(6);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(10);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/categories/js/App.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(6),
	    TagEditor = __webpack_require__(11),
	    CategoryEditor = __webpack_require__(18),
	    SyncButton = __webpack_require__(22),
	    Spinner = __webpack_require__(25),
	    FeatureRequest = __webpack_require__(28),
	    labels = {
	  tagFeatureTitle: {
	    fr: 'Essayez les tags d\'agenda',
	    en: 'Try agenda tags'
	  },
	  tagFeatureDescription: {
	    fr: 'Organisez vos événements via un ou plusieurs groupes de tags; nommez vos groupes, organisez et ordonnez-les pour offrir à vos utilisateurs des filtres plus adaptés à vos événements!',
	    en: 'Organize your events with one or more tag groups; organize and sort your tags to give the best possible selection of filters for your events!'
	  },
	  tagFeatureTeaser: {
	    fr: 'Faites plus avec des groupes de tags',
	    en: 'Do more with tag groups'
	  }
	},
	    tplEnv = window.env == 'tpl';

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      tagSet: this.props.tagSet,
	      categorySet: this.props.categorySet,
	      synced: true,
	      syncError: false,
	      loading: false
	    };
	  },

	  onSetUpdate: function onSetUpdate(setType) {

	    var self = this;

	    return function (newSet, maintainSync) {

	      var update = { synced: !!maintainSync };

	      update[setType] = newSet;

	      self.setState(update);
	    };
	  },

	  onSend: function onSend() {

	    this.setState({
	      loading: true
	    });
	  },

	  onResponse: function onResponse(err) {

	    this.setState({
	      loading: false,
	      synced: !err,
	      syncError: err
	    });
	  },

	  renderFeatureRequest: function renderFeatureRequest() {

	    return React.createElement(FeatureRequest, {
	      lang: this.props.lang,
	      labels: {
	        title: labels.tagFeatureTitle,
	        teaser: labels.tagFeatureTeaser,
	        description: labels.tagFeatureDescription
	      },
	      res: tplEnv ? "#featurerequest" : "/featurerequest" });
	  },

	  renderTagSection: function renderTagSection() {

	    return React.createElement(TagEditor, {
	      lang: this.props.lang,
	      set: this.state.tagSet,
	      onSetUpdate: this.onSetUpdate('tagSet') });
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'div',
	        { className: 'tc-edge' },
	        React.createElement(SyncButton, {
	          lang: this.props.lang,
	          res: this.props.uploadRes,
	          onSend: this.onSend,
	          onResponse: this.onResponse,
	          synced: this.state.synced,
	          syncError: this.state.syncError,
	          data: {
	            tagSet: this.state.tagSet,
	            categorySet: this.state.categorySet
	          } })
	      ),
	      React.createElement(CategoryEditor, {
	        extraFeatures: this.props.extraFeatures,
	        lang: this.props.lang,
	        set: this.state.categorySet,
	        onSetUpdate: this.onSetUpdate('categorySet') }),
	      this.props.extraFeatures ? this.renderTagSection() : '',
	      React.createElement(
	        'div',
	        { className: 'tc-edge' },
	        React.createElement(SyncButton, {
	          lang: this.props.lang,
	          res: this.props.uploadRes,
	          onSend: this.onSend,
	          onResponse: this.onResponse,
	          synced: this.state.synced,
	          syncError: this.state.syncError,
	          data: {
	            tagSet: this.state.tagSet,
	            categorySet: this.state.categorySet
	          } }),
	        this.props.extraFeatures ? '' : this.renderFeatureRequest()
	      ),
	      React.createElement(Spinner, {
	        loading: this.state.loading })
	    );
	  }

	}));

/***/ },
/* 9 */
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
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12),
	    update = __webpack_require__(13),
	    actions = __webpack_require__(14),
	    labels = __webpack_require__(15),
	    _getLabel = __webpack_require__(16)(labels),
	    GroupRemove = __webpack_require__(17);

	module.exports = React.createClass({
	  displayName: 'exports',


	  componentWillMount: function componentWillMount() {

	    var decoratedGroups = this.props.set.groups.map(this.decorateGroup);

	    this.props.onSetUpdate(update(this.props.set, {
	      groups: { $set: decoratedGroups }
	    }), true);
	  },

	  decorateGroup: function decorateGroup(g) {

	    if (!g) g = { tags: [] };

	    g.toAdd = {
	      value: '',
	      error: false
	    };

	    g.editing = false;

	    g.labelsEdit = {
	      name: {
	        value: g.name || '',
	        error: false
	      },
	      info: {
	        value: g.info || '',
	        error: false
	      }
	    };

	    return g;
	  },

	  onMove: function onMove(groupIndex, index, moves) {

	    var self = this;

	    return function () {

	      var newTags = self.props.set.groups[groupIndex].tags.slice(),
	          changes;

	      self.move(newTags, index, index + moves);

	      changes = self.getGroupChanges(groupIndex, { tags: { $set: newTags } });

	      self.props.onSetUpdate(update(self.props.set, changes));
	    };
	  },

	  onEdit: function onEdit(groupIndex, index) {

	    var group = this.props.set.groups[groupIndex];

	    if (group.edit) return;

	    var changes = this.getGroupChanges(groupIndex, { edit: { $set: {
	          tagIndex: index,
	          value: group.tags[index].label
	        } } });

	    this.props.onSetUpdate(update(this.props.set, changes));
	  },

	  onTagEditChange: function onTagEditChange(groupIndex) {

	    var self = this;

	    return function (e) {

	      var changes = actions.tagEditChange(self.props.set, groupIndex, e.target.value);

	      if (!changes) return;

	      self.props.onSetUpdate(changes);
	    };
	  },

	  /**
	   * get groups ( decorated with their index in full group list )
	   * where there is a tag matching tag in tagGroup at tagIndex
	   */

	  getIndexedTagGroups: function getIndexedTagGroups(tagGroup, tagIndex) {

	    var tagValue = tagGroup.tags[tagIndex].label;

	    return this.props.set.groups.map(function (g, i) {

	      g.index = i;

	      return g; // add group index
	    }).filter(function (group) {

	      return group.tags.filter(function (t) {
	        return t.label == tagValue;
	      }).length;
	    });
	  },

	  onTagEditCancel: function onTagEditCancel(groupIndex) {

	    var group = this.props.set.groups[groupIndex],
	        changes = this.getGroupChanges(groupIndex, {
	      edit: {
	        $set: false
	      }
	    });

	    this.props.onSetUpdate(update(this.props.set, changes));
	  },

	  onTagEditCommit: function onTagEditCommit(groupIndex, keyDown) {

	    var self = this;

	    return function (e) {

	      if (keyDown && e.keyCode !== 13) return;

	      var changes = actions.tagEditCommit(self.props.set, groupIndex);

	      if (!changes) return;

	      self.props.onSetUpdate(changes);
	    };
	  },

	  onRemove: function onRemove(groupIndex, index) {

	    var self = this;

	    return function () {

	      var changes = self.getGroupChanges(groupIndex, { tags: {
	          $splice: [[index, 1]]
	        } });

	      self.props.onSetUpdate(update(self.props.set, changes));
	    };
	  },

	  onAddChange: function onAddChange(groupIndex) {

	    var self = this;

	    return function (e) {

	      var changes = actions.tagAddChange(self.props.set, groupIndex, e.target.value);

	      self.props.onSetUpdate(changes);
	    };
	  },

	  onAddGroup: function onAddGroup() {

	    this.props.onSetUpdate(update(this.props.set, {
	      groups: {
	        $push: [this.decorateGroup()]
	      }
	    }));
	  },

	  onGroupLabelChange: function onGroupLabelChange(groupIndex, type) {

	    var self = this;

	    return function (e) {

	      var changes = actions.groupLabelChange(self.props.set, groupIndex, type, e.target.value);

	      self.props.onSetUpdate(changes);
	    };
	  },

	  onGroupRequiredChange: function onGroupRequiredChange(groupIndex) {

	    this.props.onSetUpdate(actions.groupRequiredToggle(this.props.set, groupIndex));
	  },

	  onRemoveGroup: function onRemoveGroup(groupIndex) {

	    this.props.onSetUpdate(actions.groupRemove(this.props.set, groupIndex));
	  },

	  onAddCommit: function onAddCommit(groupIndex, keyDown) {

	    var self = this;

	    return function (e) {

	      if (keyDown && e.keyCode !== 13) return;

	      self.props.onSetUpdate(actions.tagAddCommit(self.props.set, groupIndex));
	    };
	  },

	  getLabel: function getLabel(code, values) {

	    return _getLabel(code, values, this.props.lang);
	  },

	  getGroupChanges: function getGroupChanges(groupIndex, groupChanges) {

	    var changes = { groups: {} };

	    changes.groups[groupIndex] = groupChanges;

	    return changes;
	  },

	  renderTag: function renderTag(group, groupIndex, tag, tagIndex) {

	    return React.createElement(
	      'li',
	      { key: tagIndex, className: 'tc-item' },
	      React.createElement(
	        'div',
	        { className: 'tc-actions' },
	        !group.edit ? React.createElement('i', { className: 'fa fa-edit', onClick: this.onEdit.bind(null, groupIndex, tagIndex) }) : React.createElement('i', { className: 'fa fa-edit disabled' }),
	        !group.edit ? React.createElement('i', { className: 'fa fa-trash', onClick: this.onRemove(groupIndex, tagIndex) }) : React.createElement('i', { className: 'fa fa-trash disabled' }),
	        tagIndex > 0 && !group.edit ? React.createElement('i', { className: 'fa fa-angle-up', onClick: this.onMove(groupIndex, tagIndex, -1) }) : React.createElement('i', { className: 'fa fa-angle-up disabled' }),
	        tagIndex < group.tags.length - 1 && !group.edit ? React.createElement('i', { className: 'fa fa-angle-down', onClick: this.onMove(groupIndex, tagIndex, 1) }) : React.createElement('i', { className: 'fa fa-angle-down disabled' })
	      ),
	      React.createElement(
	        'span',
	        null,
	        tag.label
	      )
	    );
	  },

	  renderTagEdit: function renderTagEdit(group, groupIndex, tag, tagIndex) {

	    return React.createElement(
	      'li',
	      { key: tagIndex, className: 'tc-item' },
	      React.createElement(
	        'div',
	        { className: group.edit.error ? 'input-group error' : 'input-group' },
	        React.createElement('input', {
	          type: 'text',
	          value: group.edit.value,
	          onChange: this.onTagEditChange(groupIndex),
	          onKeyDown: this.onTagEditCommit(groupIndex, true),
	          className: 'form-control' }),
	        React.createElement(
	          'span',
	          { className: 'input-group-btn' },
	          React.createElement(
	            'button',
	            {
	              className: 'btn btn-default',
	              type: 'button',
	              onClick: this.onTagEditCancel.bind(null, groupIndex) },
	            this.getLabel('cancelUpdateTag')
	          ),
	          React.createElement(
	            'button',
	            {
	              className: 'btn btn-primary',
	              disabled: group.edit.error,
	              onClick: this.onTagEditCommit(groupIndex),
	              type: 'button' },
	            this.getLabel('updateTag')
	          )
	        )
	      )
	    );
	  },

	  renderGroupTags: function renderGroupTags(groupIndex) {

	    var self = this,
	        group = this.props.set.groups[groupIndex];

	    return React.createElement(
	      'ul',
	      { className: 'tc-list list-unstyled' },
	      group.tags.map(function (tag, i) {
	        return (group.edit && group.edit.tagIndex == i ? self.renderTagEdit : self.renderTag)(group, groupIndex, tag, i);
	      })
	    );
	  },

	  renderGroup: function renderGroup(group, i) {

	    return React.createElement(
	      'li',
	      { key: i, className: 'list-item tc-group' },
	      React.createElement(
	        'div',
	        { className: group.labelsEdit.name.error ? 'form-group error' : 'form-group' },
	        React.createElement(
	          'label',
	          { 'for': 'group-name' },
	          this.getLabel('groupName')
	        ),
	        React.createElement('input', {
	          placeholder: this.getLabel('groupNameInfo'),
	          onChange: this.onGroupLabelChange(i, 'name'),
	          name: 'group-name',
	          value: group.labelsEdit.name.value,
	          type: 'text',
	          className: 'form-control' })
	      ),
	      React.createElement(
	        'div',
	        { className: 'checkbox' },
	        React.createElement(
	          'label',
	          null,
	          React.createElement('input', {
	            type: 'checkbox',
	            onChange: this.onGroupRequiredChange.bind(null, i),
	            checked: group.required }),
	          ' ',
	          this.getLabel('required')
	        )
	      ),
	      React.createElement(
	        'div',
	        { className: group.labelsEdit.info.error ? 'form-group error' : 'form-group' },
	        React.createElement(
	          'label',
	          { 'for': 'group-info' },
	          this.getLabel('groupInfo')
	        ),
	        React.createElement('input', {
	          placeholder: this.getLabel('groupInfoInfo'),
	          onChange: this.onGroupLabelChange(i, 'info'),
	          name: 'group-name',
	          value: group.labelsEdit.info.value,
	          type: 'text',
	          className: 'form-control' })
	      ),
	      group.tags.length ? React.createElement(
	        'label',
	        null,
	        this.getLabel('tagListTitle')
	      ) : '',
	      this.renderGroupTags(i),
	      React.createElement(
	        'label',
	        { 'for': 'add-tag' },
	        this.getLabel('addTag')
	      ),
	      React.createElement(
	        'div',
	        { className: 'form-inline add' },
	        React.createElement(
	          'div',
	          { className: 'form-group' },
	          React.createElement('input', {
	            type: 'text',
	            name: 'add-tag',
	            className: 'form-control',
	            value: group.toAdd.value,
	            onChange: this.onAddChange(i),
	            onKeyDown: this.onAddCommit(i, true) })
	        ),
	        React.createElement(
	          'button',
	          {
	            type: 'submit',
	            className: 'btn btn-primary',
	            onClick: this.onAddCommit(i) },
	          this.getLabel('add')
	        )
	      ),
	      React.createElement(GroupRemove, {
	        key: i,
	        group: group,
	        getLabel: this.getLabel,
	        onRemove: this.onRemoveGroup.bind(null, i) }),
	      group.toAdd.error ? React.createElement(
	        'span',
	        { className: 'error' },
	        this.getLabel(group.toAdd.error)
	      ) : ''
	    );
	  },

	  render: function render() {

	    var self = this;

	    return React.createElement(
	      'div',
	      { className: 'tc-editor' },
	      React.createElement(
	        'div',
	        { className: 'tc-title' },
	        React.createElement(
	          'h2',
	          null,
	          this.getLabel('tags')
	        ),
	        React.createElement(
	          'p',
	          null,
	          this.getLabel('subtitle')
	        )
	      ),
	      React.createElement(
	        'ul',
	        { className: 'list-unstyled' },
	        this.props.set.groups.map(self.renderGroup)
	      ),
	      React.createElement(
	        'div',
	        { className: 'menu-bottom' },
	        React.createElement(
	          'button',
	          {
	            type: 'submit',
	            className: 'btn btn-primary',
	            onClick: self.onAddGroup },
	          self.getLabel('addGroup')
	        )
	      )
	    );
	  },

	  move: function move(arr, oldIndex, newIndex) {

	    if (newIndex >= arr.length) {

	      var k = newIndex - arr.length;

	      while (k-- + 1) {

	        arr.push(undefined);
	      }
	    }

	    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
	  }

	});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/update\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var update = __webpack_require__(13),
	    ERRORS = {
	  EMPTY: 'empty',
	  DUPLICATE: 'duplicate'
	};

	module.exports = {
	  tagEditCommit: tagEditCommit,
	  tagEditChange: tagEditChange,
	  tagAddCommit: tagAddCommit,
	  tagAddChange: tagAddChange,
	  groupLabelChange: groupLabelChange,
	  groupRequiredToggle: groupRequiredToggle,
	  groupRemove: groupRemove
	};

	function groupRemove(set, groupIndex) {

	  return update(set, {
	    groups: {
	      $splice: [[groupIndex, 1]]
	    }
	  });
	}

	/**
	 * update a tag addition as user types ( no assess )
	 */

	function tagAddChange(set, groupIndex, value) {

	  return update(set, _getGroupChanges(groupIndex, {
	    toAdd: { value: { $set: value } }
	  }));
	}

	/**
	 * assess existing tag change and return changes on set
	 *
	 * there can be only one value being edited in any
	 * given time. value is the value being edited in
	 * in group of index groupIndex.
	 */

	function tagEditChange(set, groupIndex, value) {

	  // fetch groups where tag is present
	  var group = set.groups[groupIndex],
	      changes,
	      duplicates,
	      error,
	      tagIndex = set.groups[groupIndex].edit.tagIndex;

	  // look for duplicates in groups where tag is present
	  set.groups.forEach(function (g, gi) {

	    g.index = gi;

	    duplicates = g.tags.filter(function (t, i) {

	      if (gi == groupIndex && tagIndex == i) {

	        return false;
	      }

	      return t.label == value;
	    });

	    if (duplicates.length) {

	      error = true;
	    }
	  });

	  if (!value.length) {

	    error = true;
	  }

	  changes = _getGroupChanges(groupIndex, { edit: {
	      value: { $set: value },
	      error: { $set: error }
	    } });

	  return update(set, changes);
	}

	function tagAddCommit(set, groupIndex) {

	  var toAddError = _getAddError(set, groupIndex),
	      value = set.groups[groupIndex].toAdd.value,
	      changes = {
	    toAdd: {
	      $set: {
	        error: toAddError,
	        value: toAddError ? value : ''
	      }
	    }
	  },
	      twinTag;

	  if (!toAddError) {

	    changes.tags = {
	      $push: [{
	        label: value
	      }]
	    };

	    twinTag = _findTabByLabel(set, value);

	    if (twinTag && twinTag.id) {

	      changes.tags.$push[0].id = twinTag.id;
	    }
	  }

	  return update(set, _getGroupChanges(groupIndex, changes));
	}

	/**
	 * assess tag change commit and return changes on set
	 */

	function tagEditCommit(set, groupIndex) {

	  var group = set.groups[groupIndex],
	      changes = { groups: {} };

	  if (group.edit.error) {

	    return false;
	  }

	  _getIndexedTagGroups(set, group, group.edit.tagIndex).forEach(function (g) {

	    g.tags.forEach(function (gt, ti) {

	      if (gt.label !== group.tags[group.edit.tagIndex].label) return;

	      // tag is same, it needs to be updated.

	      if (!changes.groups[g.index]) {

	        changes.groups[g.index] = { tags: {} };
	      }

	      changes.groups[g.index].tags[ti] = { label: { $set: group.edit.value } };
	    });
	  });

	  changes.groups[groupIndex].edit = { $set: false };

	  return update(set, changes);
	}

	/**
	 * self explanatory.
	 */

	function groupRequiredToggle(set, groupIndex) {

	  return update(set, _getGroupChanges(groupIndex, {
	    required: {
	      $set: !set.groups[groupIndex].required
	    }
	  }));
	}

	/**
	 * assess validity of proposed change and update tmp set data
	 */

	function groupLabelChange(set, groupIndex, type, value) {

	  var error = false,
	      editUpdate = {},
	      proposedUpdate,
	      existingLabelEdits;

	  editUpdate[type] = { value: { $set: value } };

	  proposedUpdate = update(set, _getGroupChanges(groupIndex, {
	    labelsEdit: editUpdate
	  }));

	  existingLabelEdits = proposedUpdate.groups.map(function (g) {

	    return g.labelsEdit[type].value;
	  });

	  proposedUpdate.groups.forEach(function (g, i) {

	    var duplicates = proposedUpdate.groups.filter(function (d, di) {

	      return di !== i && d.labelsEdit[type].value == g.labelsEdit[type].value;
	    });

	    proposedUpdate.groups[i].labelsEdit[type].error = false;

	    if (type == 'name' && g.labelsEdit[type].value.length && duplicates.length) {

	      // there is a non empty duplicate
	      proposedUpdate.groups[i].labelsEdit[type].error = true;
	    } else {

	      proposedUpdate.groups[i][type] = g.labelsEdit[type].value;
	    }
	  });

	  return proposedUpdate;
	}

	/**
	 * wrap changes inside a 'groups' key
	 */

	function _getGroupChanges(groupIndex, groupChanges) {

	  var changes = { groups: {} };

	  changes.groups[groupIndex] = groupChanges;

	  return changes;
	}

	/**
	 * get groups ( decorated with their index in full group list )
	 * where there is a tag matching tag in tagGroup at tagIndex
	 */

	function _getIndexedTagGroups(set, tagGroup, tagIndex) {

	  var tagValue = tagGroup.tags[tagIndex].label;

	  return set.groups.map(function (g, i) {

	    g.index = i;

	    return g; // add group index
	  }).filter(function (group) {

	    return group.tags.filter(function (t) {
	      return t.label == tagValue;
	    }).length;
	  });
	}

	/**
	 * assess error as a tag is to be added to group
	 */

	function _getAddError(set, groupIndex) {

	  var value = set.groups[groupIndex].toAdd.value,
	      isDuplicate = false;

	  // field cannot be empty

	  if (value.length == 0) {

	    return ERRORS.EMPTY;
	  }

	  // tag cannot be a duplicate of another in the any group

	  set.groups.forEach(function (group) {

	    if (group.tags.filter(function (existingTag) {

	      return value == existingTag.label;
	    }).length) {

	      isDuplicate = true;
	    }
	  });

	  if (isDuplicate) {

	    return ERRORS.DUPLICATE;
	  }

	  return false;
	}

	function _findTabByLabel(set, label) {

	  var found = false;

	  set.groups.forEach(function (group) {

	    if (found) return;

	    var sames = group.tags.filter(function (t) {
	      return t.label == label;
	    });

	    if (sames.length) found = sames[0];
	  });

	  return found;
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  groupName: {
	    en: 'Group name',
	    fr: 'Nom du groupe'
	  },
	  groupNameInfo: {
	    en: '',
	    fr: ''
	  },
	  groupInfo: {
	    en: 'Information text',
	    fr: 'Texte indicatif'
	  },
	  groupInfoInfo: {
	    en: 'Leave empty to keep default text',
	    fr: 'Laissez vide pour garder le texte par défaut'
	  },
	  tagListTitle: {
	    en: 'Group tags',
	    fr: 'Tags du groupe'
	  },
	  empty: {
	    en: 'the tag name cannot be empty',
	    fr: 'le tag ne peut être vide'
	  },
	  duplicate: {
	    en: 'this tag already exists in this group',
	    fr: 'ce tag est déjà existant dans ce groupe'
	  },
	  tags : {
	    en: 'Tags',
	    fr: 'Tags'
	  },
	  subtitle : {
	    en: 'Tags form a single or multiple selection lists',
	    fr: 'Les tags forment une ou plusieurs listes à choix'
	  },
	  compulsory : {
	    en: 'Compulsory field',
	    fr: 'Champ obligatoire'
	  },
	  listName : {
	    en: 'Name of the list',
	    fr: 'Intitulé de la liste'
	  },
	  listSection : {
	    en: 'Agenda tags',
	    fr: 'Tags de l\'agenda'
	  },
	  add : {
	    en: 'Add',
	    fr: 'Ajouter'
	  },
	  addTag: {
	    en: 'Add a tag',
	    fr: 'Ajouter un tag'
	  },
	  addGroup: {
	    en: 'Add a tag group',
	    fr: 'Ajouter un groupe de tags'
	  },
	  deleteGroup: {
	    en: 'Delete group',
	    fr: 'Supprimer le groupe'
	  },
	  cancelDeleteGroup: {
	    en: 'Cancel',
	    fr: 'Annuler'
	  },
	  confirmDeleteGroup: {
	    en: 'There are %count% tags in this group. Are you sure?',
	    fr: 'Il y a %count% tags dans ce groupe, êtes vous sûr de vouloir le supprimer?'
	  },
	  confirm: {
	    en: 'Yes',
	    fr: 'Oui'
	  },
	  noTags: {
	    en: 'You haven\'t yet defined any tags for this agenda',
	    fr: 'Vous n\'avez encore défini aucune tags pour cet agenda'
	  },
	  linkError: {
	    en: 'An error occurred while saving your data. Please try again later',
	    fr: 'Une erreur est survenue lors de la sauvegarde de vos données. Veuillez retenter l\'opération sous peu.'
	  },
	  updateTag: {
	    en: 'Ok',
	    fr: 'Ok'
	  },
	  cancelUpdateTag: {
	    en: 'Cancel',
	    fr: 'Annuler'
	  },
	  required: {
	    en: 'Make required. At least one tag must be selected.',
	    fr: 'Rendre obligatoire. Au moins un tag doit être sélectionné.'
	  }
	}

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * provide a labels getter that will
	 * give back labels fed at init
	 */

	module.exports = function( labels ) {

	  return function( name, values, lang ) {

	    if ( arguments.length == 2 && typeof values == 'string' ) {

	      lang = values;
	      values = {};

	    }

	    if ( !lang ) lang = 'en';

	    if ( !labels[ name ] ) return null;

	    var str = labels[ name ][ lang ], k;

	    if ( values ) {

	      for( k in values ) {

	        str = str.replace( '%' + k + '%', values[ k ] );

	      }

	    }

	    return str;

	  }

	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12);

	module.exports = React.createClass({
	  displayName: "exports",


	  propTypes: {
	    group: React.PropTypes.object,
	    onRemove: React.PropTypes.func,
	    getLabel: React.PropTypes.func
	  },

	  getInitialState: function getInitialState() {

	    return {
	      confirm: false
	    };
	  },

	  evaluate: function evaluate(e) {

	    e.preventDefault();

	    if (!this.props.group.tags.length) {

	      return this.props.onRemove();
	    }

	    this.setState({ confirm: true });
	  },

	  cancel: function cancel(e) {

	    e.preventDefault();

	    this.setState({ confirm: false });
	  },

	  render: function render() {

	    return React.createElement(
	      "div",
	      { className: "tc-remove" },
	      this.state.confirm ? React.createElement(
	        "div",
	        { className: "tc-remove-confirm" },
	        React.createElement(
	          "span",
	          null,
	          this.props.getLabel('confirmDeleteGroup', { count: this.props.group.tags.length })
	        ),
	        React.createElement(
	          "div",
	          null,
	          React.createElement(
	            "a",
	            { className: "btn btn-danger", onClick: this.props.onRemove },
	            this.props.getLabel('deleteGroup')
	          ),
	          React.createElement(
	            "a",
	            { className: "btn btn-default", onClick: this.cancel },
	            this.props.getLabel('cancelDeleteGroup')
	          )
	        )
	      ) : React.createElement(
	        "a",
	        { className: "tc-remove-link", onClick: this.evaluate },
	        this.props.getLabel('deleteGroup')
	      )
	    );
	  }

	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(19),
	    update = __webpack_require__(20),
	    ERRORS = {
	  EMPTY: 'empty',
	  DUPLICATE: 'duplicate'
	},
	    labels = __webpack_require__(21);

	module.exports = React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      name: 'Catégories',
	      toAdd: {
	        value: '',
	        error: false
	      },
	      edit: false
	    };
	  },

	  onMove: function onMove(index, moves) {

	    var self = this;

	    return function () {

	      var newCategories = self.props.set.categories.slice();

	      self.move(newCategories, index, index + moves);

	      self.props.onSetUpdate(update(self.props.set, {
	        categories: { $set: newCategories }
	      }));
	    };
	  },

	  onEdit: function onEdit(i) {

	    this.setState({
	      edit: {
	        index: i,
	        value: this.props.set.categories[i].label
	      }
	    });
	  },

	  onAddChange: function onAddChange(e) {

	    this.setState({
	      toAdd: {
	        error: this.evaluateError(true, false, e.target.value),
	        value: e.target.value
	      }
	    });
	  },

	  onAddCommit: function onAddCommit(keyDown) {

	    var self = this;

	    return function (e) {

	      if (keyDown && e.keyCode !== 13) return;

	      var newCategories,
	          error = self.evaluateError(true),
	          value = self.state.toAdd.value;

	      self.setState(update(self.state, {
	        toAdd: {
	          error: { $set: error },
	          value: { $set: error ? value : '' }
	        }
	      }));

	      if (error) return;

	      newCategories = self.props.set.categories.slice();

	      newCategories.push({ label: self.state.toAdd.value });

	      self.props.onSetUpdate(update(self.props.set, {
	        categories: {
	          $set: newCategories
	        }
	      }));
	    };
	  },

	  getLabel: function getLabel(code) {

	    return labels[code][this.props.lang];
	  },

	  evaluateError: function evaluateError(evaluateEmpty, categories, value) {

	    var error = false,
	        value = value !== undefined ? value : this.state.toAdd.value,
	        self = this;

	    if (evaluateEmpty && value.length == 0) {

	      error = ERRORS.EMPTY;
	    } else {

	      if ((categories || this.props.set.categories).filter(function (c) {

	        return value == c.label;
	      }).length) {

	        error = ERRORS.DUPLICATE;
	      }
	    }

	    return error;
	  },

	  onRemove: function onRemove(index) {

	    this.props.onSetUpdate(update(this.props.set, {
	      categories: {
	        $splice: [[index, 1]]
	      }
	    }));
	  },

	  onEditChange: function onEditChange(e) {

	    this.setState(update(this.state, {
	      edit: {
	        value: { $set: e.target.value },
	        error: { $set: this.evaluateEditError(e.target.value) }
	      }
	    }));
	  },

	  onEditCommit: function onEditCommit(keyDown) {

	    var self = this;

	    return function (e) {

	      var updatedCategories = {};

	      if (keyDown && e.keyCode !== 13) return;

	      if (self.evaluateEditError(self.state.edit.value)) return;

	      self.setState(update(self.state, {
	        edit: { $set: false }
	      }));

	      updatedCategories[self.state.edit.index] = {
	        label: { $set: self.state.edit.value }
	      };

	      self.props.onSetUpdate(update(self.props.set, {
	        categories: updatedCategories
	      }));
	    };
	  },

	  onEditCancel: function onEditCancel() {

	    this.setState({
	      edit: false
	    });
	  },

	  onRequiredChange: function onRequiredChange(e) {

	    this.props.onSetUpdate(update(this.props.set, {
	      required: {
	        $set: e.target.checked
	      }
	    }));
	  },

	  onLabelChange: function onLabelChange(type) {

	    var self = this;

	    return function (e) {

	      var changes = {};

	      changes[type] = { $set: e.target.value };

	      self.props.onSetUpdate(update(self.props.set, changes));
	    };
	  },

	  evaluateEditError: function evaluateEditError(value) {

	    var self = this,
	        error = false,
	        duplicates = this.props.set.categories.filter(function (c, i) {

	      return i !== self.state.edit.index && c.label == value;
	    });

	    return !value.length || duplicates.length;
	  },

	  renderCategoryEdit: function renderCategoryEdit(cat, i) {

	    var edit = this.state.edit;

	    return React.createElement(
	      'li',
	      { key: i, className: 'tc-item' },
	      React.createElement(
	        'div',
	        { className: edit.error ? 'input-group error' : 'input-group' },
	        React.createElement('input', {
	          type: 'text',
	          value: edit.value,
	          onChange: this.onEditChange,
	          onKeyDown: this.onEditCommit(true),
	          className: 'form-control' }),
	        React.createElement(
	          'span',
	          { className: 'input-group-btn' },
	          React.createElement(
	            'button',
	            {
	              className: 'btn btn-default',
	              type: 'button',
	              onClick: this.onEditCancel },
	            this.getLabel('cancelUpdateTag')
	          ),
	          React.createElement(
	            'button',
	            {
	              className: 'btn btn-primary',
	              disabled: edit.error,
	              onClick: this.onEditCommit(),
	              type: 'button' },
	            this.getLabel('updateTag')
	          )
	        )
	      )
	    );
	  },

	  renderCategory: function renderCategory(cat, i) {

	    return React.createElement(
	      'li',
	      { key: i, className: 'tc-item' },
	      React.createElement(
	        'div',
	        { className: 'tc-actions' },
	        !this.edit ? React.createElement('i', { className: 'fa fa-edit', onClick: this.onEdit.bind(null, i) }) : React.createElement('i', { className: 'fa fa-edit disabled' }),
	        !this.edit ? React.createElement('i', { className: 'fa fa-trash', onClick: this.onRemove.bind(null, i) }) : React.createElement('i', { className: 'fa fa-trash disabled' }),
	        !this.edit && i > 0 ? React.createElement('i', { className: 'fa fa-angle-up', onClick: this.onMove(i, -1) }) : React.createElement('i', { className: 'fa fa-angle-up disabled' }),
	        !this.edit && i < this.props.set.categories.length - 1 ? React.createElement('i', { className: 'fa fa-angle-down', onClick: this.onMove(i, 1) }) : React.createElement('i', { className: 'fa fa-angle-down disabled' })
	      ),
	      React.createElement(
	        'span',
	        null,
	        cat.label
	      )
	    );
	  },

	  renderCategoryList: function renderCategoryList() {

	    var self = this;

	    return React.createElement(
	      'ul',
	      { className: 'tc-list list-unstyled' },
	      this.props.set.categories.map(function (cat, i) {

	        return self.state.edit && self.state.edit.index == i ? self.renderCategoryEdit(cat, i) : self.renderCategory(cat, i);
	      })
	    );
	  },

	  renderExtraFeatures: function renderExtraFeatures() {

	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'div',
	        { className: 'form-group' },
	        React.createElement(
	          'label',
	          { 'for': 'categorylistname' },
	          this.getLabel('listName')
	        ),
	        React.createElement('input', {
	          type: 'text',
	          name: 'categorylistname',
	          value: this.props.set.name,
	          className: 'form-control',
	          placeholder: this.getLabel('categories'),
	          onChange: this.onLabelChange('name') })
	      ),
	      React.createElement(
	        'div',
	        { className: 'form-group' },
	        React.createElement(
	          'label',
	          { 'for': 'categorylistinfo' },
	          this.getLabel('listInfo')
	        ),
	        React.createElement('input', {
	          type: 'text',
	          name: 'categorylistinfo',
	          value: this.props.set.info,
	          className: 'form-control',
	          placeholder: this.getLabel('subtitle'),
	          onChange: this.onLabelChange('info') })
	      ),
	      React.createElement(
	        'div',
	        { className: 'checkbox' },
	        React.createElement(
	          'label',
	          null,
	          React.createElement('input', {
	            type: 'checkbox',
	            onChange: this.onRequiredChange,
	            checked: this.props.set.required }),
	          '  ',
	          this.getLabel('required')
	        )
	      )
	    );
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      { className: 'tc-editor' },
	      React.createElement(
	        'h2',
	        null,
	        this.getLabel('categories')
	      ),
	      React.createElement(
	        'p',
	        null,
	        this.getLabel('subtitle')
	      ),
	      React.createElement(
	        'div',
	        null,
	        this.props.extraFeatures ? this.renderExtraFeatures() : ''
	      ),
	      React.createElement(
	        'div',
	        null,
	        React.createElement(
	          'label',
	          null,
	          this.getLabel('listSection')
	        ),
	        this.props.set.categories.length ? this.renderCategoryList() : React.createElement(
	          'p',
	          null,
	          this.getLabel('noCategories')
	        )
	      ),
	      React.createElement(
	        'div',
	        { className: 'form-inline add' },
	        React.createElement(
	          'div',
	          { className: !this.state.toAdd.error ? 'form-group' : 'form-group error' },
	          React.createElement('input', {
	            type: 'text',
	            className: 'form-control',
	            value: this.state.toAdd.value,
	            onKeyDown: this.onAddCommit(true),
	            onChange: this.onAddChange })
	        ),
	        React.createElement(
	          'button',
	          {
	            type: 'submit',
	            className: 'btn btn-primary',
	            onClick: this.onAddCommit(),
	            disabled: this.state.toAdd.error },
	          this.getLabel('add')
	        )
	      ),
	      this.state.toAdd.error ? React.createElement(
	        'span',
	        { className: 'error' },
	        this.getLabel(this.state.toAdd.error)
	      ) : ''
	    );
	  },

	  move: function move(arr, oldIndex, newIndex) {

	    if (newIndex >= arr.length) {

	      var k = newIndex - arr.length;

	      while (k-- + 1) {

	        arr.push(undefined);
	      }
	    }

	    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
	  }

	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/update\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  empty: {
	    en: 'the category name cannot be empty',
	    fr: 'la categorie ne peut être vide'
	  },
	  duplicate: {
	    en: 'this category already exists',
	    fr: 'cette catégorie est déjà existante'
	  },
	  categories : {
	    en: 'Categories',
	    fr: 'Catégories'
	  },
	  subtitle : {
	    en: 'Categories form a single selection list',
	    fr: 'Les catégories forment une liste à choix uniques'
	  },
	  listName : {
	    en: 'Name of the list',
	    fr: 'Intitulé de la liste'
	  },
	  listInfo: {
	    en: 'Information field',
	    fr: 'Champ indicatif'
	  },
	  listSection : {
	    en: 'Agenda categories',
	    fr: 'Catégories de l\'agenda'
	  },
	  add : {
	    en: 'Add',
	    fr: 'Ajouter'
	  },
	  noCategories: {
	    en: 'You haven\'t yet defined any categories for this agendda',
	    fr: 'Vous n\'avez encore défini aucune catégorie pour cet agenda'
	  },
	  linkError: {
	    en: 'An error occurred while saving your data. Please try again later',
	    fr: 'Une erreur est survenue lors de la sauvegarde de vos données. Veuillez retenter l\'opération sous peu.'
	  },
	  cancelUpdateTag: {
	    en: 'Cancel',
	    fr: 'Annuler'
	  },
	  updateTag: {
	    en: 'Ok',
	    fr: 'Ok'
	  },
	  required: {
	    en: 'Make required. One category must be selected.',
	    fr: 'Rendre obligatoire. Une catégorie devra être sélectionnée.'
	  }
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(23),
	    xhr = __webpack_require__(24),
	    links = {},
	    // update links refed by resource

	labels = {
	  update: {
	    en: 'Apply changes',
	    fr: 'Appliquer les changements'
	  },
	  updating: {
	    en: 'Updating',
	    fr: 'Mise à jour'
	  },
	  updated: {
	    en: 'In Sync',
	    fr: 'Synchronisé'
	  },
	  syncError: {
	    en: 'Could not save. Please try again.',
	    fr: 'La sauvegarde n\'a pas abouti. Veuillez ré-essayer.'
	  },
	  cancel: {
	    en: 'Cancel',
	    fr: 'Annuler'
	  }
	};

	module.exports = React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      loading: false,
	      synced: true,
	      error: false
	    };
	  },

	  componentDidMount: function componentDidMount() {

	    var self = this;

	    this.link = updateRes(this.props.res);

	    this.link.setOnSend(this.props.onSend);

	    this.link.setOnResponse(this.props.onResponse);
	  },

	  getLabel: function getLabel(code) {

	    return labels[code][this.props.lang];
	  },

	  send: function send() {

	    this.link.send(this.props.data);
	  },

	  cancel: function cancel() {

	    window.location.reload();
	  },

	  render: function render() {

	    var button,
	        onClick = function onClick() {},
	        cancelButton = false;

	    if (this.props.loading) {

	      button = React.createElement(
	        'button',
	        { className: 'btn btn-primary', disabled: true },
	        this.getLabel('updating')
	      );
	    } else if (this.props.synced) {

	      button = React.createElement(
	        'button',
	        { className: 'btn btn-success' },
	        React.createElement(
	          'span',
	          null,
	          this.getLabel('updated')
	        ),
	        '  ',
	        React.createElement('i', { className: 'fa fa-check' })
	      );
	    } else {

	      button = React.createElement(
	        'button',
	        { onClick: this.send, className: 'btn btn-primary' },
	        this.getLabel('update')
	      );

	      cancelButton = React.createElement(
	        'button',
	        { onClick: this.cancel, className: 'btn btn-default' },
	        this.getLabel('cancel')
	      );
	    }

	    return React.createElement(
	      'div',
	      { className: 'input-group' },
	      button,
	      '  ',
	      cancelButton ? cancelButton : '',
	      this.props.syncError ? React.createElement(
	        'span',
	        { className: 'error' },
	        this.getLabel('syncError')
	      ) : ''
	    );
	  }

	});

	function updateRes(res) {

	  if (!links[res]) {

	    links[res] = link(res);
	  }

	  return links[res];

	  function link(res) {

	    var onResponseCallback, onSendCallback;

	    return {
	      setOnSend: setOnSend,
	      setOnResponse: setOnResponse,
	      send: send
	    };

	    function send(data) {

	      onSendCallback(data);

	      xhr({
	        uri: res,
	        method: 'post',
	        json: data
	      }, function (err, res) {

	        if (!err && res.statusCode !== 200) {

	          err = res.statusCode;
	        }

	        onResponseCallback(err, res);
	      });
	    }

	    function setOnResponse(cb) {

	      onResponseCallback = cb;
	    }

	    function setOnSend(cb) {

	      onSendCallback = cb;
	    }
	  }
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var window = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"global/window\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var once = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"once\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var isFunction = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"is-function\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var parseHeaders = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"parse-headers\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var xtend = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"xtend\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	module.exports = createXHR
	createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
	createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

	forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
	    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
	        options = initParams(uri, options, callback)
	        options.method = method.toUpperCase()
	        return _createXHR(options)
	    }
	})

	function forEachArray(array, iterator) {
	    for (var i = 0; i < array.length; i++) {
	        iterator(array[i])
	    }
	}

	function isEmpty(obj){
	    for(var i in obj){
	        if(obj.hasOwnProperty(i)) return false
	    }
	    return true
	}

	function initParams(uri, options, callback) {
	    var params = uri

	    if (isFunction(options)) {
	        callback = options
	        if (typeof uri === "string") {
	            params = {uri:uri}
	        }
	    } else {
	        params = xtend(options, {uri: uri})
	    }

	    params.callback = callback
	    return params
	}

	function createXHR(uri, options, callback) {
	    options = initParams(uri, options, callback)
	    return _createXHR(options)
	}

	function _createXHR(options) {
	    var callback = options.callback
	    if(typeof callback === "undefined"){
	        throw new Error("callback argument missing")
	    }
	    callback = once(callback)

	    function readystatechange() {
	        if (xhr.readyState === 4) {
	            loadFunc()
	        }
	    }

	    function getBody() {
	        // Chrome with requestType=blob throws errors arround when even testing access to responseText
	        var body = undefined

	        if (xhr.response) {
	            body = xhr.response
	        } else if (xhr.responseType === "text" || !xhr.responseType) {
	            body = xhr.responseText || xhr.responseXML
	        }

	        if (isJson) {
	            try {
	                body = JSON.parse(body)
	            } catch (e) {}
	        }

	        return body
	    }

	    var failureResponse = {
	                body: undefined,
	                headers: {},
	                statusCode: 0,
	                method: method,
	                url: uri,
	                rawRequest: xhr
	            }

	    function errorFunc(evt) {
	        clearTimeout(timeoutTimer)
	        if(!(evt instanceof Error)){
	            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
	        }
	        evt.statusCode = 0
	        callback(evt, failureResponse)
	    }

	    // will load the data & process the response in a special response object
	    function loadFunc() {
	        if (aborted) return
	        var status
	        clearTimeout(timeoutTimer)
	        if(options.useXDR && xhr.status===undefined) {
	            //IE8 CORS GET successful response doesn't have a status field, but body is fine
	            status = 200
	        } else {
	            status = (xhr.status === 1223 ? 204 : xhr.status)
	        }
	        var response = failureResponse
	        var err = null

	        if (status !== 0){
	            response = {
	                body: getBody(),
	                statusCode: status,
	                method: method,
	                headers: {},
	                url: uri,
	                rawRequest: xhr
	            }
	            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
	                response.headers = parseHeaders(xhr.getAllResponseHeaders())
	            }
	        } else {
	            err = new Error("Internal XMLHttpRequest Error")
	        }
	        callback(err, response, response.body)

	    }

	    var xhr = options.xhr || null

	    if (!xhr) {
	        if (options.cors || options.useXDR) {
	            xhr = new createXHR.XDomainRequest()
	        }else{
	            xhr = new createXHR.XMLHttpRequest()
	        }
	    }

	    var key
	    var aborted
	    var uri = xhr.url = options.uri || options.url
	    var method = xhr.method = options.method || "GET"
	    var body = options.body || options.data || null
	    var headers = xhr.headers = options.headers || {}
	    var sync = !!options.sync
	    var isJson = false
	    var timeoutTimer

	    if ("json" in options) {
	        isJson = true
	        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
	        if (method !== "GET" && method !== "HEAD") {
	            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
	            body = JSON.stringify(options.json)
	        }
	    }

	    xhr.onreadystatechange = readystatechange
	    xhr.onload = loadFunc
	    xhr.onerror = errorFunc
	    // IE9 must have onprogress be set to a unique function.
	    xhr.onprogress = function () {
	        // IE must die
	    }
	    xhr.ontimeout = errorFunc
	    xhr.open(method, uri, !sync, options.username, options.password)
	    //has to be after open
	    if(!sync) {
	        xhr.withCredentials = !!options.withCredentials
	    }
	    // Cannot set timeout with sync request
	    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
	    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
	    if (!sync && options.timeout > 0 ) {
	        timeoutTimer = setTimeout(function(){
	            aborted=true//IE9 may still call readystatechange
	            xhr.abort("timeout")
	            var e = new Error("XMLHttpRequest timeout")
	            e.code = "ETIMEDOUT"
	            errorFunc(e)
	        }, options.timeout )
	    }

	    if (xhr.setRequestHeader) {
	        for(key in headers){
	            if(headers.hasOwnProperty(key)){
	                xhr.setRequestHeader(key, headers[key])
	            }
	        }
	    } else if (options.headers && !isEmpty(options.headers)) {
	        throw new Error("Headers cannot be set on an XDomainRequest object")
	    }

	    if ("responseType" in options) {
	        xhr.responseType = options.responseType
	    }

	    if ("beforeSend" in options &&
	        typeof options.beforeSend === "function"
	    ) {
	        options.beforeSend(xhr)
	    }

	    xhr.send(body)

	    return xhr


	}

	function noop() {}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(23),
	    ReactDom = __webpack_require__(26),
	    Spinner = __webpack_require__(27);

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    loading: React.PropTypes.bool.isRequired
	  },

	  componentDidMount: function componentDidMount() {

	    this.spinner = new Spinner(this.props.spinner || {
	      width: 1,
	      length: 6,
	      radius: 10,
	      color: '#666'
	    });
	  },

	  componentDidUpdate: function componentDidUpdate() {

	    if (this.props.loading) {

	      this.spinner.spin(ReactDom.findDOMNode(this.refs.canvas));
	    } else {

	      this.spinner.stop();
	    }
	  },

	  render: function render() {

	    return React.createElement('div', { className: this.props.loading ? 'spin-canvas' : '', ref: 'canvas' });
	  }

	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/ReactDOM\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Copyright (c) 2011-2014 Felix Gnass
	 * Licensed under the MIT license
	 * http://spin.js.org/
	 *
	 * Example:
	    var opts = {
	      lines: 12             // The number of lines to draw
	    , length: 7             // The length of each line
	    , width: 5              // The line thickness
	    , radius: 10            // The radius of the inner circle
	    , scale: 1.0            // Scales overall size of the spinner
	    , corners: 1            // Roundness (0..1)
	    , color: '#000'         // #rgb or #rrggbb
	    , opacity: 1/4          // Opacity of the lines
	    , rotate: 0             // Rotation offset
	    , direction: 1          // 1: clockwise, -1: counterclockwise
	    , speed: 1              // Rounds per second
	    , trail: 100            // Afterglow percentage
	    , fps: 20               // Frames per second when using setTimeout()
	    , zIndex: 2e9           // Use a high z-index by default
	    , className: 'spinner'  // CSS class to assign to the element
	    , top: '50%'            // center vertically
	    , left: '50%'           // center horizontally
	    , shadow: false         // Whether to render a shadow
	    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
	    , position: 'absolute'  // Element positioning
	    }
	    var target = document.getElementById('foo')
	    var spinner = new Spinner(opts).spin(target)
	 */
	;(function (root, factory) {

	  /* CommonJS */
	  if (typeof module == 'object' && module.exports) module.exports = factory()

	  /* AMD module */
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))

	  /* Browser global */
	  else root.Spinner = factory()
	}(this, function () {
	  "use strict"

	  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
	    , animations = {} /* Animation rules keyed by their name */
	    , useCssAnimations /* Whether to use CSS animations or setTimeout */
	    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

	  /**
	   * Utility function to create elements. If no tag name is given,
	   * a DIV is created. Optionally properties can be passed.
	   */
	  function createEl (tag, prop) {
	    var el = document.createElement(tag || 'div')
	      , n

	    for (n in prop) el[n] = prop[n]
	    return el
	  }

	  /**
	   * Appends children and returns the parent.
	   */
	  function ins (parent /* child1, child2, ...*/) {
	    for (var i = 1, n = arguments.length; i < n; i++) {
	      parent.appendChild(arguments[i])
	    }

	    return parent
	  }

	  /**
	   * Creates an opacity keyframe animation rule and returns its name.
	   * Since most mobile Webkits have timing issues with animation-delay,
	   * we create separate rules for each line/segment.
	   */
	  function addAnimation (alpha, trail, i, lines) {
	    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
	      , start = 0.01 + i/lines * 100
	      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
	      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
	      , pre = prefix && '-' + prefix + '-' || ''

	    if (!animations[name]) {
	      sheet.insertRule(
	        '@' + pre + 'keyframes ' + name + '{' +
	        '0%{opacity:' + z + '}' +
	        start + '%{opacity:' + alpha + '}' +
	        (start+0.01) + '%{opacity:1}' +
	        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
	        '100%{opacity:' + z + '}' +
	        '}', sheet.cssRules.length)

	      animations[name] = 1
	    }

	    return name
	  }

	  /**
	   * Tries various vendor prefixes and returns the first supported property.
	   */
	  function vendor (el, prop) {
	    var s = el.style
	      , pp
	      , i

	    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
	    if (s[prop] !== undefined) return prop
	    for (i = 0; i < prefixes.length; i++) {
	      pp = prefixes[i]+prop
	      if (s[pp] !== undefined) return pp
	    }
	  }

	  /**
	   * Sets multiple style properties at once.
	   */
	  function css (el, prop) {
	    for (var n in prop) {
	      el.style[vendor(el, n) || n] = prop[n]
	    }

	    return el
	  }

	  /**
	   * Fills in default values.
	   */
	  function merge (obj) {
	    for (var i = 1; i < arguments.length; i++) {
	      var def = arguments[i]
	      for (var n in def) {
	        if (obj[n] === undefined) obj[n] = def[n]
	      }
	    }
	    return obj
	  }

	  /**
	   * Returns the line color from the given string or array.
	   */
	  function getColor (color, idx) {
	    return typeof color == 'string' ? color : color[idx % color.length]
	  }

	  // Built-in defaults

	  var defaults = {
	    lines: 12             // The number of lines to draw
	  , length: 7             // The length of each line
	  , width: 5              // The line thickness
	  , radius: 10            // The radius of the inner circle
	  , scale: 1.0            // Scales overall size of the spinner
	  , corners: 1            // Roundness (0..1)
	  , color: '#000'         // #rgb or #rrggbb
	  , opacity: 1/4          // Opacity of the lines
	  , rotate: 0             // Rotation offset
	  , direction: 1          // 1: clockwise, -1: counterclockwise
	  , speed: 1              // Rounds per second
	  , trail: 100            // Afterglow percentage
	  , fps: 20               // Frames per second when using setTimeout()
	  , zIndex: 2e9           // Use a high z-index by default
	  , className: 'spinner'  // CSS class to assign to the element
	  , top: '50%'            // center vertically
	  , left: '50%'           // center horizontally
	  , shadow: false         // Whether to render a shadow
	  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
	  , position: 'absolute'  // Element positioning
	  }

	  /** The constructor */
	  function Spinner (o) {
	    this.opts = merge(o || {}, Spinner.defaults, defaults)
	  }

	  // Global defaults that override the built-ins:
	  Spinner.defaults = {}

	  merge(Spinner.prototype, {
	    /**
	     * Adds the spinner to the given target element. If this instance is already
	     * spinning, it is automatically removed from its previous target b calling
	     * stop() internally.
	     */
	    spin: function (target) {
	      this.stop()

	      var self = this
	        , o = self.opts
	        , el = self.el = createEl(null, {className: o.className})

	      css(el, {
	        position: o.position
	      , width: 0
	      , zIndex: o.zIndex
	      , left: o.left
	      , top: o.top
	      })

	      if (target) {
	        target.insertBefore(el, target.firstChild || null)
	      }

	      el.setAttribute('role', 'progressbar')
	      self.lines(el, self.opts)

	      if (!useCssAnimations) {
	        // No CSS animation support, use setTimeout() instead
	        var i = 0
	          , start = (o.lines - 1) * (1 - o.direction) / 2
	          , alpha
	          , fps = o.fps
	          , f = fps / o.speed
	          , ostep = (1 - o.opacity) / (f * o.trail / 100)
	          , astep = f / o.lines

	        ;(function anim () {
	          i++
	          for (var j = 0; j < o.lines; j++) {
	            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

	            self.opacity(el, j * o.direction + start, alpha, o)
	          }
	          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
	        })()
	      }
	      return self
	    }

	    /**
	     * Stops and removes the Spinner.
	     */
	  , stop: function () {
	      var el = this.el
	      if (el) {
	        clearTimeout(this.timeout)
	        if (el.parentNode) el.parentNode.removeChild(el)
	        this.el = undefined
	      }
	      return this
	    }

	    /**
	     * Internal method that draws the individual lines. Will be overwritten
	     * in VML fallback mode below.
	     */
	  , lines: function (el, o) {
	      var i = 0
	        , start = (o.lines - 1) * (1 - o.direction) / 2
	        , seg

	      function fill (color, shadow) {
	        return css(createEl(), {
	          position: 'absolute'
	        , width: o.scale * (o.length + o.width) + 'px'
	        , height: o.scale * o.width + 'px'
	        , background: color
	        , boxShadow: shadow
	        , transformOrigin: 'left'
	        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
	        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
	        })
	      }

	      for (; i < o.lines; i++) {
	        seg = css(createEl(), {
	          position: 'absolute'
	        , top: 1 + ~(o.scale * o.width / 2) + 'px'
	        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
	        , opacity: o.opacity
	        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
	        })

	        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
	        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
	      }
	      return el
	    }

	    /**
	     * Internal method that adjusts the opacity of a single line.
	     * Will be overwritten in VML fallback mode below.
	     */
	  , opacity: function (el, i, val) {
	      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
	    }

	  })


	  function initVML () {

	    /* Utility function to create a VML tag */
	    function vml (tag, attr) {
	      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
	    }

	    // No CSS transforms but VML support, add a CSS rule for VML elements:
	    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

	    Spinner.prototype.lines = function (el, o) {
	      var r = o.scale * (o.length + o.width)
	        , s = o.scale * 2 * r

	      function grp () {
	        return css(
	          vml('group', {
	            coordsize: s + ' ' + s
	          , coordorigin: -r + ' ' + -r
	          })
	        , { width: s, height: s }
	        )
	      }

	      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
	        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
	        , i

	      function seg (i, dx, filter) {
	        ins(
	          g
	        , ins(
	            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
	          , ins(
	              css(
	                vml('roundrect', {arcsize: o.corners})
	              , { width: r
	                , height: o.scale * o.width
	                , left: o.scale * o.radius
	                , top: -o.scale * o.width >> 1
	                , filter: filter
	                }
	              )
	            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
	            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
	            )
	          )
	        )
	      }

	      if (o.shadow)
	        for (i = 1; i <= o.lines; i++) {
	          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
	        }

	      for (i = 1; i <= o.lines; i++) seg(i)
	      return ins(el, g)
	    }

	    Spinner.prototype.opacity = function (el, i, val, o) {
	      var c = el.firstChild
	      o = o.shadow && o.lines || 0
	      if (c && i + o < c.childNodes.length) {
	        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
	        if (c) c.opacity = val
	      }
	    }
	  }

	  if (typeof document !== 'undefined') {
	    sheet = (function () {
	      var el = createEl('style', {type : 'text/css'})
	      ins(document.getElementsByTagName('head')[0], el)
	      return el.sheet || el.styleSheet
	    }())

	    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

	    if (!vendor(probe, 'transform') && probe.adj) initVML()
	    else useCssAnimations = vendor(probe, 'animation')
	  }

	  return Spinner

	}));


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(9);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(6);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(10);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/categories/js/FeatureRequest.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(6),
	    xhr = __webpack_require__(29),
	    Spinner = __webpack_require__(30),
	    labels = {
	  request: {
	    fr: 'Demandez l\'activation de cette fonctionnalité',
	    en: 'Send a request to try out this feature'
	  },
	  send: {
	    fr: 'Envoyer',
	    en: 'Send'
	  },
	  sentMessage: {
	    fr: 'Merci, votre demande sera traitée sous peu',
	    en: 'Thanks, your request will be processed shortly'
	  },
	  emptyError: {
	    fr: 'Détaillez en quelques mots votre cas d\'utilisation pour cette fonction',
	    en: 'Thanks for giving us some detail on your use case for this feature'
	  },
	  requestError: {
	    fr: 'Il y a eu un problème lors du transfer du message, merci de réessayer plus tard',
	    en: 'There was a problem during the transfer of the message, thanks for trying again later'
	  },
	  done: {
	    fr: 'Ok',
	    en: 'Ok'
	  }
	};

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      message: '',
	      error: false,
	      display: false,
	      sent: false,
	      loading: false,
	      done: false
	    };
	  },

	  getLabel: function getLabel(name) {

	    if (this.props.labels[name]) {

	      return this.props.labels[name][this.props.lang];
	    }

	    return labels[name][this.props.lang];
	  },

	  onTeaserClick: function onTeaserClick(e) {

	    e.preventDefault();

	    this.setState({
	      display: true
	    });
	  },

	  onCanvasClick: function onCanvasClick(e) {

	    if (this.refs.popupcanvas == e.target) this.onHide(e);
	  },

	  onHide: function onHide(e) {

	    e.preventDefault();

	    this.setState({
	      display: false
	    });
	  },

	  onChange: function onChange(e) {

	    this.setState({
	      message: e.target.value
	    });
	  },

	  onDoneClick: function onDoneClick() {

	    this.setState({
	      done: true
	    });
	  },

	  onSubmit: function onSubmit() {

	    var self = this;

	    if (!this.state.message.length) {

	      this.setState({
	        error: this.getLabel('emptyError')
	      });

	      return;
	    }

	    this.setState({
	      loading: true
	    });

	    xhr({
	      uri: this.props.res,
	      method: 'post',
	      json: {
	        title: this.getLabel('title'),
	        message: this.state.message,
	        source: window.location.href
	      }
	    }, function (err, res) {

	      var update = {
	        loading: false
	      };

	      if (!err && res.statusCode !== 200) {

	        err = res.statusCode;

	        update.error = self.getLabel('requestError');
	      } else {

	        update.sent = true;
	      }

	      self.setState(update);
	    });
	  },

	  renderSentMessage: function renderSentMessage() {

	    return React.createElement(
	      'div',
	      { className: 'text-center' },
	      React.createElement(
	        'p',
	        null,
	        this.getLabel('sentMessage')
	      ),
	      React.createElement(
	        'div',
	        null,
	        React.createElement(
	          'button',
	          { onClick: this.onDoneClick, className: 'btn btn-primary' },
	          this.getLabel('done')
	        )
	      )
	    );
	  },

	  renderForm: function renderForm() {

	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'p',
	        null,
	        this.getLabel('description')
	      ),
	      React.createElement(
	        'div',
	        { className: 'form-group' },
	        React.createElement(
	          'p',
	          null,
	          this.getLabel('request')
	        ),
	        React.createElement('textarea', { cols: '4', onChange: this.onChange, className: 'form-control' })
	      ),
	      React.createElement(
	        'div',
	        { className: 'form-group' },
	        this.state.error ? React.createElement(
	          'p',
	          { className: 'error' },
	          this.state.error
	        ) : '',
	        React.createElement(
	          'button',
	          { onClick: this.onSubmit, className: 'btn btn-primary' },
	          this.getLabel('send')
	        )
	      )
	    );
	  },

	  renderFeature: function renderFeature() {

	    return React.createElement(
	      'div',
	      { className: 'popup-overlay', ref: 'popupcanvas', onClick: this.onCanvasClick },
	      React.createElement(
	        'section',
	        null,
	        React.createElement(
	          'header',
	          { className: 'popup-title' },
	          React.createElement(
	            'h2',
	            null,
	            this.getLabel('title')
	          ),
	          React.createElement(
	            'a',
	            { onClick: this.onHide, className: 'close-link' },
	            React.createElement('i', { className: 'fa fa-times fa-lg' })
	          )
	        ),
	        React.createElement(
	          'div',
	          { className: 'popup-content' },
	          this.state.sent ? this.renderSentMessage() : this.renderForm()
	        ),
	        React.createElement(Spinner, { loading: this.state.loading })
	      )
	    );
	  },

	  renderTeaser: function renderTeaser() {

	    return React.createElement(
	      'div',
	      { className: 'form-group' },
	      React.createElement(
	        'button',
	        { className: 'btn btn-default', onClick: this.onTeaserClick },
	        React.createElement('i', { className: 'fa fa-lock' }),
	        React.createElement(
	          'span',
	          null,
	          ' ',
	          this.getLabel('teaser')
	        )
	      )
	    );
	  },

	  render: function render() {

	    if (this.state.done) return React.createElement('div', null);

	    return React.createElement(
	      'div',
	      { className: 'feature-request' },
	      this.state.display ? this.renderFeature() : this.renderTeaser()
	    );
	  }

	}));

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var window = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"global/window\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var once = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"once\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var isFunction = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"is-function\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var parseHeaders = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"parse-headers\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
	var xtend = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"xtend\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	module.exports = createXHR
	createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
	createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

	forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
	    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
	        options = initParams(uri, options, callback)
	        options.method = method.toUpperCase()
	        return _createXHR(options)
	    }
	})

	function forEachArray(array, iterator) {
	    for (var i = 0; i < array.length; i++) {
	        iterator(array[i])
	    }
	}

	function isEmpty(obj){
	    for(var i in obj){
	        if(obj.hasOwnProperty(i)) return false
	    }
	    return true
	}

	function initParams(uri, options, callback) {
	    var params = uri

	    if (isFunction(options)) {
	        callback = options
	        if (typeof uri === "string") {
	            params = {uri:uri}
	        }
	    } else {
	        params = xtend(options, {uri: uri})
	    }

	    params.callback = callback
	    return params
	}

	function createXHR(uri, options, callback) {
	    options = initParams(uri, options, callback)
	    return _createXHR(options)
	}

	function _createXHR(options) {
	    var callback = options.callback
	    if(typeof callback === "undefined"){
	        throw new Error("callback argument missing")
	    }
	    callback = once(callback)

	    function readystatechange() {
	        if (xhr.readyState === 4) {
	            loadFunc()
	        }
	    }

	    function getBody() {
	        // Chrome with requestType=blob throws errors arround when even testing access to responseText
	        var body = undefined

	        if (xhr.response) {
	            body = xhr.response
	        } else if (xhr.responseType === "text" || !xhr.responseType) {
	            body = xhr.responseText || xhr.responseXML
	        }

	        if (isJson) {
	            try {
	                body = JSON.parse(body)
	            } catch (e) {}
	        }

	        return body
	    }

	    var failureResponse = {
	                body: undefined,
	                headers: {},
	                statusCode: 0,
	                method: method,
	                url: uri,
	                rawRequest: xhr
	            }

	    function errorFunc(evt) {
	        clearTimeout(timeoutTimer)
	        if(!(evt instanceof Error)){
	            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
	        }
	        evt.statusCode = 0
	        callback(evt, failureResponse)
	    }

	    // will load the data & process the response in a special response object
	    function loadFunc() {
	        if (aborted) return
	        var status
	        clearTimeout(timeoutTimer)
	        if(options.useXDR && xhr.status===undefined) {
	            //IE8 CORS GET successful response doesn't have a status field, but body is fine
	            status = 200
	        } else {
	            status = (xhr.status === 1223 ? 204 : xhr.status)
	        }
	        var response = failureResponse
	        var err = null

	        if (status !== 0){
	            response = {
	                body: getBody(),
	                statusCode: status,
	                method: method,
	                headers: {},
	                url: uri,
	                rawRequest: xhr
	            }
	            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
	                response.headers = parseHeaders(xhr.getAllResponseHeaders())
	            }
	        } else {
	            err = new Error("Internal XMLHttpRequest Error")
	        }
	        callback(err, response, response.body)

	    }

	    var xhr = options.xhr || null

	    if (!xhr) {
	        if (options.cors || options.useXDR) {
	            xhr = new createXHR.XDomainRequest()
	        }else{
	            xhr = new createXHR.XMLHttpRequest()
	        }
	    }

	    var key
	    var aborted
	    var uri = xhr.url = options.uri || options.url
	    var method = xhr.method = options.method || "GET"
	    var body = options.body || options.data || null
	    var headers = xhr.headers = options.headers || {}
	    var sync = !!options.sync
	    var isJson = false
	    var timeoutTimer

	    if ("json" in options) {
	        isJson = true
	        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
	        if (method !== "GET" && method !== "HEAD") {
	            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
	            body = JSON.stringify(options.json)
	        }
	    }

	    xhr.onreadystatechange = readystatechange
	    xhr.onload = loadFunc
	    xhr.onerror = errorFunc
	    // IE9 must have onprogress be set to a unique function.
	    xhr.onprogress = function () {
	        // IE must die
	    }
	    xhr.ontimeout = errorFunc
	    xhr.open(method, uri, !sync, options.username, options.password)
	    //has to be after open
	    if(!sync) {
	        xhr.withCredentials = !!options.withCredentials
	    }
	    // Cannot set timeout with sync request
	    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
	    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
	    if (!sync && options.timeout > 0 ) {
	        timeoutTimer = setTimeout(function(){
	            aborted=true//IE9 may still call readystatechange
	            xhr.abort("timeout")
	            var e = new Error("XMLHttpRequest timeout")
	            e.code = "ETIMEDOUT"
	            errorFunc(e)
	        }, options.timeout )
	    }

	    if (xhr.setRequestHeader) {
	        for(key in headers){
	            if(headers.hasOwnProperty(key)){
	                xhr.setRequestHeader(key, headers[key])
	            }
	        }
	    } else if (options.headers && !isEmpty(options.headers)) {
	        throw new Error("Headers cannot be set on an XDomainRequest object")
	    }

	    if ("responseType" in options) {
	        xhr.responseType = options.responseType
	    }

	    if ("beforeSend" in options &&
	        typeof options.beforeSend === "function"
	    ) {
	        options.beforeSend(xhr)
	    }

	    xhr.send(body)

	    return xhr


	}

	function noop() {}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(31),
	    ReactDom = __webpack_require__(32),
	    Spinner = __webpack_require__(33);

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    loading: React.PropTypes.bool.isRequired
	  },

	  componentDidMount: function componentDidMount() {

	    this.spinner = new Spinner(this.props.spinner || {
	      width: 1,
	      length: 6,
	      radius: 10,
	      color: '#666'
	    });

	    this.evaluate();
	  },

	  componentDidUpdate: function componentDidUpdate() {

	    this.evaluate();
	  },

	  evaluate: function evaluate() {

	    if (this.props.loading) {

	      this.spinner.spin(ReactDom.findDOMNode(this.refs.canvas));
	    } else {

	      this.spinner.stop();
	    }
	  },

	  render: function render() {

	    return React.createElement('div', { className: this.props.loading ? 'spin-canvas' : '', ref: 'canvas' });
	  }

	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/ReactDOM\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Copyright (c) 2011-2014 Felix Gnass
	 * Licensed under the MIT license
	 * http://spin.js.org/
	 *
	 * Example:
	    var opts = {
	      lines: 12             // The number of lines to draw
	    , length: 7             // The length of each line
	    , width: 5              // The line thickness
	    , radius: 10            // The radius of the inner circle
	    , scale: 1.0            // Scales overall size of the spinner
	    , corners: 1            // Roundness (0..1)
	    , color: '#000'         // #rgb or #rrggbb
	    , opacity: 1/4          // Opacity of the lines
	    , rotate: 0             // Rotation offset
	    , direction: 1          // 1: clockwise, -1: counterclockwise
	    , speed: 1              // Rounds per second
	    , trail: 100            // Afterglow percentage
	    , fps: 20               // Frames per second when using setTimeout()
	    , zIndex: 2e9           // Use a high z-index by default
	    , className: 'spinner'  // CSS class to assign to the element
	    , top: '50%'            // center vertically
	    , left: '50%'           // center horizontally
	    , shadow: false         // Whether to render a shadow
	    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
	    , position: 'absolute'  // Element positioning
	    }
	    var target = document.getElementById('foo')
	    var spinner = new Spinner(opts).spin(target)
	 */
	;(function (root, factory) {

	  /* CommonJS */
	  if (typeof module == 'object' && module.exports) module.exports = factory()

	  /* AMD module */
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))

	  /* Browser global */
	  else root.Spinner = factory()
	}(this, function () {
	  "use strict"

	  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
	    , animations = {} /* Animation rules keyed by their name */
	    , useCssAnimations /* Whether to use CSS animations or setTimeout */
	    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

	  /**
	   * Utility function to create elements. If no tag name is given,
	   * a DIV is created. Optionally properties can be passed.
	   */
	  function createEl (tag, prop) {
	    var el = document.createElement(tag || 'div')
	      , n

	    for (n in prop) el[n] = prop[n]
	    return el
	  }

	  /**
	   * Appends children and returns the parent.
	   */
	  function ins (parent /* child1, child2, ...*/) {
	    for (var i = 1, n = arguments.length; i < n; i++) {
	      parent.appendChild(arguments[i])
	    }

	    return parent
	  }

	  /**
	   * Creates an opacity keyframe animation rule and returns its name.
	   * Since most mobile Webkits have timing issues with animation-delay,
	   * we create separate rules for each line/segment.
	   */
	  function addAnimation (alpha, trail, i, lines) {
	    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
	      , start = 0.01 + i/lines * 100
	      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
	      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
	      , pre = prefix && '-' + prefix + '-' || ''

	    if (!animations[name]) {
	      sheet.insertRule(
	        '@' + pre + 'keyframes ' + name + '{' +
	        '0%{opacity:' + z + '}' +
	        start + '%{opacity:' + alpha + '}' +
	        (start+0.01) + '%{opacity:1}' +
	        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
	        '100%{opacity:' + z + '}' +
	        '}', sheet.cssRules.length)

	      animations[name] = 1
	    }

	    return name
	  }

	  /**
	   * Tries various vendor prefixes and returns the first supported property.
	   */
	  function vendor (el, prop) {
	    var s = el.style
	      , pp
	      , i

	    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
	    if (s[prop] !== undefined) return prop
	    for (i = 0; i < prefixes.length; i++) {
	      pp = prefixes[i]+prop
	      if (s[pp] !== undefined) return pp
	    }
	  }

	  /**
	   * Sets multiple style properties at once.
	   */
	  function css (el, prop) {
	    for (var n in prop) {
	      el.style[vendor(el, n) || n] = prop[n]
	    }

	    return el
	  }

	  /**
	   * Fills in default values.
	   */
	  function merge (obj) {
	    for (var i = 1; i < arguments.length; i++) {
	      var def = arguments[i]
	      for (var n in def) {
	        if (obj[n] === undefined) obj[n] = def[n]
	      }
	    }
	    return obj
	  }

	  /**
	   * Returns the line color from the given string or array.
	   */
	  function getColor (color, idx) {
	    return typeof color == 'string' ? color : color[idx % color.length]
	  }

	  // Built-in defaults

	  var defaults = {
	    lines: 12             // The number of lines to draw
	  , length: 7             // The length of each line
	  , width: 5              // The line thickness
	  , radius: 10            // The radius of the inner circle
	  , scale: 1.0            // Scales overall size of the spinner
	  , corners: 1            // Roundness (0..1)
	  , color: '#000'         // #rgb or #rrggbb
	  , opacity: 1/4          // Opacity of the lines
	  , rotate: 0             // Rotation offset
	  , direction: 1          // 1: clockwise, -1: counterclockwise
	  , speed: 1              // Rounds per second
	  , trail: 100            // Afterglow percentage
	  , fps: 20               // Frames per second when using setTimeout()
	  , zIndex: 2e9           // Use a high z-index by default
	  , className: 'spinner'  // CSS class to assign to the element
	  , top: '50%'            // center vertically
	  , left: '50%'           // center horizontally
	  , shadow: false         // Whether to render a shadow
	  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
	  , position: 'absolute'  // Element positioning
	  }

	  /** The constructor */
	  function Spinner (o) {
	    this.opts = merge(o || {}, Spinner.defaults, defaults)
	  }

	  // Global defaults that override the built-ins:
	  Spinner.defaults = {}

	  merge(Spinner.prototype, {
	    /**
	     * Adds the spinner to the given target element. If this instance is already
	     * spinning, it is automatically removed from its previous target b calling
	     * stop() internally.
	     */
	    spin: function (target) {
	      this.stop()

	      var self = this
	        , o = self.opts
	        , el = self.el = createEl(null, {className: o.className})

	      css(el, {
	        position: o.position
	      , width: 0
	      , zIndex: o.zIndex
	      , left: o.left
	      , top: o.top
	      })

	      if (target) {
	        target.insertBefore(el, target.firstChild || null)
	      }

	      el.setAttribute('role', 'progressbar')
	      self.lines(el, self.opts)

	      if (!useCssAnimations) {
	        // No CSS animation support, use setTimeout() instead
	        var i = 0
	          , start = (o.lines - 1) * (1 - o.direction) / 2
	          , alpha
	          , fps = o.fps
	          , f = fps / o.speed
	          , ostep = (1 - o.opacity) / (f * o.trail / 100)
	          , astep = f / o.lines

	        ;(function anim () {
	          i++
	          for (var j = 0; j < o.lines; j++) {
	            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

	            self.opacity(el, j * o.direction + start, alpha, o)
	          }
	          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
	        })()
	      }
	      return self
	    }

	    /**
	     * Stops and removes the Spinner.
	     */
	  , stop: function () {
	      var el = this.el
	      if (el) {
	        clearTimeout(this.timeout)
	        if (el.parentNode) el.parentNode.removeChild(el)
	        this.el = undefined
	      }
	      return this
	    }

	    /**
	     * Internal method that draws the individual lines. Will be overwritten
	     * in VML fallback mode below.
	     */
	  , lines: function (el, o) {
	      var i = 0
	        , start = (o.lines - 1) * (1 - o.direction) / 2
	        , seg

	      function fill (color, shadow) {
	        return css(createEl(), {
	          position: 'absolute'
	        , width: o.scale * (o.length + o.width) + 'px'
	        , height: o.scale * o.width + 'px'
	        , background: color
	        , boxShadow: shadow
	        , transformOrigin: 'left'
	        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
	        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
	        })
	      }

	      for (; i < o.lines; i++) {
	        seg = css(createEl(), {
	          position: 'absolute'
	        , top: 1 + ~(o.scale * o.width / 2) + 'px'
	        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
	        , opacity: o.opacity
	        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
	        })

	        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
	        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
	      }
	      return el
	    }

	    /**
	     * Internal method that adjusts the opacity of a single line.
	     * Will be overwritten in VML fallback mode below.
	     */
	  , opacity: function (el, i, val) {
	      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
	    }

	  })


	  function initVML () {

	    /* Utility function to create a VML tag */
	    function vml (tag, attr) {
	      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
	    }

	    // No CSS transforms but VML support, add a CSS rule for VML elements:
	    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

	    Spinner.prototype.lines = function (el, o) {
	      var r = o.scale * (o.length + o.width)
	        , s = o.scale * 2 * r

	      function grp () {
	        return css(
	          vml('group', {
	            coordsize: s + ' ' + s
	          , coordorigin: -r + ' ' + -r
	          })
	        , { width: s, height: s }
	        )
	      }

	      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
	        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
	        , i

	      function seg (i, dx, filter) {
	        ins(
	          g
	        , ins(
	            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
	          , ins(
	              css(
	                vml('roundrect', {arcsize: o.corners})
	              , { width: r
	                , height: o.scale * o.width
	                , left: o.scale * o.radius
	                , top: -o.scale * o.width >> 1
	                , filter: filter
	                }
	              )
	            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
	            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
	            )
	          )
	        )
	      }

	      if (o.shadow)
	        for (i = 1; i <= o.lines; i++) {
	          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
	        }

	      for (i = 1; i <= o.lines; i++) seg(i)
	      return ins(el, g)
	    }

	    Spinner.prototype.opacity = function (el, i, val, o) {
	      var c = el.firstChild
	      o = o.shadow && o.lines || 0
	      if (c && i + o < c.childNodes.length) {
	        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
	        if (c) c.opacity = val
	      }
	    }
	  }

	  if (typeof document !== 'undefined') {
	    sheet = (function () {
	      var el = createEl('style', {type : 'text/css'})
	      ins(document.getElementsByTagName('head')[0], el)
	      return el.sheet || el.styleSheet
	    }())

	    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

	    if (!vendor(probe, 'transform') && probe.adj) initVML()
	    else useCssAnimations = vendor(probe, 'animation')
	  }

	  return Spinner

	}));


/***/ }
/******/ ]);