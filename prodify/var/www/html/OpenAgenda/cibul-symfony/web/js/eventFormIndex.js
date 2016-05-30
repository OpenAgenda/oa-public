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

	var formUtils = __webpack_require__(1),
	    rUtils = __webpack_require__(3),
	    du = __webpack_require__(4),
	    deepExtend = __webpack_require__(8),
	    EventForm = __webpack_require__(9),
	    deepExtend = __webpack_require__(8),
	    React = __webpack_require__(12),
	    ReactDom = __webpack_require__(49),
	    formConfiguration = __webpack_require__(50),
	    labels = __webpack_require__(51),
	    fieldErrors = [],
	    customErrors = [],
	    defaults = {
	  configuration: false,
	  language: 'fr',
	  canvas: '.js_form_canvas',
	  useWysiwyg: false,
	  agendaUid: false,
	  categorySet: undefined,
	  tagSet: undefined,
	  events: {
	    fetch: 'eventfetch',
	    fetchLanguages: 'languagesfetch', // must be dyslexia.
	    languageChange: 'elanguageschange',
	    description: 'edescriptionfieldsend',
	    customFields: 'ecustomfieldssend',
	    single: 'esinglesend',
	    timings: 'etimingssend',
	    agenda: 'eagendawrite',
	    location: 'elocationsend'
	  },
	  custom: false,
	  labels: labels
	};

	// legacy

	window.oaEvent = __webpack_require__(52);
	window.oaEventSubmit = __webpack_require__(54);
	window.oaEventImage = __webpack_require__(57);

	// the form page is loaded by sf.
	window.oaEventForm = function (options) {

	  var params = deepExtend({}, defaults, options ? options : {});

	  rUtils.eh.trigger(params.events.fetch, function (eventData) {

	    var initialLanguages = formUtils.extractLanguages(eventData);

	    rUtils.eh.trigger(params.events.languageChange, initialLanguages);

	    ReactDom.render(React.createElement(EventForm, {
	      configuration: formConfiguration(params.configuration ? params.configuration : {}, { lang: params.language }),
	      agendaUid: params.agendaUid,
	      initialLanguages: initialLanguages,
	      useWysiwyg: params.useWysiwyg,
	      initData: eventData,
	      lang: params.language,
	      onTextChange: onTextChange,
	      onCustomChange: onCustomChange,
	      onTimingsChange: onTimingsChange,
	      onAgendaDataChange: onAgendaDataChange,
	      onLocationChange: onLocationChange,
	      custom: params.custom,
	      customRes: params.customRes,
	      locationRes: params.locationRes,
	      categories: params.categories,
	      categorySet: params.categorySet,
	      tags: params.tags,
	      tagSet: params.tagSet,
	      labels: params.labels }), rUtils.el(params.canvas));
	  });

	  function onAgendaDataChange(data) {

	    rUtils.eh.trigger(params.events.agenda, data);
	  }

	  function onTimingsChange(newTimings) {

	    rUtils.eh.trigger(params.events.timings, newTimings);
	  }

	  function onLocationChange(newLocation) {

	    rUtils.eh.trigger(params.events.location, newLocation);
	  }

	  function onTextChange(field, content, errors) {

	    fieldErrors.filter(function (e) {
	      return e.field !== field;
	    });

	    if (errors) fieldErrors.splice(0, 0, errors);

	    var eventName = params.events.single;

	    if (['title', 'description', 'freeText', 'tags', 'conditions'].indexOf(field) !== -1) {

	      eventName = params.events.description;
	    }

	    rUtils.eh.trigger(eventName, {
	      name: field,
	      value: content,
	      errors: errors
	    });
	  }

	  function onCustomChange(values, errors) {

	    rUtils.eh.trigger(params.events.customFields, {
	      values: values,
	      errors: errors
	    });
	  }
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2);

	module.exports = {
	  extractLanguages: extractLanguages
	};

	function extractLanguages(descData) {

	  var langs = [];

	  utils.forEach(['title', 'description', 'tags', 'freeText'], function (field) {

	    for (var fieldLang in descData[field]) {

	      if (langs.indexOf(fieldLang) == -1) langs.push(fieldLang);
	    }
	  });

	  return langs;
	}

/***/ },
/* 2 */
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2),
	    domUtils = __webpack_require__(4),
	    eh = __webpack_require__(7).sEventHandler.getInstance();

	module.exports = {
	  createCanvas: createCanvas,
	  extend: utils.extend,
	  el: domUtils.el,
	  ehUpdate: ehUpdate,
	  ehSubscriber: ehSubscriber,
	  eh: eh
	};

	function ehUpdate(eventName) {

	  return function (v) {

	    eh.trigger(eventName, v);
	  };
	}

	function ehSubscriber(eventName) {

	  return function (cb) {

	    eh.on(eventName, cb);
	  };
	}

	function createCanvas(parent) {

	  var div = document.createElement('div');

	  parent.appendChild(div);

	  return div;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(6),
	    utils = __webpack_require__(2);

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
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* EventHandler v0.2 */
	(function (root) {

	  var EventHandler = function EventHandler() {
	    this.register = {};
	    this.nextId = 1;
	  };

	  EventHandler.prototype = {

	    // register new function to call on event, returns an track id of the function
	    on: function on(eventName, func) {

	      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

	      this.register[eventName].push({ func: func, funcId: this.nextId });

	      return this.nextId++;
	    },

	    trigger: function trigger(eventName, params) {

	      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

	      var i = this.register[eventName].length;

	      while (i--) {
	        this.register[eventName][i].func(params);
	      }
	    },

	    cancel: function cancel(funcId) {

	      var i;

	      for (var eventName in this.register) {

	        i = this.register[eventName].length;

	        while (i--) {
	          if (funcId == this.register[eventName][i].funcId) {

	            this.register[eventName].splice(i, 1);

	            return true;
	          }
	        }
	      }

	      return false;
	    },

	    clear: function clear() {

	      this.register = {};
	    },

	    hasEvent: function hasEvent(name) {

	      return typeof this.register[name] != 'undefined';
	    }

	  };

	  root.EventHandler = EventHandler;

	  root.sEventHandler = function () {

	    var instance;

	    return {
	      getInstance: function getInstance() {

	        if (!instance) instance = new EventHandler();

	        return instance;
	      }
	    };
	  }();
	})( true ? exports : window);

/***/ },
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/EventForm.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    LanguageBar = __webpack_require__(14),
	    TextField = __webpack_require__(15),
	    MultilingualTextField = __webpack_require__(20),
	    EventKeywordsField = __webpack_require__(21),
	    WysiwygMarkdown = __webpack_require__(23),
	    CustomFields = __webpack_require__(27),
	    AccessibilityFields = __webpack_require__(34),
	    AgeFields = __webpack_require__(36),
	    TimingsPicker = __webpack_require__(38),
	    TagSelector = __webpack_require__(41),
	    LocationSelector = __webpack_require__(43),
	    CategorySelector = __webpack_require__(44),
	    Registration = __webpack_require__(46),
	    utils = __webpack_require__(2),
	    update = __webpack_require__(47),
	    languageUtils = __webpack_require__(48),
	    textFields = ['title', 'description', 'freeText', 'tags', 'conditions'],
	    formErrors = {};

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    configuration: React.PropTypes.object
	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      configuration: {
	        fields: [{
	          name: 'keywords',
	          display: false
	        }, {
	          name: 'location',
	          settings: false
	        }]
	      }
	    };
	  },

	  getInitialState: function getInitialState() {

	    var state = this.props.initData;

	    formErrors = state.errors || {};

	    state.languages = this.props.initialLanguages;

	    if (!state.languages.length) {

	      state.languages = [this.props.lang];
	    }

	    if (!state.custom || utils.isArray(state.custom)) state.custom = {};

	    state.locationMode = state.location ? 'show' : 'search';

	    return state;
	  },

	  getLabel: function getLabel(name) {

	    return this.props.labels[name][this.props.lang];
	  },

	  onChange: function onChange(field) {

	    var self = this;

	    return function (value, errorMessage) {

	      var updated = {};

	      updated[field] = value;

	      formErrors[field] = errorMessage;

	      self.setState(updated);

	      self.props.onTextChange(field, value, self.listErrorDetails());
	    };
	  },

	  onSwappedLanguage: function onSwappedLanguage(languages, swapFrom, swapTo) {

	    var updated = {},
	        self = this;

	    textFields.forEach(function (field) {

	      updated[field] = JSON.parse((0, _stringify2.default)(self.state[field] || {}));

	      updated[field][swapTo] = updated[field][swapFrom];

	      updated[field][swapFrom] = undefined;
	    });

	    updated.languages = languages;

	    this.setState(updated);

	    textFields.forEach(function (field) {

	      self.props.onTextChange(field, updated[field], self.listErrorDetails());
	    });
	  },

	  onChangedLanguage: function onChangedLanguage(languages, changedLanguage, change) {

	    var updated = {},
	        self = this;

	    textFields.forEach(function (field) {

	      updated[field] = JSON.parse((0, _stringify2.default)(self.state[field] || {}));

	      updated[field][changedLanguage] = change;
	    });

	    updated.languages = languages;

	    this.setState(updated);

	    textFields.forEach(function (field) {

	      self.props.onTextChange(field, updated[field], self.listErrorDetails());
	    });
	  },

	  changeCustom: function changeCustom(field, value, errorMessage) {

	    var updated = {
	      custom: JSON.parse((0, _stringify2.default)(this.state.custom))
	    };

	    updated.custom[field] = value;

	    formErrors[field] = errorMessage;

	    this.setState(updated);

	    this.props.onCustomChange(updated.custom, this.listErrorDetails());
	  },

	  /**
	   * generate events as list including for each error the message, the label of the field and its name
	   */
	  listErrorDetails: function listErrorDetails() {

	    var errors = [],
	        self = this;

	    for (var i in formErrors) {

	      if (utils.isArray(formErrors[i])) {

	        errors = errors.concat(formErrors[i].map(function (e) {

	          return {
	            field: e.field,
	            label: e.label,
	            message: e.message[self.props.lang]
	          };
	        }));
	      } else if (formErrors[i]) {

	        errors.push({
	          field: i,
	          label: this.getErrorFieldLabel(i)[this.props.lang],
	          message: formErrors[i]
	        });
	      }
	    }

	    return errors;
	  },

	  getErrorFieldLabel: function getErrorFieldLabel(field) {

	    if (this.props.custom) {

	      var customPossibles = this.props.custom.filter(function (customField) {

	        return customField.name == field;
	      });

	      if (customPossibles.length) return customPossibles[0].label;
	    }

	    if (field == 'freeText') return this.props.labels.longDescription;

	    if (field == 'tags') return this.props.labels.keywords;

	    return this.props.labels[field];
	  },

	  onTimingsChange: function onTimingsChange(values, errorMessage) {

	    var updated = {};

	    updated.timings = values;

	    formErrors.timings = errorMessage;

	    this.setState(updated);

	    this.props.onTimingsChange(values, this.listErrorDetails());
	  },

	  onLocationModeChange: function onLocationModeChange(newMode, initLocation) {

	    this.setState({
	      locationMode: newMode,
	      location: initLocation
	    });
	  },

	  onLocationChange: function onLocationChange(newLocation, newMode) {

	    this.setState({
	      location: newLocation,
	      locationMode: newMode
	    });

	    this.props.onLocationChange(newLocation);
	  },

	  onTagsCategoryChange: function onTagsCategoryChange(type) {

	    var self = this;

	    return function (newData, errors) {

	      var agendaIndex = self.getAgendaIndex(),
	          agendas = {};

	      formErrors[type] = errors;

	      if (agendaIndex == -1) {

	        agendas = [{
	          uid: self.props.agendaUid,
	          tags: type == 'tags' ? newData : [],
	          category: type == 'category' ? newData : undefined
	        }];

	        self.setState({ agendas: agendas });
	      } else {

	        agendas[agendaIndex] = {};

	        agendas[agendaIndex][type] = { $set: newData };

	        self.setState({
	          agendas: update(self.state.agendas, agendas)
	        });
	      }

	      self.props.onAgendaDataChange({
	        uid: self.props.agendaUid,
	        tags: self.stringifySlugs(type == 'tags' ? newData : agendaIndex == -1 ? [] : self.state.agendas[agendaIndex].tags),
	        category: self.stringifySlugs(type == 'category' ? newData : agendaIndex == -1 ? undefined : self.state.agendas[agendaIndex].category),
	        errors: self.listErrorDetails()
	      });
	    };
	  },

	  stringifySlugs: function stringifySlugs(data) {

	    if (!data) return;

	    if (utils.isArray(data)) {

	      return data.map(function (d) {
	        return (typeof d === 'undefined' ? 'undefined' : (0, _typeof3.default)(d)) == 'object' ? d.slug : d;
	      });
	    } else {

	      return (typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) == 'object' ? data.slug : data;
	    }
	  },

	  getSelectedCategory: function getSelectedCategory() {

	    var aIndex = this.getAgendaIndex();

	    if (aIndex == -1) return;

	    var category = this.state.agendas[aIndex].category;

	    if (!category) return;

	    if (typeof category == 'string') return { slug: category };

	    return category;
	  },

	  getSelectedTags: function getSelectedTags() {

	    var aIndex = this.getAgendaIndex();

	    if (aIndex == -1) return [];

	    var tags = this.state.agendas[aIndex].tags;

	    if (!tags || !tags.length) return [];

	    if (typeof tags[0] == 'string') {

	      return tags.map(function (t) {
	        return { slug: t };
	      });
	    }

	    return tags;
	  },

	  getAgendaIndex: function getAgendaIndex() {

	    var self = this,
	        agendaIndex = -1;

	    if (!this.state.agendas) return agendaIndex;

	    this.state.agendas.forEach(function (agenda, i) {

	      if (agenda.uid == self.props.agendaUid) agendaIndex = i;
	    });

	    return agendaIndex;
	  },

	  changeLanguages: function changeLanguages(languages) {

	    var swapIndex,
	        removedLanguage,
	        addedLanguage,
	        swapFrom,
	        swapTo,
	        self = this;

	    if (languageUtils.isSame(languages, this.state.languages)) {

	      // nothing changed.
	      return;
	    }

	    swapIndex = languageUtils.getSwapIndex(languages, this.state.languages);

	    if (swapIndex !== -1) {

	      swapFrom = this.state.languages[swapIndex];

	      swapTo = languages[swapIndex];

	      return this.onSwappedLanguage(languages, swapFrom, swapTo);
	    }

	    if (languages.length < this.state.languages.length) {

	      // a language was removed

	      removedLanguage = this.state.languages.filter(function (l) {

	        return languages.indexOf(l) == -1;
	      })[0];

	      return this.onChangedLanguage(languages, removedLanguage);
	    }

	    // a language was added 
	    addedLanguage = languages.filter(function (l) {

	      return self.state.languages.indexOf(l) == -1;
	    })[0];

	    this.onChangedLanguage(languages, addedLanguage, '');
	  },

	  renderMarkdownField: function renderMarkdownField() {

	    return React.createElement(WysiwygMarkdown, {
	      label: this.props.configuration.field('longDescription').getLabel(false, this.props.labels),
	      placeholder: this.props.configuration.field('longDescription').getPlaceholder(false, this.props.labels),
	      name: 'long_description',
	      markdown: this.state.freeText,
	      languages: this.state.languages,
	      onChange: this.onChange('freeText'),
	      labels: this.props.labels,
	      lang: this.props.lang });
	  },

	  renderLocationSelector: function renderLocationSelector() {

	    return React.createElement(
	      'div',
	      { className: 'form-section' },
	      React.createElement(LocationSelector, {
	        settings: this.props.configuration.field('location').settings,
	        mode: this.state.locationMode,
	        onChangeMode: this.onLocationModeChange,
	        location: this.state.location,
	        lang: this.props.lang,
	        res: this.props.locationRes,
	        onChange: this.onLocationChange })
	    );
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      null,
	      this.state.locationMode === 'create' ? this.renderLocationSelector() : null,
	      React.createElement(
	        'div',
	        { style: { display: this.state.locationMode === 'create' ? 'none' : 'block' } },
	        this.props.categories && this.props.categories.length || this.props.categorySet && this.props.categorySet.categories.length ? React.createElement(CategorySelector, {
	          lang: this.props.lang,
	          set: this.props.categorySet,
	          categories: this.props.categories,
	          selection: this.getSelectedCategory(),
	          onChange: this.onTagsCategoryChange('category'),
	          labels: this.props.labels }) : '',
	        this.props.tags && this.props.tags.length || this.props.tagSet && this.props.tagSet.groups.length ? React.createElement(TagSelector, {
	          lang: this.props.lang,
	          set: this.props.tagSet,
	          tags: this.props.tags,
	          selection: this.getSelectedTags(),
	          onChange: this.onTagsCategoryChange('tags'),
	          labels: this.props.labels }) : '',
	        React.createElement('div', { className: 'js_event_image_canvas' }),
	        React.createElement(
	          'h2',
	          null,
	          this.props.labels.descriptionSection[this.props.lang]
	        ),
	        React.createElement(LanguageBar, {
	          languages: this.state.languages,
	          onChange: this.changeLanguages,
	          getLabel: this.getLabel }),
	        React.createElement(
	          'div',
	          { className: 'form-section' },
	          React.createElement(MultilingualTextField, {
	            constraints: { max: 140 },
	            counter: true,
	            optional: false,
	            label: this.props.labels.title,
	            name: 'title',
	            type: 'text',
	            value: this.state.title,
	            error: formErrors.title,
	            languages: this.state.languages,
	            onChange: this.onChange('title'),
	            lang: this.props.lang }),
	          React.createElement(MultilingualTextField, {
	            constraints: { max: 200 },
	            counter: true,
	            optional: false,
	            label: this.props.labels.description,
	            name: 'description',
	            type: 'text',
	            value: this.state.description,
	            error: formErrors.description,
	            languages: this.state.languages,
	            onChange: this.onChange('description'),
	            lang: this.props.lang }),
	          this.props.configuration.field('keywords').display() ? React.createElement(EventKeywordsField, {
	            constraints: { max: 255 },
	            counter: true,
	            value: this.state.tags,
	            name: 'keywords',
	            optional: true,
	            languages: this.state.languages,
	            onChange: this.onChange('tags'),
	            label: this.props.labels.keywords,
	            error: formErrors.tags,
	            placeholder: this.props.labels.keywordPlaceholder,
	            lang: this.props.lang }) : null,
	          this.renderMarkdownField(),
	          React.createElement(MultilingualTextField, {
	            constraints: { max: 255 },
	            counter: true,
	            label: this.props.configuration.field('conditions').getLabel(false, this.props.labels),
	            placeholder: this.props.configuration.field('conditions').getPlaceholder(false, this.props.labels),
	            name: 'conditions',
	            type: 'text',
	            optional: true,
	            value: this.state.conditions,
	            error: formErrors.conditions,
	            languages: this.state.languages,
	            onChange: this.onChange('conditions'),
	            lang: this.props.lang }),
	          React.createElement(Registration, {
	            lang: this.props.lang,
	            value: this.state.ticketLink,
	            onChange: this.onChange('ticketLink') }),
	          React.createElement(AccessibilityFields, {
	            value: this.state.accessibility || [],
	            label: this.props.labels.accessibility,
	            onChange: this.onChange('accessibility'),
	            labelsLang: this.props.lang }),
	          this.props.configuration.field('age').display() ? React.createElement(AgeFields, {
	            value: this.state.age,
	            label: this.props.labels.age,
	            onChange: this.onChange('age'),
	            labelsLang: this.props.lang }) : null
	        ),
	        this.props.custom ? React.createElement(
	          'div',
	          { className: 'form-section' },
	          React.createElement(CustomFields, {
	            fields: this.props.custom,
	            values: this.state.custom,
	            errors: formErrors,
	            languages: this.state.languages,
	            onChange: this.changeCustom,
	            labels: this.props.labels,
	            res: this.props.customRes,
	            lang: this.props.lang })
	        ) : '',
	        React.createElement(
	          'div',
	          null,
	          React.createElement(
	            'h2',
	            null,
	            this.props.labels.locationSection[this.props.lang]
	          ),
	          this.state.locationMode === 'create' ? null : this.renderLocationSelector()
	        ),
	        React.createElement(TimingsPicker, {
	          labels: this.props.labels,
	          lang: this.props.lang,
	          error: formErrors.timings,
	          timings: this.state.timings,
	          configuration: this.props.configuration.field('timings'),
	          onChange: this.onTimingsChange }),
	        React.createElement('div', { className: 'js_form_canvas_below' })
	      )
	    );
	  }

	}));

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"core-js/library/fn/json/stringify\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())), __esModule: true };

/***/ },
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


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

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    languages = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"languages\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    Select = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-select\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    labels = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../labels\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    makeLabelGetter = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../lib/makeLabelGetter\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	module.exports = React.createClass({

	  displayName: 'LanguageBar',

	  propTypes: {

	    // used by component to load labels
	    getLabel: React.PropTypes.func,

	    // notify parent of new language selection
	    onChange: React.PropTypes.func

	  },

	  getInitialState: function getInitialState() {

	    return {
	      displaySelect: false,
	      sortedLanguageCodes: this.sortLanguageCodes(),
	      edited: false
	    };
	  },
	  getDefaultProps: function getDefaultProps() {

	    return {
	      getLabel: makeLabelGetter(labels)
	    };
	  },
	  onRemove: function onRemove(code) {

	    this.props.onChange(this.props.languages.filter(function (l) {

	      return l !== code;
	    }));
	  },
	  sortLanguageCodes: function sortLanguageCodes() {

	    return languages.getAllLanguageCode().map(function (c) {

	      return {
	        code: c,
	        label: languages.getLanguageInfo(c).nativeName
	      };
	    }).sort(function (a, b) {

	      if (a.label < b.label) return -1;

	      if (a.label > b.label) return 1;

	      return 0;
	    }).map(function (a) {

	      return a.code;
	    });
	  },
	  getRemainingLanguages: function getRemainingLanguages() {
	    var _this = this;

	    var self = this;

	    return this.state.sortedLanguageCodes.filter(function (c) {
	      return _this.props.languages.indexOf(c) == -1;
	    }).map(function (c) {

	      return {
	        value: c,
	        label: languages.getLanguageInfo(c).nativeName
	      };
	    });
	  },
	  showSelect: function showSelect() {

	    this.setState({
	      displaySelect: true
	    });
	  },
	  hideSelect: function hideSelect() {

	    this.setState({
	      displaySelect: false
	    });
	  },
	  languageAdd: function languageAdd(newCode) {

	    var languages = this.props.languages.slice();

	    languages.push(newCode);

	    this.hideSelect();

	    this.props.onChange(languages);
	  },
	  languageEdit: function languageEdit(code) {

	    this.setState({ edited: code });
	  },
	  languageChange: function languageChange(previousCode, newCode) {

	    var languages = this.props.languages.slice();

	    languages.splice(languages.indexOf(previousCode), 1, newCode);

	    this.setState({ edited: false });

	    this.props.onChange(languages);
	  },
	  render: function render() {
	    var _this2 = this;

	    var languageItem = function languageItem(l) {

	      return React.createElement(LanguageItem, {
	        code: l,
	        key: l,
	        edited: l == _this2.state.edited,
	        languages: _this2.props.languages,
	        getRemainingLanguages: _this2.getRemainingLanguages,
	        onRemove: _this2.onRemove,
	        onChange: _this2.languageChange,
	        onEdit: _this2.languageEdit.bind(null, l) });
	    };

	    return React.createElement(
	      'div',
	      { className: 'language-bar' },
	      React.createElement(
	        'ul',
	        null,
	        this.props.languages.map(languageItem)
	      ),
	      React.createElement(
	        'span',
	        { className: 'language-add cform' },
	        this.state.displaySelect ? React.createElement(Select, {
	          options: this.getRemainingLanguages(),
	          onChange: this.languageAdd,
	          clearable: false }) : React.createElement(
	          'a',
	          { className: 'url', onClick: this.showSelect },
	          this.props.getLabel('addLanguage')
	        )
	      )
	    );
	  }
	});

	var LanguageItem = React.createClass({
	  displayName: 'LanguageItem',


	  onRemove: function onRemove() {

	    this.props.onRemove(this.props.code);
	  },

	  renderCross: function renderCross() {

	    return React.createElement(
	      'span',
	      { onClick: this.onRemove, className: 'remove' },
	      '✕'
	    );
	  },


	  onChange: function onChange(code) {

	    this.props.onChange(this.props.code, code);
	  },

	  render: function render() {

	    var lInfo = languages.getLanguageInfo(this.props.code);

	    if (this.props.edited) {

	      return React.createElement(
	        'li',
	        null,
	        React.createElement(Select, {
	          value: lInfo.nativeName,
	          options: this.props.getRemainingLanguages(),
	          onChange: this.onChange,
	          clearable: false })
	      );
	    } else {

	      return React.createElement(
	        'li',
	        null,
	        React.createElement(
	          'div',
	          { className: 'language-item' },
	          React.createElement(
	            'span',
	            { onClick: this.props.onEdit },
	            lInfo.nativeName
	          ),
	          this.props.languages.length > 1 ? this.renderCross() : null
	        )
	      );
	    }

	    return React.createElement(
	      'li',
	      null,
	      this.props.edited ? 'edited' : React.createElement(
	        'span',
	        { onClick: this.props.onEdit },
	        lInfo.nativeName
	      ),
	      this.props.languages.length > 1 ? this.renderCross() : null
	    );
	  }

	});

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/TextField.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    validators = __webpack_require__(16),
	    renderHelpers = __webpack_require__(18),
	    errors = __webpack_require__(17),
	    utils = __webpack_require__(2),
	    typeValidators = {
	  integer: { func: validators.isInteger, error: 'notInt' },
	  number: { func: validators.isNumber, error: 'notNum' },
	  email: { func: validators.isEmail, error: 'notEmail' },
	  url: { func: validators.isUrl, error: 'notURL' }
	},
	    typeCleaners = {
	  integer: trim,
	  number: trim,
	  email: trim,
	  url: trim
	};

	function trim(v) {

	  return v.trim();
	}

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      userHasTyped: false
	    };
	  },

	  componentDidMount: function componentDidMount() {

	    // need to validate data on mount
	    this.props.onChange(this.props.value || '', this.validate(this.props.value || ''));
	  },

	  onChange: function onChange(e) {

	    var value = e.target.value;

	    if (typeCleaners[this.props.type]) {

	      value = typeCleaners[this.props.type](value);
	    }

	    this.setState({ userHasTyped: true });

	    this.props.onChange(value, this.validate(value));
	  },

	  renderField: function renderField() {

	    if (this.props.type !== 'textarea') {

	      return React.createElement('input', {
	        name: this.props.name,
	        className: 'form-control',
	        type: 'text',
	        value: this.props.value ? this.props.value : '',
	        onChange: this.onChange });
	    } else {

	      return React.createElement('textarea', {
	        className: 'form-control',
	        rows: '4',
	        name: this.props.name,
	        value: this.props.value,
	        onChange: this.onChange });
	    }
	  },

	  render: function render() {

	    return React.createElement(
	      'ul',
	      null,
	      React.createElement(
	        'li',
	        null,
	        React.createElement(
	          'label',
	          null,
	          this.props.label[this.props.lang],
	          this.props.optional ? '' : ' (*)'
	        ),
	        renderHelpers.renderInfo.apply(this),
	        this.renderField(),
	        renderHelpers.renderError.apply(this)
	      )
	    );
	  },

	  validate: function validate(value) {

	    var messages = errors.messages(this.props.lang),
	        constraints = this.props.constraints || {};

	    if (value === undefined) value = '';

	    if (value === null) value = '';

	    if (!(value + '').length) {

	      if (!this.props.optional) {

	        return messages.notEmpty();
	      }

	      return false;
	    }

	    if (constraints.max !== undefined && value.length > constraints.max) {

	      return messages.tooLong(constraints.max);
	    }

	    if (constraints.min !== undefined && value.length < constraints.min) {

	      return messages.tooShort(constraints.min);
	    }

	    if (typeValidators[this.props.type] && !typeValidators[this.props.type].func(value)) {

	      return messages[typeValidators[this.props.type].error]();
	    }

	    return false;
	  }

	}));

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var errors = __webpack_require__(17);

	module.exports = {
	  isInteger: isInteger,
	  isNumber: isNumber,
	  isUrl: isUrl,
	  isEmail: isEmail,
	  validate: validate
	};

	/**
	 * validate multilingual field values
	 */

	function validate(value, languages) {

	  var currentMessages = {},
	      messages = errors.messages(this.props.lang),
	      self = this,
	      has = false;

	  if (!languages) languages = this.props.languages;

	  languages.forEach(function (l) {

	    var v = value[l] || '',
	        message;

	    if (!v.length && self.props.optional === false) {

	      message = messages.notEmpty();
	    } else if (self.props.constraints.max !== undefined && v.length > self.props.constraints.max) {

	      message = messages.tooLong(self.props.constraints.max);
	    } else if (self.props.constraints.min !== undefined && v.length < self.props.constraints.min) {

	      message = messages.tooShort(self.props.constraints.min);
	    }

	    if (message) {

	      currentMessages[l] = message;

	      has = true;
	    }
	  });

	  return has ? currentMessages : false;
	}

	function isUrl(v) {

	  if (typeof v !== 'string') return false;

	  //http://stackoverflow.com/questions/5984116/regular-expression-for-w3c-compliant-urls
	  var re = /^\s*[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&\'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@])|[\uE000-\uF8FF\uF0000-\uFFFFD|\u100000-\u10FFFD\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\uA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&\'\(\)\*\+,;=:@])|[\/\?])*)?\s*$/i;

	  return re.test(v);
	}

	function isEmail(v) {

	  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
	  var re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

	  return re.test(v);
	}

	function isInteger(v) {

	  return v == parseInt(v, 10);
	}

	function isNumber(v) {

	  return !_isArray(v) && v - parseFloat(v) + 1 >= 0;
	}

	function _isArray(v) {

	  return Object.prototype.toString.call(v) === '[object Array]';
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  NOTINT: 0,
	  NOTEMPTY: 1,
	  TOOLONG: 2,
	  TOOSHORT: 3,
	  NOTNUM: 4,
	  NOTURL: 5,
	  NOTEMAIL: 6
	};

	module.exports.messages = function (lang) {

	  return {
	    notURL: notURL,
	    notEmail: notEmail,
	    notNum: notNum,
	    tooShort: tooShort,
	    tooLong: tooLong,
	    notInt: notInt,
	    notEmpty: notEmpty
	  };

	  function notNum() {

	    return _message(lang, {
	      en: 'this value must be a number',
	      fr: 'cette valeur doit être un nombre'
	    });
	  }

	  function notEmail() {

	    return _message(lang, {
	      en: 'this value must be an email address',
	      fr: 'cette valeur doit être une adresse email'
	    });
	  }

	  function notURL() {

	    return _message(lang, {
	      en: 'this value must be an url ( starting with http or https )',
	      fr: 'cette valeur doit être une url ( commençant par http ou https )'
	    });
	  }

	  function notInt() {

	    return _message(lang, {
	      en: 'the value must be an integer',
	      fr: 'la valeur doit être un entier'
	    });
	  }

	  function tooShort(min) {

	    return _message(lang, {
	      en: 'this value should be at least %s characters long',
	      fr: 'cette valeur doit au minimum avoir %s caractères'
	    }, min);
	  }

	  function tooLong(max) {

	    return _message(lang, {
	      en: 'this value cannot exceed %s characters',
	      fr: 'cette valeur ne doit pas exceder %s caractères'
	    }, max);
	  }

	  function notEmpty() {

	    return _message(lang, {
	      en: 'this field cannot be empty',
	      fr: 'ce champ ne peut pas rester vide'
	    });
	  }
	};

	function _message(lang, labels, value) {

	  var label;

	  if (!labels[lang]) {

	    for (lang in labels) {
	      break;
	    }
	  }

	  label = labels[lang];

	  if (!value) return label;

	  return label.replace('%s', value);
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12),
	    Counter = __webpack_require__(19),
	    du = __webpack_require__(4),
	    utils = __webpack_require__(2);

	module.exports = {
	  multilingual: {
	    render: mRender,
	    block: mBlock
	  },
	  renderInfo: renderInfo,
	  renderError: renderError,
	  errorOrInfo: errorOrInfo
	};

	function mBlock(l) {

	  var value,
	      count = this.props.languages.length;

	  if (typeof this.props.value == 'string') {

	    value = this.props.value;
	  } else {

	    value = this.props.value ? this.props.value[l] ? this.props.value[l] : '' : '';
	  }

	  if (count > 1) {

	    return React.createElement(
	      'li',
	      { className: 'lang-unit' },
	      React.createElement(
	        'label',
	        null,
	        l
	      ),
	      React.createElement(
	        'div',
	        null,
	        this.renderField(value, l),
	        renderError.call(this, l),
	        _counter(this.props, value)
	      )
	    );
	  } else {

	    return React.createElement(
	      'div',
	      null,
	      this.renderField(value, l),
	      renderError.call(this, l),
	      _counter(this.props, value)
	    );
	  }
	}

	function errorOrInfo() {

	  var errorRender = renderError.call(this);

	  if (errorRender) return errorRender;

	  return renderInfo.call(this);
	}

	function renderError(l) {

	  var message = false;

	  if (!this.state.userHasTyped) return;

	  if (!this.props.error) return;

	  message = l ? this.props.error[l] : this.props.error;

	  if (!message) return;

	  return React.createElement(
	    'span',
	    { className: 'error' },
	    message
	  );
	}

	function renderInfo() {

	  if (!this.props.info) return;

	  var infos = this.props.info[this.props.lang].split('\n');

	  return React.createElement(
	    'span',
	    { className: 'info' },
	    infos.map(function (info) {
	      return React.createElement(
	        'span',
	        null,
	        info
	      );
	    })
	  );
	}

	function mRender() {

	  if (this.props.languages.length > 1) {

	    return React.createElement(
	      'ul',
	      null,
	      React.createElement(
	        'li',
	        null,
	        React.createElement(
	          'label',
	          null,
	          this.props.label[this.props.lang],
	          this.props.optional ? '' : ' (*)'
	        ),
	        renderInfo.call(this)
	      ),
	      this.props.languages.map(this.renderBlock)
	    );
	  } else {

	    return React.createElement(
	      'ul',
	      null,
	      React.createElement(
	        'li',
	        null,
	        React.createElement(
	          'label',
	          null,
	          this.props.label[this.props.lang],
	          this.props.optional ? '' : ' (*)'
	        ),
	        renderInfo.call(this),
	        this.props.languages.map(this.renderBlock)
	      )
	    );
	  }
	}

	function _counter(props, value) {

	  var max = props.constraints && props.constraints.max ? props.constraints.max : false;

	  if (!max) return;

	  return React.createElement(Counter, { max: max, value: value });
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/Counter.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  render: function render() {

	    var diff = this.props.max - this.props.value.length;

	    return React.createElement(
	      'span',
	      { className: 'counter' + (diff < 0 ? ' error' : '') },
	      diff
	    );
	  }

	}));

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/MultilingualTextField.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    validators = __webpack_require__(16),
	    utils = __webpack_require__(2),
	    renderHelpers = __webpack_require__(18);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      userHasTyped: false
	    };
	  },

	  componentDidMount: function componentDidMount() {

	    var value = this.props.value;

	    if (utils.isArray(value)) value = false;

	    value = value ? value : this.convertToMultilingual(value);

	    // must run validator on init or else form is considered valid
	    // this is not enough as it does not take into account
	    // subsequent added languages
	    this.props.onChange(value, this.validate(value));
	  },

	  componentWillReceiveProps: function componentWillReceiveProps(newProps) {

	    var self = this;

	    if (newProps.languages.filter(function (l) {

	      return self.props.languages.indexOf(l) == -1;
	    }).length) {

	      // a language was added
	      this.props.onChange(newProps.value, this.validate(newProps.value, newProps.languages));
	    }
	  },

	  convertToMultilingual: function convertToMultilingual(v) {

	    var m = {};

	    utils.forEach(this.props.languages, function (language) {

	      m[language] = v;
	    });

	    return m;
	  },

	  onChange: function onChange(l) {

	    var self = this;

	    return function (e) {

	      var value = JSON.parse((0, _stringify2.default)(self.props.value || {}));

	      value[l] = e.target.value;

	      self.setState({ userHasTyped: true });

	      self.props.onChange(value, self.validate(value));
	    };
	  },

	  renderBlock: renderHelpers.multilingual.block,

	  renderField: function renderField(value, l) {

	    var name = this.props.languages.length > 1 ? this.props.name + '_' + l : this.props.name;

	    if (this.props.type !== 'textarea') {

	      return React.createElement('input', {
	        placeholder: this.props.placeholder ? this.props.placeholder[this.props.lang] : '',
	        name: name,
	        type: 'text',
	        value: value,
	        className: 'form-control',
	        onChange: this.onChange(l) });
	    } else {

	      return React.createElement('textarea', {
	        placeholder: this.props.placeholder ? this.props.placeholder[this.props.lang] : '',
	        name: name,
	        rows: this.props.rows,
	        value: value,
	        className: 'form-control',
	        onChange: this.onChange(l) });
	    }
	  },

	  renderError: renderHelpers.multilingual.error,

	  render: renderHelpers.multilingual.render,

	  validate: validators.validate

	}));

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/EventKeywordsField.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    TagsInput = __webpack_require__(22),
	    renderHelpers = __webpack_require__(18),
	    validators = __webpack_require__(16);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      userHasTyped: false,
	      currentInputs: {}
	    };
	  },

	  stringify: function stringify(tArr) {

	    return tArr.join(', ');
	  },

	  parse: function parse(tString) {

	    return (typeof tString !== 'string' ? '' : tString).split(',').filter(function (s) {

	      return !!s.length;
	    }).map(function (t) {

	      return t.trim('');
	    });
	  },

	  onChange: function onChange(l) {

	    var self = this;

	    return function (lTags) {

	      var currentInputs = JSON.parse((0, _stringify2.default)(self.state.currentInputs)),
	          tags = JSON.parse((0, _stringify2.default)(self.props.value || {}));

	      self.setState({ userHasTyped: true });

	      tags[l] = self.stringify(lTags);

	      currentInputs[l] = '';

	      self.setState({ currentInputs: currentInputs });

	      self.props.onChange(tags, self.validate(tags));
	    };
	  },

	  onBlur: function onBlur(l) {

	    var self = this;

	    return function () {

	      var currentInputs = JSON.parse((0, _stringify2.default)(self.state.currentInputs)),
	          tags = JSON.parse((0, _stringify2.default)(self.props.value || {})),
	          lTags = (tags[l] || '').split(',');

	      if (!currentInputs[l] || !currentInputs[l].length) return;

	      lTags.push(currentInputs[l]);

	      currentInputs[l] = '';

	      self.setState({ currentInputs: currentInputs });

	      tags[l] = self.stringify(lTags);

	      self.props.onChange(tags, self.validate(tags));
	    };
	  },

	  onInputChange: function onInputChange(l) {

	    var self = this;

	    return function (e) {

	      var currentInputs = JSON.parse((0, _stringify2.default)(self.state.currentInputs)),
	          hasComma = e.target.value.split(',').length > 1;

	      currentInputs[l] = e.target.value.split(',')[0];

	      self.setState({ currentInputs: currentInputs });

	      if (hasComma) self.onBlur(l)();
	    };
	  },

	  renderBlock: renderHelpers.multilingual.block,

	  renderError: renderHelpers.multilingual.error,

	  renderField: function renderField(value, l) {

	    return React.createElement(TagsInput, {
	      value: this.parse(this.props.value ? this.props.value[l] : ''),
	      inputProps: {
	        placeholder: value.length ? '' : this.props.placeholder[this.props.lang],
	        className: 'react-tagsinput-input',
	        onBlur: this.onBlur(l),
	        onChange: this.onInputChange(l),
	        value: this.state.currentInputs[l]
	      },
	      onChange: this.onChange(l),
	      ref: 'tags' });
	  },

	  render: renderHelpers.multilingual.render,

	  validate: validators.validate

	}));

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, !(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('react'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.React);
	    global.ReactTagsInput = mod.exports;
	  }
	})(this, function (module, exports, _react) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });

	  var _react2 = _interopRequireDefault(_react);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }

	  var _createClass = function () {
	    function defineProperties(target, props) {
	      for (var i = 0; i < props.length; i++) {
	        var descriptor = props[i];
	        descriptor.enumerable = descriptor.enumerable || false;
	        descriptor.configurable = true;
	        if ("value" in descriptor) descriptor.writable = true;
	        Object.defineProperty(target, descriptor.key, descriptor);
	      }
	    }

	    return function (Constructor, protoProps, staticProps) {
	      if (protoProps) defineProperties(Constructor.prototype, protoProps);
	      if (staticProps) defineProperties(Constructor, staticProps);
	      return Constructor;
	    };
	  }();

	  function _possibleConstructorReturn(self, call) {
	    if (!self) {
	      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	    }

	    return call && (typeof call === "object" || typeof call === "function") ? call : self;
	  }

	  function _inherits(subClass, superClass) {
	    if (typeof superClass !== "function" && superClass !== null) {
	      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	    }

	    subClass.prototype = Object.create(superClass && superClass.prototype, {
	      constructor: {
	        value: subClass,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	  }

	  var _extends = Object.assign || function (target) {
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

	  function _objectWithoutProperties(obj, keys) {
	    var target = {};

	    for (var i in obj) {
	      if (keys.indexOf(i) >= 0) continue;
	      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
	      target[i] = obj[i];
	    }

	    return target;
	  }

	  function uniq(arr) {
	    var out = [];

	    for (var i = 0; i < arr.length; i++) {
	      if (out.indexOf(arr[i]) === -1) {
	        out.push(arr[i]);
	      }
	    }

	    return out;
	  }

	  function defaultRenderTag(props) {
	    var tag = props.tag;
	    var key = props.key;
	    var onRemove = props.onRemove;
	    var classNameRemove = props.classNameRemove;

	    var other = _objectWithoutProperties(props, ['tag', 'key', 'onRemove', 'classNameRemove']);

	    return _react2.default.createElement(
	      'span',
	      _extends({ key: key }, other),
	      tag,
	      _react2.default.createElement('a', { className: classNameRemove, onClick: function onClick(e) {
	          return onRemove(key);
	        } })
	    );
	  }

	  defaultRenderTag.propTypes = {
	    key: _react2.default.PropTypes.number,
	    tag: _react2.default.PropTypes.string,
	    onRemove: _react2.default.PropTypes.func,
	    classNameRemove: _react2.default.PropTypes.string
	  };

	  function defaultRenderInput(props) {
	    var onChange = props.onChange;
	    var value = props.value;

	    var other = _objectWithoutProperties(props, ['onChange', 'value']);

	    return _react2.default.createElement('input', _extends({ type: 'text', onChange: onChange, value: value }, other));
	  }

	  defaultRenderInput.propTypes = {
	    value: _react2.default.PropTypes.string,
	    onChange: _react2.default.PropTypes.func
	  };

	  function defaultRenderLayout(tagComponents, inputComponent) {
	    return _react2.default.createElement(
	      'span',
	      null,
	      tagComponents,
	      inputComponent
	    );
	  }

	  function defaultPasteSplit(data) {
	    return data.split(' ').map(function (d) {
	      return d.trim();
	    });
	  }

	  var TagsInput = function (_React$Component) {
	    _inherits(TagsInput, _React$Component);

	    function TagsInput() {
	      _classCallCheck(this, TagsInput);

	      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TagsInput).call(this));

	      _this.state = { tag: '' };
	      _this.focus = _this.focus.bind(_this);
	      _this.blur = _this.blur.bind(_this);
	      return _this;
	    }

	    _createClass(TagsInput, [{
	      key: '_removeTag',
	      value: function _removeTag(index) {
	        var value = this.props.value.concat([]);
	        if (index > -1 && index < value.length) {
	          var changed = value.splice(index, 1);
	          this.props.onChange(value, changed, [index]);
	        }
	      }
	    }, {
	      key: '_clearInput',
	      value: function _clearInput() {
	        this.setState({ tag: '' });
	      }
	    }, {
	      key: '_addTags',
	      value: function _addTags(tags) {
	        var _props = this.props;
	        var validationRegex = _props.validationRegex;
	        var onChange = _props.onChange;
	        var onlyUnique = _props.onlyUnique;
	        var maxTags = _props.maxTags;
	        var value = _props.value;


	        // 1. Strip non-unique tags
	        if (onlyUnique) {
	          tags = uniq(tags);
	          tags = tags.filter(function (tag) {
	            return value.indexOf(tag) === -1;
	          });
	        }

	        // 2. Strip invalid tags
	        tags = tags.filter(function (tag) {
	          return validationRegex.test(tag);
	        });
	        tags = tags.filter(function (tag) {
	          return tag.trim().length > 0;
	        });

	        // 3. Strip extras based on limit
	        if (maxTags >= 0) {
	          var remainingLimit = Math.max(maxTags - value.length, 0);
	          tags = tags.slice(0, remainingLimit);
	        }

	        // 4. Add remaining tags to value
	        if (tags.length > 0) {
	          var newValue = value.concat(tags);
	          var indexes = [];
	          for (var i = 0; i < tags.length; i++) {
	            indexes.push(value.length + i);
	          }
	          onChange(newValue, tags, indexes);
	          this._clearInput();
	        }
	      }
	    }, {
	      key: 'focus',
	      value: function focus() {
	        this.refs.input.focus();
	      }
	    }, {
	      key: 'blur',
	      value: function blur() {
	        this.refs.input.focus();
	      }
	    }, {
	      key: 'accept',
	      value: function accept() {
	        var tag = this.state.tag;

	        if (tag !== '') {
	          this._addTags([tag]);
	        }
	      }
	    }, {
	      key: 'handlePaste',
	      value: function handlePaste(e) {
	        var _props2 = this.props;
	        var addOnPaste = _props2.addOnPaste;
	        var pasteSplit = _props2.pasteSplit;


	        if (!addOnPaste) {
	          return;
	        }

	        e.preventDefault();

	        var data = e.clipboardData.getData('text/plain');
	        var tags = pasteSplit(data);

	        this._addTags(tags);
	      }
	    }, {
	      key: 'handleKeyDown',
	      value: function handleKeyDown(e) {
	        var _props3 = this.props;
	        var value = _props3.value;
	        var removeKeys = _props3.removeKeys;
	        var addKeys = _props3.addKeys;
	        var tag = this.state.tag;

	        var empty = tag === '';
	        var add = addKeys.indexOf(e.keyCode) !== -1;
	        var remove = removeKeys.indexOf(e.keyCode) !== -1;

	        if (add) {
	          e.preventDefault();
	          this.accept();
	        }

	        if (remove && value.length > 0 && empty) {
	          e.preventDefault();
	          this._removeTag(value.length - 1);
	        }
	      }
	    }, {
	      key: 'handleClick',
	      value: function handleClick(e) {
	        if (e.target === this.refs.div) {
	          this.focus();
	        }
	      }
	    }, {
	      key: 'handleChange',
	      value: function handleChange(e) {
	        var onChange = this.props.inputProps.onChange;

	        var tag = e.target.value;

	        if (onChange) {
	          onChange(e);
	        }

	        this.setState({ tag: tag });
	      }
	    }, {
	      key: 'handleOnBlur',
	      value: function handleOnBlur(e) {
	        if (this.props.addOnBlur) {
	          this._addTags([e.target.value]);
	        }
	      }
	    }, {
	      key: 'handleRemove',
	      value: function handleRemove(tag) {
	        this._removeTag(tag);
	      }
	    }, {
	      key: 'inputProps',
	      value: function inputProps() {
	        var _props$inputProps = this.props.inputProps;
	        var
	        // eslint-disable-next-line
	        onChange = _props$inputProps.onChange;

	        var otherInputProps = _objectWithoutProperties(_props$inputProps, ['onChange']);

	        return otherInputProps;
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var _this2 = this;

	        var _props4 = this.props;
	        var
	        // eslint-disable-next-line
	        value = _props4.value;
	        var onChange = _props4.onChange;
	        var inputProps = _props4.inputProps;
	        var tagProps = _props4.tagProps;
	        var renderLayout = _props4.renderLayout;
	        var renderTag = _props4.renderTag;
	        var renderInput = _props4.renderInput;
	        var addKeys = _props4.addKeys;
	        var removeKeys = _props4.removeKeys;

	        var other = _objectWithoutProperties(_props4, ['value', 'onChange', 'inputProps', 'tagProps', 'renderLayout', 'renderTag', 'renderInput', 'addKeys', 'removeKeys']);

	        var tag = this.state.tag;


	        var tagComponents = value.map(function (tag, index) {
	          return renderTag(_extends({ key: index, tag: tag, onRemove: _this2.handleRemove.bind(_this2) }, tagProps));
	        });

	        var inputComponent = renderInput(_extends({
	          ref: 'input',
	          value: tag,
	          onPaste: this.handlePaste.bind(this),
	          onKeyDown: this.handleKeyDown.bind(this),
	          onChange: this.handleChange.bind(this),
	          onBlur: this.handleOnBlur.bind(this)
	        }, this.inputProps()));

	        return _react2.default.createElement(
	          'div',
	          _extends({ ref: 'div', onClick: this.handleClick.bind(this) }, other),
	          renderLayout(tagComponents, inputComponent)
	        );
	      }
	    }]);

	    return TagsInput;
	  }(_react2.default.Component);

	  TagsInput.propTypes = {
	    addKeys: _react2.default.PropTypes.array,
	    addOnBlur: _react2.default.PropTypes.bool,
	    addOnPaste: _react2.default.PropTypes.bool,
	    inputProps: _react2.default.PropTypes.object,
	    onChange: _react2.default.PropTypes.func.isRequired,
	    removeKeys: _react2.default.PropTypes.array,
	    renderInput: _react2.default.PropTypes.func,
	    renderTag: _react2.default.PropTypes.func,
	    renderLayout: _react2.default.PropTypes.func,
	    pasteSplit: _react2.default.PropTypes.func,
	    tagProps: _react2.default.PropTypes.object,
	    onlyUnique: _react2.default.PropTypes.bool,
	    value: _react2.default.PropTypes.array.isRequired,
	    maxTags: _react2.default.PropTypes.number,
	    validationRegex: _react2.default.PropTypes.instanceOf(RegExp)
	  };
	  TagsInput.defaultProps = {
	    className: 'react-tagsinput',
	    addKeys: [9, 13],
	    addOnBlur: false,
	    addOnPaste: false,
	    inputProps: { className: 'react-tagsinput-input' },
	    removeKeys: [8],
	    renderInput: defaultRenderInput,
	    renderTag: defaultRenderTag,
	    renderLayout: defaultRenderLayout,
	    pasteSplit: defaultPasteSplit,
	    tagProps: { className: 'react-tagsinput-tag', classNameRemove: 'react-tagsinput-remove' },
	    onlyUnique: false,
	    maxTags: -1,
	    validationRegex: /.*/
	  };
	  exports.default = TagsInput;
	  module.exports = exports['default'];
	});



/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/WysiwygMarkdown.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    marked = __webpack_require__(24),
	    toMarkdown = __webpack_require__(25),
	    debug = __webpack_require__(26),
	    log = debug('wysiwyg'),
	    changeDelay = 3000,
	    tm; // refreshing the component is expensive

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    return {
	      isTyping: false
	    };
	  },

	  onChange: function onChange(l) {

	    var self = this;

	    return function (e) {

	      var changed = self.props.markdown ? JSON.parse((0, _stringify2.default)(self.props.markdown)) : {},
	          errored = false; // opera

	      try {

	        changed[l] = toMarkdown(e.target.getContent());
	      } catch (e) {

	        errored = true;
	      }

	      if (!errored) self.props.onChange(changed);
	    };
	  },

	  /**
	   * ensure pasted content is cleaned up before
	   * it is processed 
	   */

	  cleanNode: function cleanNode(node) {

	    var clean = document.createElement(node.nodeName),
	        cleanChild,
	        i,
	        type,
	        child,
	        cleanType;

	    for (var i = 0; i < node.childNodes.length; i++) {

	      child = node.childNodes[i];

	      type = child.nodeName.toLowerCase();

	      cleanType = ['p', 'h1', 'h2', 'h3'].indexOf(type) !== -1 ? type : 'p';

	      cleanChild = document.createElement(cleanType);

	      cleanChild.innerHTML = this.flattenChildren(child);

	      if (cleanChild.innerHTML.length) {

	        clean.appendChild(cleanChild);
	      }
	    }

	    return clean;
	  },

	  getCleanTextContent: function getCleanTextContent(elem) {

	    var attr = 'innerText' in elem ? 'innerText' : 'textContent',
	        content = elem[attr] || '',
	        cleanContent = content.replace(new RegExp(['[', String.fromCharCode(8233), String.fromCharCode(8232), ']'].join(''), 'g'), ' ');

	    return cleanContent.trim();
	  },

	  /**
	   * because we don't deal with fancy in-depth html,
	   * we prevent it from being pasted by using this
	   */

	  flattenChildren: function flattenChildren(node) {

	    var flattened = '';

	    if (!node.childNodes.length) {

	      return this.getCleanTextContent(node);
	    }

	    for (var i = 0; i < node.childNodes.length; i++) {

	      if (node.childNodes[i].childNodes.length) {

	        flattened += this.flattenChildren(node.childNodes[i]);
	      } else {

	        flattened += node.childNodes[i].nodeValue || '';
	      }
	    }

	    return flattened;
	  },

	  render: function render() {

	    var self = this,
	        count = this.props.languages.length,
	        renderField = function renderField(l, i) {

	      var value = self.props.markdown ? self.props.markdown[l] ? self.props.markdown[l] : '' : '';

	      setTimeout(function () {

	        tinymce.init({
	          selector: '.mce-box-' + i,
	          language: self.props.lang == 'fr' ? 'fr_FR' : 'en_EN',
	          menubar: false,
	          plugins: 'autolink link lists print preview autoresize paste placeholder',
	          toolbar: 'formatselect bold italic bullist link',
	          statusbar: false,
	          browser_spellcheck: true,
	          block_formats: 'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;',
	          autoresize_min_height: 100,
	          // https://www.tinymce.com/docs/plugins/link/#link_title
	          link_title: false,
	          default_link_target: '_blank',
	          link_assume_external_targets: true,

	          setup: function setup(editor) {

	            editor.on('change', self.onChange(l));
	          },
	          paste_postprocess: function paste_postprocess(pl, o) {

	            // paste from word-type processors insert a mess of tags
	            // in the html; these must be cleaned
	            o.node = self.cleanNode(o.node);
	          }
	        });
	      });

	      if (count > 1) {

	        return React.createElement(
	          'li',
	          { className: 'lang-unit' },
	          React.createElement(
	            'label',
	            { className: 'off32' },
	            l
	          ),
	          React.createElement('textarea', { className: 'mce-box-' + i, value: marked(value), placeholder: self.props.placeholder[self.props.lang] })
	        );
	      } else {

	        return React.createElement('textarea', { className: 'mce-box-' + i, value: marked(value), placeholder: self.props.placeholder[self.props.lang] });
	      }
	    };

	    if (count > 1) {

	      return React.createElement(
	        'ul',
	        null,
	        React.createElement(
	          'li',
	          null,
	          React.createElement(
	            'label',
	            null,
	            this.props.label[this.props.lang]
	          )
	        ),
	        this.props.languages.map(renderField)
	      );
	    } else {

	      return React.createElement(
	        'ul',
	        null,
	        React.createElement(
	          'li',
	          null,
	          React.createElement(
	            'label',
	            null,
	            this.props.label[this.props.lang]
	          ),
	          this.props.languages.map(renderField)
	        )
	      );
	    }
	  }

	}));

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function() {

	/**
	 * Block-Level Grammar
	 */

	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};

	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();

	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();

	/**
	 * Normal Block Grammar
	 */

	block.normal = merge({}, block);

	/**
	 * GFM Block Grammar
	 */

	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/,
	  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
	});

	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();

	/**
	 * GFM + Tables Block Grammar
	 */

	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});

	/**
	 * Block Lexer
	 */

	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;

	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}

	/**
	 * Expose Block Rules
	 */

	Lexer.rules = block;

	/**
	 * Static Lex Method
	 */

	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};

	/**
	 * Preprocessing
	 */

	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');

	  return this.token(src, true);
	};

	/**
	 * Lexing
	 */

	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;

	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }

	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3] || ''
	      });
	      continue;
	    }

	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }

	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }

	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }

	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);

	      this.tokens.push({
	        type: 'blockquote_start'
	      });

	      cap = cap[0].replace(/^ *> ?/gm, '');

	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);

	      this.tokens.push({
	        type: 'blockquote_end'
	      });

	      continue;
	    }

	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];

	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });

	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);

	      next = false;
	      l = cap.length;
	      i = 0;

	      for (; i < l; i++) {
	        item = cap[i];

	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }

	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }

	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }

	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });

	        // Recurse.
	        this.token(item, false, bq);

	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }

	      this.tokens.push({
	        type: 'list_end'
	      });

	      continue;
	    }

	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: !this.options.sanitizer
	          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
	        text: cap[0]
	      });
	      continue;
	    }

	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }

	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return this.tokens;
	};

	/**
	 * Inline-Level Grammar
	 */

	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};

	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();

	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();

	/**
	 * Normal Inline Grammar
	 */

	inline.normal = merge({}, inline);

	/**
	 * Pedantic Inline Grammar
	 */

	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});

	/**
	 * GFM Inline Grammar
	 */

	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});

	/**
	 * GFM + Line Breaks Inline Grammar
	 */

	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});

	/**
	 * Inline Lexer & Compiler
	 */

	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;

	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }

	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}

	/**
	 * Expose Inline Rules
	 */

	InlineLexer.rules = inline;

	/**
	 * Static Lexing/Compiling Method
	 */

	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};

	/**
	 * Lexing/Compiling
	 */

	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;

	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }

	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? this.options.sanitizer
	          ? this.options.sanitizer(cap[0])
	          : escape(cap[0])
	        : cap[0]
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }

	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.text(escape(this.smartypants(cap[0])));
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return out;
	};

	/**
	 * Compile Link
	 */

	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;

	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};

	/**
	 * Smartypants Transformations
	 */

	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/---/g, '\u2014')
	    // en-dashes
	    .replace(/--/g, '\u2013')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};

	/**
	 * Mangle Links
	 */

	InlineLexer.prototype.mangle = function(text) {
	  if (!this.options.mangle) return text;
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;

	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }

	  return out;
	};

	/**
	 * Renderer
	 */

	function Renderer(options) {
	  this.options = options || {};
	}

	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};

	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};

	Renderer.prototype.html = function(html) {
	  return html;
	};

	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};

	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};

	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};

	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};

	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};

	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};

	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};

	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};

	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};

	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};

	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};

	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};

	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};

	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};

	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};

	Renderer.prototype.text = function(text) {
	  return text;
	};

	/**
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();

	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }

	  return out;
	};

	/**
	 * Next Token
	 */

	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};

	/**
	 * Preview Next Token
	 */

	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};

	/**
	 * Parse Text Tokens
	 */

	Parser.prototype.parseText = function() {
	  var body = this.token.text;

	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }

	  return this.inline.output(body);
	};

	/**
	 * Parse Current Token
	 */

	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;

	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);

	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];

	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }

	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};

	/**
	 * Helpers
	 */

	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}

	function unescape(html) {
	  return html.replace(/&([#\w]+);/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

	function noop() {}
	noop.exec = noop;

	function merge(obj) {
	  var i = 1
	    , target
	    , key;

	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }

	  return obj;
	}


	/**
	 * Marked
	 */

	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }

	    opt = merge({}, marked.defaults, opt || {});

	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;

	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }

	    pending = tokens.length;

	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }

	      var out;

	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }

	      opt.highlight = highlight;

	      return err
	        ? callback(err)
	        : callback(null, out);
	    };

	    if (!highlight || highlight.length < 3) {
	      return done();
	    }

	    delete opt.highlight;

	    if (!pending) return done();

	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }

	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}

	/**
	 * Options
	 */

	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};

	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  sanitizer: null,
	  mangle: true,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

	marked.Renderer = Renderer;

	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;

	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;

	marked.parse = marked;

	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}

	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * to-markdown - an HTML to Markdown converter
	 *
	 * Copyright 2011-15, Dom Christie
	 * Licenced under the MIT licence
	 *
	 */

	'use strict';

	var toMarkdown;
	var converters;
	var mdConverters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/md-converters\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var gfmConverters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/gfm-converters\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var collapse = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"collapse-whitespace\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	/*
	 * Set up window and document for Node.js
	 */

	var _window = (typeof window !== 'undefined' ? window : this), _document;
	if (typeof document === 'undefined') {
	  _document = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"jsdom\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).jsdom();
	}
	else {
	  _document = document;
	}

	/*
	 * Utilities
	 */

	function trim(string) {
	  return string.replace(/^[ \r\n\t]+|[ \r\n\t]+$/g, '');
	}

	var blocks = ['address', 'article', 'aside', 'audio', 'blockquote', 'body',
	  'canvas', 'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
	  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4','h5', 'h6',
	  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
	  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
	  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
	];

	function isBlock(node) {
	  return blocks.indexOf(node.nodeName.toLowerCase()) !== -1;
	}

	var voids = [
	  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
	  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
	];

	function isVoid(node) {
	  return voids.indexOf(node.nodeName.toLowerCase()) !== -1;
	}

	/*
	 * Parsing HTML strings
	 */

	function canParseHtml() {
	  var Parser = _window.DOMParser, canParse = false;

	  // Adapted from https://gist.github.com/1129031
	  // Firefox/Opera/IE throw errors on unsupported types
	  try {
	    // WebKit returns null on unsupported types
	    if (new Parser().parseFromString('', 'text/html')) {
	      canParse = true;
	    }
	  } catch (e) {}
	  return canParse;
	}

	function createHtmlParser() {
	  var Parser = function () {};

	  Parser.prototype.parseFromString = function (string) {
	    var newDoc = _document.implementation.createHTMLDocument('');

	    if (string.toLowerCase().indexOf('<!doctype') > -1) {
	      newDoc.documentElement.innerHTML = string;
	    }
	    else {
	      newDoc.body.innerHTML = string;
	    }
	    return newDoc;
	  };
	  return Parser;
	}

	var HtmlParser = canParseHtml() ? _window.DOMParser : createHtmlParser();

	function htmlToDom(string) {
	  var tree = new HtmlParser().parseFromString(string, 'text/html');
	  collapse(tree, isBlock);
	  return tree;
	}

	/*
	 * Flattens DOM tree into single array
	 */

	function bfsOrder(node) {
	  var inqueue = [node],
	      outqueue = [],
	      elem, children, i;

	  while (inqueue.length > 0) {
	    elem = inqueue.shift();
	    outqueue.push(elem);
	    children = elem.childNodes;
	    for (i = 0 ; i < children.length; i++) {
	      if (children[i].nodeType === 1) { inqueue.push(children[i]); }
	    }
	  }
	  outqueue.shift();
	  return outqueue;
	}

	/*
	 * Contructs a Markdown string of replacement text for a given node
	 */

	function getContent(node) {
	  var text = '';
	  for (var i = 0; i < node.childNodes.length; i++) {
	    if (node.childNodes[i].nodeType === 1) {
	      text += node.childNodes[i]._replacement;
	    }
	    else if (node.childNodes[i].nodeType === 3) {
	      text += node.childNodes[i].data;
	    }
	    else { continue; }
	  }
	  return text;
	}

	/*
	 * Returns the HTML string of an element with its contents converted
	 */

	function outer(node, content) {
	  return node.cloneNode(false).outerHTML.replace('><', '>'+ content +'<');
	}

	function canConvert(node, filter) {
	  if (typeof filter === 'string') {
	    return filter === node.nodeName.toLowerCase();
	  }
	  if (Array.isArray(filter)) {
	    return filter.indexOf(node.nodeName.toLowerCase()) !== -1;
	  }
	  else if (typeof filter === 'function') {
	    return filter.call(toMarkdown, node);
	  }
	  else {
	    throw new TypeError('`filter` needs to be a string, array, or function');
	  }
	}

	function isFlankedByWhitespace(side, node) {
	  var sibling, regExp, isFlanked;

	  if (side === 'left') {
	    sibling = node.previousSibling;
	    regExp = / $/;
	  }
	  else {
	    sibling = node.nextSibling;
	    regExp = /^ /;
	  }

	  if (sibling) {
	    if (sibling.nodeType === 3) {
	      isFlanked = regExp.test(sibling.nodeValue);
	    }
	    else if(sibling.nodeType === 1 && !isBlock(sibling)) {
	      isFlanked = regExp.test(sibling.textContent);
	    }
	  }
	  return isFlanked;
	}

	function flankingWhitespace(node) {
	  var leading = '', trailing = '';

	  if (!isBlock(node)) {
	    var hasLeading = /^[ \r\n\t]/.test(node.innerHTML),
	        hasTrailing = /[ \r\n\t]$/.test(node.innerHTML);

	    if (hasLeading && !isFlankedByWhitespace('left', node)) {
	      leading = ' ';
	    }
	    if (hasTrailing && !isFlankedByWhitespace('right', node)) {
	      trailing = ' ';
	    }
	  }

	  return { leading: leading, trailing: trailing };
	}

	/*
	 * Finds a Markdown converter, gets the replacement, and sets it on
	 * `_replacement`
	 */

	function process(node) {
	  var replacement, content = getContent(node);

	  // Remove blank nodes
	  if (!isVoid(node) && !/A/.test(node.nodeName) && /^\s*$/i.test(content)) {
	    node._replacement = '';
	    return;
	  }

	  for (var i = 0; i < converters.length; i++) {
	    var converter = converters[i];

	    if (canConvert(node, converter.filter)) {
	      if (typeof converter.replacement !== 'function') {
	        throw new TypeError(
	          '`replacement` needs to be a function that returns a string'
	        );
	      }

	      var whitespace = flankingWhitespace(node);

	      if (whitespace.leading || whitespace.trailing) {
	        content = trim(content);
	      }
	      replacement = whitespace.leading +
	                    converter.replacement.call(toMarkdown, content, node) +
	                    whitespace.trailing;
	      break;
	    }
	  }

	  node._replacement = replacement;
	}

	toMarkdown = function (input, options) {
	  options = options || {};

	  if (typeof input !== 'string') {
	    throw new TypeError(input + ' is not a string');
	  }

	  // Escape potential ol triggers
	  input = input.replace(/(\d+)\. /g, '$1\\. ');

	  var clone = htmlToDom(input).body,
	      nodes = bfsOrder(clone),
	      output;

	  converters = mdConverters.slice(0);
	  if (options.gfm) {
	    converters = gfmConverters.concat(converters);
	  }

	  if (options.converters) {
	    converters = options.converters.concat(converters);
	  }

	  // Process through nodes in reverse (so deepest child elements are first).
	  for (var i = nodes.length - 1; i >= 0; i--) {
	    process(nodes[i]);
	  }
	  output = getContent(clone);

	  return output.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
	               .replace(/\n\s+\n/g, '\n\n')
	               .replace(/\n{3,}/g, '\n\n');
	};

	toMarkdown.isBlock = isBlock;
	toMarkdown.isVoid = isVoid;
	toMarkdown.trim = trim;
	toMarkdown.outer = outer;

	module.exports = toMarkdown;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./debug\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // This hackery is required for IE8,
	  // where the `console.log` function doesn't have 'apply'
	  return 'object' == typeof console
	    && 'function' == typeof console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      localStorage.removeItem('debug');
	    } else {
	      localStorage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = localStorage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/CustomFields.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    TextField = __webpack_require__(15),
	    MultilingualTextField = __webpack_require__(20),
	    CheckboxField = __webpack_require__(28),
	    RadioFields = __webpack_require__(29),
	    SelectField = __webpack_require__(31),
	    ImageUpload = __webpack_require__(33),
	    utils = __webpack_require__(2);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  onChange: function onChange(field) {

	    var self = this;

	    return function (value, error) {

	      self.props.onChange(field, value, error);
	    };
	  },

	  onImageChange: function onImageChange(field) {

	    var self = this;

	    return function (value, error) {

	      if (value) {

	        value = value.split('/').pop(); // we just want the file name, not the full url
	      }

	      self.props.onChange(field, value, error);
	    };
	  },

	  render: function render() {

	    var self = this,
	        createField = function createField(field) {

	      if (['integer', 'text', 'textarea', 'number', 'url', 'email'].indexOf(field.fieldType) !== -1) {

	        if (field.multilingual) {

	          return React.createElement(MultilingualTextField, {
	            name: field.name,
	            constraints: field,
	            label: field.label,
	            info: field.info,
	            optional: field.optional,
	            lang: self.props.lang,
	            type: field.fieldType,
	            value: self.props.values[field.name] ? self.props.values[field.name] : {},
	            error: self.props.errors[field.name] || false,
	            languages: self.props.languages,
	            onChange: self.onChange(field.name) });
	        } else {

	          return React.createElement(TextField, {
	            name: field.name,
	            constraints: field,
	            label: field.label,
	            info: field.info,
	            optional: field.optional,
	            lang: self.props.lang,
	            type: field.fieldType,
	            value: self.props.values[field.name] ? self.props.values[field.name] : '',
	            error: self.props.errors[field.name] || false,
	            onChange: self.onChange(field.name) });
	        }
	      } else if (field.fieldType == 'checkbox') {

	        return React.createElement(CheckboxField, {
	          name: field.name,
	          field: field,
	          lang: self.props.lang,
	          value: self.props.values[field.name] ? self.props.values[field.name] : '',
	          label: field.label,
	          handleUpdate: self.onChange(field.name) });
	      } else if (field.fieldType == 'radio') {

	        return React.createElement(RadioFields, {
	          name: field.name,
	          type: 'radio',
	          field: field,
	          lang: self.props.lang,
	          info: field.info,
	          value: self.props.values[field.name] ? self.props.values[field.name] : '',
	          error: self.props.errors[field.name] || false,
	          label: field.label,
	          onChange: self.onChange(field.name) });
	      } else if (field.fieldType == 'select') {

	        return React.createElement(SelectField, {
	          name: field.name,
	          field: field,
	          lang: self.props.lang,
	          info: field.info,
	          value: self.props.values[field.name] ? self.props.values[field.name] : '',
	          error: self.props.errors[field.name] || false,
	          label: field.label,
	          onChange: self.onChange(field.name) });
	      } else if (field.fieldType == 'multichoice') {

	        return React.createElement(RadioFields, {
	          name: field.name,
	          type: 'checkbox',
	          field: field,
	          lang: self.props.lang,
	          info: field.info,
	          value: self.props.values[field.name] ? self.props.values[field.name] : '',
	          error: self.props.errors[field.name] || false,
	          label: field.label,
	          onChange: self.onChange(field.name) });
	      } else if (field.fieldType == 'image') {

	        // value given here should be path.
	        // path can be given by EventForm & index;

	        return React.createElement(ImageUpload, {
	          className: 'upload',
	          name: field.name,
	          upload: self.props.res.upload.replace('{field}', field.name),
	          remove: self.props.res.remove.replace('{field}', field.name),
	          lang: self.props.lang,
	          value: self.props.values[field.name] ? self.props.res.path + self.props.values[field.name] : '',
	          label: field.label,
	          buttonLabel: self.props.labels.uploadButton,
	          buttonClass: 'blue button',
	          removeClass: 'red button',
	          handleUpdate: self.onImageChange(field.name) });
	      }
	    };

	    return React.createElement(
	      'div',
	      { className: 'custom-fields' },
	      this.props.fields.map(createField),
	      React.createElement('div', { className: 'separator' })
	    );
	  }

	}));

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: "/var/www/html/OpenAgenda/cibul-templates/eventForm/js/CheckboxField.jsx",
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12);

	module.exports = _wrapComponent("_component")(React.createClass({
	  displayName: "exports",


	  componentDidMount: function componentDidMount() {

	    this.update(this.props.value);
	  },

	  onChange: function onChange(e) {

	    this.update(e.target.checked);
	  },

	  update: function update(value) {

	    this.props.handleUpdate(value);
	  },

	  render: function render() {

	    return React.createElement(
	      "ul",
	      null,
	      React.createElement(
	        "li",
	        null,
	        React.createElement("input", { type: "checkbox", checked: this.props.value, onChange: this.onChange }),
	        React.createElement(
	          "label",
	          null,
	          this.props.field.label[this.props.lang],
	          this.props.field.optional ? '' : ' (*)'
	        )
	      )
	    );
	  }

	}));

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12),
	    RadioTypeField = __webpack_require__(30);

	module.exports = RadioTypeField({

	  isChecked: function isChecked(option) {

	    if (this.props.type == 'radio') {

	      return option.value == this.props.value;
	    } else {

	      return this.props.value.indexOf(option.value) !== -1;
	    }
	  },

	  renderField: function renderField() {

	    var self = this,
	        renderOption = function renderOption(option) {

	      return React.createElement(
	        'li',
	        null,
	        React.createElement('input', {
	          type: self.props.type,
	          name: self.props.field.name,
	          checked: self.isChecked(option),
	          onChange: self.onChange.bind(self, option.value) }),
	        React.createElement(
	          'label',
	          null,
	          option.label[self.props.lang]
	        )
	      );
	    };

	    return React.createElement(
	      'ul',
	      null,
	      this.props.field.options.map(renderOption)
	    );
	  }

	});

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12),
	    validators = __webpack_require__(16),
	    renderHelpers = __webpack_require__(18),
	    ERR = {
	  NOTEMPTY: 1
	},
	    utils = __webpack_require__(2);

	module.exports = function (funcs) {

	  return React.createClass(utils.extend({}, funcs, {

	    getInitialState: function getInitialState() {

	      return {
	        userHasTyped: false
	      };
	    },

	    componentDidMount: function componentDidMount() {

	      this.update(this.props.value);
	    },

	    onChange: function onChange(value) {

	      var i, newValue;

	      this.setState({ userHasTyped: true });

	      if (this.props.type == 'multichoice') {

	        i = this.props.value.indexOf(value);

	        newValue = (this.props.value || []).concat();

	        if (i == -1) {

	          newValue.push(value);
	        } else {

	          newValue.splice(i, 1);
	        }

	        this.update(newValue);
	      } else {

	        this.update(value);
	      }
	    },

	    update: function update(value) {

	      this.props.onChange(value, this.validate(value));
	    },

	    render: function render() {

	      return React.createElement(
	        'div',
	        { className: 'cform' },
	        React.createElement(
	          'label',
	          null,
	          this.props.field.label[this.props.lang],
	          this.props.field.optional ? '' : ' (*)'
	        ),
	        renderHelpers.errorOrInfo.apply(this),
	        React.createElement(
	          'ul',
	          null,
	          React.createElement(
	            'li',
	            null,
	            this.renderField()
	          )
	        )
	      );
	    },

	    validate: function validate(value) {

	      if (this.props.type == 'multichoice') {

	        if (value === undefined) value = [];
	      } else {

	        if (value === undefined) value = '';

	        if (!this.props.optional && !(value + '').length) {

	          return this.message(ERR.NOTEMPTY);
	        }
	      }

	      return false;
	    },

	    message: function message(code) {

	      var messages = {};

	      messages[ERR.NOTEMPTY] = {
	        en: 'this field cannot be empty',
	        fr: 'ce champ ne peut pas rester vide'
	      };

	      return messages[code][this.props.lang];
	    }

	  }));
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(12),
	    RadioTypeField = __webpack_require__(30),
	    Select = __webpack_require__(32);

	module.exports = RadioTypeField({

	  getOptions: function getOptions() {

	    var self = this;

	    return this.props.field.options.map(function (o) {

	      return {
	        value: o.value,
	        label: o.label[self.props.lang]
	      };
	    });
	  },

	  renderField: function renderField() {

	    return React.createElement(Select, {
	      value: this.props.value,
	      options: this.getOptions(),
	      onChange: this.onChange,
	      clearable: false });
	  }

	});

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* disable some rules until we refactor more completely; fixing them now would
	   cause conflicts with some open PRs unnecessarily. */
	/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var ReactDOM = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-dom\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Input = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-input-autosize\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var classes = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"classnames\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Value = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Value\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var SingleValue = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./SingleValue\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Option = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Option\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var requestId = 0;

	var Select = React.createClass({

		displayName: 'Select',

		propTypes: {
			addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
			allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
			asyncOptions: React.PropTypes.func, // function to call to get options
			autoload: React.PropTypes.bool, // whether to auto-load the default async options set
			backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
			cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
			className: React.PropTypes.string, // className for the outer element
			clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
			clearValueText: React.PropTypes.string, // title for the "clear" control
			clearable: React.PropTypes.bool, // should it be possible to reset value
			delimiter: React.PropTypes.string, // delimiter to use to join multiple values
			disabled: React.PropTypes.bool, // whether the Select is disabled or not
			filterOption: React.PropTypes.func, // method to filter a single option  (option, filterString)
			filterOptions: React.PropTypes.func, // method to filter the options array: function ([options], filterString, [values])
			ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
			inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
			isLoading: React.PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
			labelKey: React.PropTypes.string, // path of the label value in option objects
			matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
			matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
			multi: React.PropTypes.bool, // multi-value input
			name: React.PropTypes.string, // field name, for hidden <input /> tag
			newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
			noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
			onBlur: React.PropTypes.func, // onBlur handler: function (event) {}
			onChange: React.PropTypes.func, // onChange handler: function (newValue) {}
			onFocus: React.PropTypes.func, // onFocus handler: function (event) {}
			onInputChange: React.PropTypes.func, // onInputChange handler: function (inputValue) {}
			onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
			optionComponent: React.PropTypes.func, // option component to render in dropdown
			optionRenderer: React.PropTypes.func, // optionRenderer: function (option) {}
			options: React.PropTypes.array, // array of options
			placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
			searchable: React.PropTypes.bool, // whether to enable searching feature or not
			searchingText: React.PropTypes.string, // message to display whilst options are loading via asyncOptions
			searchPromptText: React.PropTypes.string, // label to prompt for search input
			singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
			value: React.PropTypes.any, // initial field value
			valueComponent: React.PropTypes.func, // value component to render in multiple mode
			valueKey: React.PropTypes.string, // path of the label value in option objects
			valueRenderer: React.PropTypes.func // valueRenderer: function (option) {}
		},

		getDefaultProps: function getDefaultProps() {
			return {
				addLabelText: 'Add "{label}"?',
				allowCreate: false,
				asyncOptions: undefined,
				autoload: true,
				backspaceRemoves: true,
				cacheAsyncResults: true,
				className: undefined,
				clearAllText: 'Clear all',
				clearValueText: 'Clear value',
				clearable: true,
				delimiter: ',',
				disabled: false,
				ignoreCase: true,
				inputProps: {},
				isLoading: false,
				labelKey: 'label',
				matchPos: 'any',
				matchProp: 'any',
				name: undefined,
				newOptionCreator: undefined,
				noResultsText: 'No results found',
				onChange: undefined,
				onInputChange: undefined,
				onOptionLabelClick: undefined,
				optionComponent: Option,
				options: undefined,
				placeholder: 'Select...',
				searchable: true,
				searchingText: 'Searching...',
				searchPromptText: 'Type to search',
				singleValueComponent: SingleValue,
				value: undefined,
				valueComponent: Value,
				valueKey: 'value'
			};
		},

		getInitialState: function getInitialState() {
			return {
				/*
	    * set by getStateFromValue on componentWillMount:
	    * - value
	    * - values
	    * - filteredOptions
	    * - inputValue
	    * - placeholder
	    * - focusedOption
	   */
				isFocused: false,
				isLoading: false,
				isOpen: false,
				options: this.props.options
			};
		},

		componentWillMount: function componentWillMount() {
			var _this = this;

			this._optionsCache = {};
			this._optionsFilterString = '';
			this._closeMenuIfClickedOutside = function (event) {
				if (!_this.state.isOpen) {
					return;
				}
				var menuElem = ReactDOM.findDOMNode(_this.refs.selectMenuContainer);
				var controlElem = ReactDOM.findDOMNode(_this.refs.control);

				var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
				var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

				// Hide dropdown menu if click occurred outside of menu
				if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
					_this.setState({
						isOpen: false
					}, _this._unbindCloseMenuIfClickedOutside);
				}
			};
			this._bindCloseMenuIfClickedOutside = function () {
				if (!document.addEventListener && document.attachEvent) {
					document.attachEvent('onclick', _this._closeMenuIfClickedOutside);
				} else {
					document.addEventListener('click', _this._closeMenuIfClickedOutside);
				}
			};
			this._unbindCloseMenuIfClickedOutside = function () {
				if (!document.removeEventListener && document.detachEvent) {
					document.detachEvent('onclick', _this._closeMenuIfClickedOutside);
				} else {
					document.removeEventListener('click', _this._closeMenuIfClickedOutside);
				}
			};
			this.setState(this.getStateFromValue(this.props.value));
		},

		componentDidMount: function componentDidMount() {
			if (this.props.asyncOptions && this.props.autoload) {
				this.autoloadAsyncOptions();
			}
		},

		componentWillUnmount: function componentWillUnmount() {
			clearTimeout(this._blurTimeout);
			clearTimeout(this._focusTimeout);
			if (this.state.isOpen) {
				this._unbindCloseMenuIfClickedOutside();
			}
		},

		componentWillReceiveProps: function componentWillReceiveProps(newProps) {
			var _this2 = this;

			var optionsChanged = false;
			if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
				optionsChanged = true;
				this.setState({
					options: newProps.options,
					filteredOptions: this.filterOptions(newProps.options)
				});
			}
			if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
				var setState = function setState(newState) {
					_this2.setState(_this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder));
				};
				if (this.props.asyncOptions) {
					this.loadAsyncOptions(newProps.value, {}, setState);
				} else {
					setState();
				}
			}
		},

		componentDidUpdate: function componentDidUpdate() {
			var _this3 = this;

			if (!this.props.disabled && this._focusAfterUpdate) {
				clearTimeout(this._blurTimeout);
				clearTimeout(this._focusTimeout);
				this._focusTimeout = setTimeout(function () {
					if (!_this3.isMounted()) return;
					_this3.getInputNode().focus();
					_this3._focusAfterUpdate = false;
				}, 50);
			}
			if (this._focusedOptionReveal) {
				if (this.refs.focused && this.refs.menu) {
					var focusedDOM = ReactDOM.findDOMNode(this.refs.focused);
					var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
					var focusedRect = focusedDOM.getBoundingClientRect();
					var menuRect = menuDOM.getBoundingClientRect();

					if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
						menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
					}
				}
				this._focusedOptionReveal = false;
			}
		},

		focus: function focus() {
			this.getInputNode().focus();
		},

		clickedOutsideElement: function clickedOutsideElement(element, event) {
			var eventTarget = event.target ? event.target : event.srcElement;
			while (eventTarget != null) {
				if (eventTarget === element) return false;
				eventTarget = eventTarget.offsetParent;
			}
			return true;
		},

		getStateFromValue: function getStateFromValue(value, options, placeholder) {
			var _this4 = this;

			if (!options) {
				options = this.state.options;
			}
			if (!placeholder) {
				placeholder = this.props.placeholder;
			}

			// reset internal filter string
			this._optionsFilterString = '';

			var values = this.initValuesArray(value, options);
			var filteredOptions = this.filterOptions(options, values);

			var focusedOption;
			var valueForState = null;
			if (!this.props.multi && values.length) {
				focusedOption = values[0];
				valueForState = values[0][this.props.valueKey];
			} else {
				focusedOption = this.getFirstFocusableOption(filteredOptions);
				valueForState = values.map(function (v) {
					return v[_this4.props.valueKey];
				}).join(this.props.delimiter);
			}

			return {
				value: valueForState,
				values: values,
				inputValue: '',
				filteredOptions: filteredOptions,
				placeholder: !this.props.multi && values.length ? values[0][this.props.labelKey] : placeholder,
				focusedOption: focusedOption
			};
		},

		getFirstFocusableOption: function getFirstFocusableOption(options) {
			for (var optionIndex = 0; optionIndex < options.length; ++optionIndex) {
				if (!options[optionIndex].disabled) {
					return options[optionIndex];
				}
			}
		},

		initValuesArray: function initValuesArray(values, options) {
			var _this5 = this;

			if (!Array.isArray(values)) {
				if (typeof values === 'string') {
					values = values === '' ? [] : this.props.multi ? values.split(this.props.delimiter) : [values];
				} else {
					values = values !== undefined && values !== null ? [values] : [];
				}
			}
			return values.map(function (val) {
				if (typeof val === 'string' || typeof val === 'number') {
					var _ref;

					for (var key in options) {
						if (options.hasOwnProperty(key) && options[key] && (options[key][_this5.props.valueKey] === val || typeof options[key][_this5.props.valueKey] === 'number' && options[key][_this5.props.valueKey].toString() === val)) {
							return options[key];
						}
					}
					return _ref = {}, _defineProperty(_ref, _this5.props.valueKey, val), _defineProperty(_ref, _this5.props.labelKey, val), _ref;
				} else {
					return val;
				}
			});
		},

		setValue: function setValue(value, focusAfterUpdate) {
			if (focusAfterUpdate || focusAfterUpdate === undefined) {
				this._focusAfterUpdate = true;
			}
			var newState = this.getStateFromValue(value);
			newState.isOpen = false;
			this.fireChangeEvent(newState);
			this.setState(newState);
		},

		selectValue: function selectValue(value) {
			if (!this.props.multi) {
				this.setValue(value);
			} else if (value) {
				this.addValue(value);
			}
			this._unbindCloseMenuIfClickedOutside();
		},

		addValue: function addValue(value) {
			this.setValue(this.state.values.concat(value));
		},

		popValue: function popValue() {
			this.setValue(this.state.values.slice(0, this.state.values.length - 1));
		},

		removeValue: function removeValue(valueToRemove) {
			this.setValue(this.state.values.filter(function (value) {
				return value !== valueToRemove;
			}));
		},

		clearValue: function clearValue(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, ignore it.
			if (event && event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
			this.setValue(null);
		},

		resetValue: function resetValue() {
			this.setValue(this.state.value === '' ? null : this.state.value);
		},

		getInputNode: function getInputNode() {
			var input = this.refs.input;
			return this.props.searchable ? input : ReactDOM.findDOMNode(input);
		},

		fireChangeEvent: function fireChangeEvent(newState) {
			if (newState.value !== this.state.value && this.props.onChange) {
				this.props.onChange(newState.value, newState.values);
			}
		},

		handleMouseDown: function handleMouseDown(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();

			// for the non-searchable select, close the dropdown when button is clicked
			if (this.state.isOpen && !this.props.searchable) {
				this.setState({
					isOpen: false
				}, this._unbindCloseMenuIfClickedOutside);
				return;
			}

			if (this.state.isFocused) {
				this.setState({
					isOpen: true
				}, this._bindCloseMenuIfClickedOutside);
			} else {
				this._openAfterFocus = true;
				this.getInputNode().focus();
			}
		},

		handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
		},

		handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			// If not focused, handleMouseDown will handle it
			if (!this.state.isOpen) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
			this.setState({
				isOpen: false
			}, this._unbindCloseMenuIfClickedOutside);
		},

		handleInputFocus: function handleInputFocus(event) {
			var _this6 = this;

			var newIsOpen = this.state.isOpen || this._openAfterFocus;
			this.setState({
				isFocused: true,
				isOpen: newIsOpen
			}, function () {
				if (newIsOpen) {
					_this6._bindCloseMenuIfClickedOutside();
				} else {
					_this6._unbindCloseMenuIfClickedOutside();
				}
			});
			this._openAfterFocus = false;
			if (this.props.onFocus) {
				this.props.onFocus(event);
			}
		},

		handleInputBlur: function handleInputBlur(event) {
			var _this7 = this;

			var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
			if (document.activeElement.isEqualNode(menuDOM)) {
				return;
			}
			this._blurTimeout = setTimeout(function () {
				if (_this7._focusAfterUpdate || !_this7.isMounted()) return;
				_this7.setState({
					inputValue: '',
					isFocused: false,
					isOpen: false
				});
			}, 50);
			if (this.props.onBlur) {
				this.props.onBlur(event);
			}
		},

		handleKeyDown: function handleKeyDown(event) {
			if (this.props.disabled) return;
			switch (event.keyCode) {
				case 8:
					// backspace
					if (!this.state.inputValue && this.props.backspaceRemoves) {
						event.preventDefault();
						this.popValue();
					}
					return;
				case 9:
					// tab
					if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
						return;
					}
					this.selectFocusedOption();
					break;
				case 13:
					// enter
					if (!this.state.isOpen) return;
					this.selectFocusedOption();
					break;
				case 27:
					// escape
					if (this.state.isOpen) {
						this.resetValue();
					} else if (this.props.clearable) {
						this.clearValue(event);
					}
					break;
				case 38:
					// up
					this.focusPreviousOption();
					break;
				case 40:
					// down
					this.focusNextOption();
					break;
				case 188:
					// ,
					if (this.props.allowCreate && this.props.multi) {
						event.preventDefault();
						event.stopPropagation();
						this.selectFocusedOption();
					} else {
						return;
					}
					break;
				default:
					return;
			}
			event.preventDefault();
		},

		// Ensures that the currently focused option is available in filteredOptions.
		// If not, returns the first available option.
		_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
			for (var key in filteredOptions) {
				if (filteredOptions.hasOwnProperty(key) && filteredOptions[key] === this.state.focusedOption) {
					return filteredOptions[key];
				}
			}
			return this.getFirstFocusableOption(filteredOptions);
		},

		handleInputChange: function handleInputChange(event) {
			// assign an internal variable because we need to use
			// the latest value before setState() has completed.
			this._optionsFilterString = event.target.value;
			if (this.props.onInputChange) {
				this.props.onInputChange(event.target.value);
			}
			if (this.props.asyncOptions) {
				this.setState({
					isLoading: true,
					inputValue: event.target.value
				});
				this.loadAsyncOptions(event.target.value, {
					isLoading: false,
					isOpen: true
				}, this._bindCloseMenuIfClickedOutside);
			} else {
				var filteredOptions = this.filterOptions(this.state.options);
				this.setState({
					isOpen: true,
					inputValue: event.target.value,
					filteredOptions: filteredOptions,
					focusedOption: this._getNewFocusedOption(filteredOptions)
				}, this._bindCloseMenuIfClickedOutside);
			}
		},

		autoloadAsyncOptions: function autoloadAsyncOptions() {
			var _this8 = this;

			this.setState({
				isLoading: true
			});
			this.loadAsyncOptions('', { isLoading: false }, function () {
				// update with new options but don't focus
				_this8.setValue(_this8.props.value, false);
			});
		},

		loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
			if (input === undefined) input = '';

			var _this9 = this;

			var thisRequestId = this._currentRequestId = requestId++;
			if (this.props.cacheAsyncResults) {
				for (var i = 0; i <= input.length; i++) {
					var cacheKey = input.slice(0, i);
					if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
						var options = this._optionsCache[cacheKey].options;
						var filteredOptions = this.filterOptions(options);
						var newState = {
							options: options,
							filteredOptions: filteredOptions,
							focusedOption: this._getNewFocusedOption(filteredOptions)
						};
						for (var key in state) {
							if (state.hasOwnProperty(key)) {
								newState[key] = state[key];
							}
						}
						this.setState(newState);
						if (callback) callback.call(this, newState);
						return;
					}
				}
			}

			var optionsResponseHandler = function optionsResponseHandler(err, data) {
				if (err) throw err;
				if (_this9.props.cacheAsyncResults) {
					_this9._optionsCache[input] = data;
				}
				if (thisRequestId !== _this9._currentRequestId) {
					return;
				}
				var filteredOptions = _this9.filterOptions(data.options);
				var newState = {
					options: data.options,
					filteredOptions: filteredOptions,
					focusedOption: _this9._getNewFocusedOption(filteredOptions)
				};
				for (var key in state) {
					if (state.hasOwnProperty(key)) {
						newState[key] = state[key];
					}
				}
				_this9.setState(newState);
				if (callback) callback.call(_this9, newState);
			};

			var asyncOpts = this.props.asyncOptions(input, optionsResponseHandler);

			if (asyncOpts && typeof asyncOpts.then === 'function') {
				asyncOpts.then(function (data) {
					optionsResponseHandler(null, data);
				}, function (err) {
					optionsResponseHandler(err);
				});
			}
		},

		filterOptions: function filterOptions(options, values) {
			var _this10 = this;

			var filterValue = this._optionsFilterString;
			var exclude = (values || this.state.values).map(function (i) {
				return i[_this10.props.valueKey];
			});
			if (this.props.filterOptions) {
				return this.props.filterOptions.call(this, options, filterValue, exclude);
			} else {
				var filterOption = function filterOption(op) {
					if (this.props.multi && exclude.indexOf(op[this.props.valueKey]) > -1) return false;
					if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
					var valueTest = String(op[this.props.valueKey]);
					var labelTest = String(op[this.props.labelKey]);
					if (this.props.ignoreCase) {
						valueTest = valueTest.toLowerCase();
						labelTest = labelTest.toLowerCase();
						filterValue = filterValue.toLowerCase();
					}
					return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
				};
				return (options || []).filter(filterOption, this);
			}
		},

		selectFocusedOption: function selectFocusedOption() {
			if (this.props.allowCreate && !this.state.focusedOption) {
				return this.selectValue(this.state.inputValue);
			}

			if (this.state.focusedOption) {
				return this.selectValue(this.state.focusedOption);
			}
		},

		focusOption: function focusOption(op) {
			this.setState({
				focusedOption: op
			});
		},

		focusNextOption: function focusNextOption() {
			this.focusAdjacentOption('next');
		},

		focusPreviousOption: function focusPreviousOption() {
			this.focusAdjacentOption('previous');
		},

		focusAdjacentOption: function focusAdjacentOption(dir) {
			this._focusedOptionReveal = true;
			var ops = this.state.filteredOptions.filter(function (op) {
				return !op.disabled;
			});
			if (!this.state.isOpen) {
				this.setState({
					isOpen: true,
					inputValue: '',
					focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
				}, this._bindCloseMenuIfClickedOutside);
				return;
			}
			if (!ops.length) {
				return;
			}
			var focusedIndex = -1;
			for (var i = 0; i < ops.length; i++) {
				if (this.state.focusedOption === ops[i]) {
					focusedIndex = i;
					break;
				}
			}
			var focusedOption = ops[0];
			if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
				focusedOption = ops[focusedIndex + 1];
			} else if (dir === 'previous') {
				if (focusedIndex > 0) {
					focusedOption = ops[focusedIndex - 1];
				} else {
					focusedOption = ops[ops.length - 1];
				}
			}
			this.setState({
				focusedOption: focusedOption
			});
		},

		unfocusOption: function unfocusOption(op) {
			if (this.state.focusedOption === op) {
				this.setState({
					focusedOption: null
				});
			}
		},

		renderOptionLabel: function renderOptionLabel(op) {
			return op[this.props.labelKey];
		},

		buildMenu: function buildMenu() {
			var focusedValue = this.state.focusedOption ? this.state.focusedOption[this.props.valueKey] : null;
			var renderLabel = this.props.optionRenderer || this.renderOptionLabel;
			if (this.state.filteredOptions.length > 0) {
				focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
			}
			// Add the current value to the filtered options in last resort
			var options = this.state.filteredOptions;
			if (this.props.allowCreate && this.state.inputValue.trim()) {
				var inputValue = this.state.inputValue;
				options = options.slice();
				var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
					value: inputValue,
					label: inputValue,
					create: true
				};
				options.unshift(newOption);
			}
			var ops = Object.keys(options).map(function (key) {
				var op = options[key];
				var isSelected = this.state.value === op[this.props.valueKey];
				var isFocused = focusedValue === op[this.props.valueKey];
				var optionClass = classes({
					'Select-option': true,
					'is-selected': isSelected,
					'is-focused': isFocused,
					'is-disabled': op.disabled
				});
				var ref = isFocused ? 'focused' : null;
				var optionResult = React.createElement(this.props.optionComponent, {
					key: 'option-' + op[this.props.valueKey],
					className: optionClass,
					renderFunc: renderLabel,
					mouseDown: this.selectValue,
					mouseEnter: this.focusOption,
					mouseLeave: this.unfocusOption,
					addLabelText: this.props.addLabelText,
					option: op,
					ref: ref
				});
				return optionResult;
			}, this);

			if (ops.length) {
				return ops;
			} else {
				var noResultsText, promptClass;
				if (this.isLoading()) {
					promptClass = 'Select-searching';
					noResultsText = this.props.searchingText;
				} else if (this.state.inputValue || !this.props.asyncOptions) {
					promptClass = 'Select-noresults';
					noResultsText = this.props.noResultsText;
				} else {
					promptClass = 'Select-search-prompt';
					noResultsText = this.props.searchPromptText;
				}

				return React.createElement(
					'div',
					{ className: promptClass },
					noResultsText
				);
			}
		},

		handleOptionLabelClick: function handleOptionLabelClick(value, event) {
			if (this.props.onOptionLabelClick) {
				this.props.onOptionLabelClick(value, event);
			}
		},

		isLoading: function isLoading() {
			return this.props.isLoading || this.state.isLoading;
		},

		render: function render() {
			var selectClass = classes('Select', this.props.className, {
				'Select--multi': this.props.multi,
				'is-searchable': this.props.searchable,
				'is-open': this.state.isOpen,
				'is-focused': this.state.isFocused,
				'is-loading': this.isLoading(),
				'is-disabled': this.props.disabled,
				'has-value': this.state.value
			});
			var value = [];
			if (this.props.multi) {
				this.state.values.forEach(function (val) {
					var renderLabel = this.props.valueRenderer || this.renderOptionLabel;
					var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
					var onRemove = this.removeValue.bind(this, val);
					var valueComponent = React.createElement(this.props.valueComponent, {
						key: val[this.props.valueKey],
						option: val,
						renderer: renderLabel,
						optionLabelClick: !!this.props.onOptionLabelClick,
						onOptionLabelClick: onOptionLabelClick,
						onRemove: onRemove,
						disabled: this.props.disabled
					});
					value.push(valueComponent);
				}, this);
			}

			if (!this.state.inputValue && (!this.props.multi || !value.length)) {
				var val = this.state.values[0] || null;
				if (this.props.valueRenderer && !!this.state.values.length) {
					value.push(React.createElement(Value, {
						key: 0,
						option: val,
						renderer: this.props.valueRenderer,
						disabled: this.props.disabled }));
				} else {
					var singleValueComponent = React.createElement(this.props.singleValueComponent, {
						key: 'placeholder',
						value: val,
						placeholder: this.state.placeholder
					});
					value.push(singleValueComponent);
				}
			}

			// loading spinner
			var loading = this.isLoading() ? React.createElement(
				'span',
				{ className: 'Select-loading-zone', 'aria-hidden': 'true' },
				React.createElement('span', { className: 'Select-loading' })
			) : null;

			// clear "x" button
			var clear = this.props.clearable && this.state.value && !this.props.disabled && !this.isLoading() ? React.createElement(
				'span',
				{ className: 'Select-clear-zone', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onTouchEnd: this.clearValue, onClick: this.clearValue },
				React.createElement('span', { className: 'Select-clear', dangerouslySetInnerHTML: { __html: '&times;' } })
			) : null;

			// indicator arrow
			var arrow = React.createElement(
				'span',
				{ className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow },
				React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow })
			);

			var menu;
			var menuProps;
			if (this.state.isOpen) {
				menuProps = {
					ref: 'menu',
					className: 'Select-menu',
					onMouseDown: this.handleMouseDownOnMenu
				};
				menu = React.createElement(
					'div',
					{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
					React.createElement(
						'div',
						menuProps,
						this.buildMenu()
					)
				);
			}

			var input;
			var inputProps = {
				ref: 'input',
				className: 'Select-input ' + (this.props.inputProps.className || ''),
				tabIndex: this.props.tabIndex || 0,
				onFocus: this.handleInputFocus,
				onBlur: this.handleInputBlur
			};
			for (var key in this.props.inputProps) {
				if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
					inputProps[key] = this.props.inputProps[key];
				}
			}

			if (!this.props.disabled) {
				if (this.props.searchable) {
					input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
				} else {
					input = React.createElement(
						'div',
						inputProps,
						' '
					);
				}
			} else if (!this.props.multi || !this.state.values.length) {
				input = React.createElement(
					'div',
					{ className: 'Select-input' },
					' '
				);
			}

			return React.createElement(
				'div',
				{ ref: 'wrapper', className: selectClass },
				React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
				React.createElement(
					'div',
					{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
					value,
					input,
					loading,
					clear,
					arrow
				),
				menu
			);
		}
	});

	module.exports = Select;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    ReactDom = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-dom\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    ERRCODES = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../lib/errCodes.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    xhr = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"xhr\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    Spinner = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"spin.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    lang: React.PropTypes.string,

	    // current path of the shown image
	    value: React.PropTypes.string,

	    // callback to pass image path to
	    // on new upload success
	    handleUpdate: React.PropTypes.func,

	    // ressource to remove image
	    remove: React.PropTypes.string,

	    // ressource to upload image
	    upload: React.PropTypes.string,

	    // label to display above image
	    label: React.PropTypes.object

	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      lang: 'fr',
	      removeClass: '',
	      label: { fr: 'Image', en: 'Image' },
	      spinner: {
	        width: 1,
	        length: 3,
	        radius: 4,
	        color: '#666'
	      }
	    };
	  },

	  getInitialState: function getInitialState() {

	    var callbackName = 'uploadCallback' + parseInt(Math.random() * 100000, 10);

	    window[callbackName] = this.onUploadResponse;

	    this.spinner = new Spinner(this.props.spinner);

	    return {
	      callbackName: callbackName,
	      frameName: 'frame' + parseInt(Math.random() * 100000, 10),
	      preview: this.props.value || false,
	      loading: false,
	      trashing: false,
	      error: false
	    };
	  },

	  componentDidUpdate: function componentDidUpdate() {

	    if (this.state.loading || this.state.trashing) {

	      this.spinner.spin(ReactDom.findDOMNode(this.refs.spinWrapper));
	    } else {

	      this.spinner.stop();
	    }
	  },

	  onUploadResponse: function onUploadResponse(err, preview) {

	    this.setState({
	      error: err,
	      preview: preview,
	      loading: false
	    });

	    if (!this.props.handleUpdate) return;

	    this.props.handleUpdate(preview, err);
	  },

	  onRemove: function onRemove() {

	    var self = this;

	    this.setState({ trashing: true });

	    xhr({
	      uri: this.props.remove,
	      method: 'post'
	    }, function (err, res, body) {

	      if (res.statusCode == 200) {

	        self.setState({
	          preview: false,
	          trashing: false
	        });

	        if (!self.props.handleUpdate) return;

	        // if image is removed, parent component must be notified
	        self.props.handleUpdate(false, err);
	      } else {

	        self.setState({
	          error: { code: ERRCODES.NOREMOVE },
	          trashing: false
	        });
	      }
	    });
	  },

	  onChange: function onChange(e) {

	    if (e.target.value && e.target.value.length) {

	      this.setState({ loading: true });

	      this.refs['form'].submit();
	    }
	  },

	  renderError: function renderError(code) {

	    var message = ERRCODES.message(code, this.props.lang || 'fr');

	    return React.createElement(
	      'span',
	      { className: 'error' },
	      message
	    );
	  },

	  renderRemove: function renderRemove() {

	    return React.createElement(
	      'a',
	      {
	        onClick: this.onRemove,
	        className: 'btn btn-default' },
	      !this.state.loading ? React.createElement('i', { className: 'fa fa-trash' }) : React.createElement('div', { className: 'spin-wrapper', ref: 'spinWrapper' })
	    );
	  },

	  renderButton: function renderButton() {

	    var buttonContent;

	    if (this.state.loading) {

	      buttonContent = React.createElement('div', { className: 'spin-wrapper', ref: 'spinWrapper' });
	    } else {

	      buttonContent = React.createElement('i', { className: 'fa fa-upload' });
	    }

	    return React.createElement(
	      'button',
	      {
	        tabIndex: '-1',
	        className: 'btn btn-default' },
	      buttonContent
	    );
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      { className: 'image-upload' },
	      this.props.label ? React.createElement(
	        'label',
	        null,
	        this.props.label[this.props.lang || 'fr']
	      ) : '',
	      React.createElement(
	        'form',
	        { ref: 'form', className: this.state.preview ? '' : 'empty', method: 'post', encType: 'multipart/form-data', target: this.state.frameName, action: this.props.upload },
	        React.createElement(
	          'div',
	          { className: 'form-inline actions' },
	          this.state.preview ? this.renderRemove() : '',
	          React.createElement(
	            'div',
	            { className: 'form-group upload-group' },
	            React.createElement('input', {
	              ref: 'file-input',
	              name: 'image',
	              type: 'file',
	              accept: '.png, .gif, .jpg, .jpeg, .bmp',
	              onChange: this.onChange }),
	            this.renderButton()
	          )
	        ),
	        this.state.error ? this.renderError(this.state.error.code) : '',
	        React.createElement('input', { type: 'hidden', name: 'callback', value: this.state.callbackName }),
	        this.state.preview ? React.createElement('img', { src: this.state.preview + '?rand=' + Math.random() }) : ''
	      ),
	      this.props.info ? React.createElement(
	        'span',
	        { className: 'info' },
	        this.props.info
	      ) : null,
	      React.createElement('iframe', { name: this.state.frameName, style: { display: 'none' } })
	    );
	  }

	});

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {},
	  _component2: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/AccessibilityFields.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    rUtils = __webpack_require__(3),
	    defaults = {
	  canvas: '.js_form_canvas',
	  events: {
	    send: 'eaccessibilitysend'
	  }
	},
	    labels = __webpack_require__(35);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  types: [{
	    code: 'mi',
	    label: labels.motorImpairment
	  }, {
	    code: 'hi',
	    label: labels.hearingImpairment
	  }, {
	    code: 'pi',
	    label: labels.mentalImpairment
	  }, {
	    code: 'vi',
	    label: labels.visualImpairment
	  }, {
	    code: 'sl',
	    label: labels.signLanguage
	  }],

	  getInitialState: function getInitialState() {

	    return {
	      enabled: !!this.props.value.length
	    };
	  },

	  onEnabled: function onEnabled(e) {

	    var enabled = !this.state.enabled;

	    if (!enabled) this.props.onChange([]);

	    this.setState({
	      enabled: enabled
	    });
	  },

	  onClick: function onClick(type) {

	    var self = this;

	    return function () {

	      self.toggleState(type.code);
	    };
	  },

	  toggleState: function toggleState(code) {

	    var current = this.props.value.slice(),
	        codeIndex = current.indexOf(code);

	    if (codeIndex == -1) {

	      current.push(code);
	    } else {

	      current.splice(codeIndex, 1);
	    }

	    this.props.onChange(current);
	  },

	  render: function render() {

	    var self = this;

	    return React.createElement(
	      'div',
	      { className: 'cform' },
	      React.createElement(
	        'ul',
	        null,
	        React.createElement(
	          'li',
	          { className: 'line', onClick: self.onEnabled },
	          React.createElement('input', { type: 'checkbox', name: 'accessibility', checked: self.state.enabled }),
	          React.createElement(
	            'label',
	            null,
	            this.props.label[this.props.labelsLang]
	          )
	        )
	      ),
	      React.createElement(
	        'ul',
	        { className: 'acc' },
	        this.types.map(function (type, idx) {
	          return React.createElement(AccessibilityItem, {
	            key: idx,
	            label: type.label[self.props.labelsLang],
	            checked: self.props.value.indexOf(type.code) !== -1,
	            code: type.code,
	            onClick: self.onClick(type),
	            enabled: self.state.enabled
	          });
	        })
	      )
	    );
	  }

	}));

	var AccessibilityItem = _wrapComponent('_component2')(React.createClass({
	  displayName: 'AccessibilityItem',


	  onClick: function onClick() {

	    this.props.onClick(this.props.code);
	  },

	  render: function render() {

	    return React.createElement(
	      'li',
	      { className: this.props.enabled ? 'line' : 'display-none', onClick: this.onClick },
	      React.createElement(
	        'div',
	        { className: 'box' + (this.props.checked ? ' checked' : '') },
	        React.createElement('div', { className: 'ill ' + this.props.code })
	      ),
	      React.createElement(
	        'label',
	        null,
	        this.props.label
	      )
	    );
	  }

	}));

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  motorImpairment: {
	    en: 'motor impairment',
	    fr: 'handicap moteur'
	  },
	  hearingImpairment: {
	    en: 'hearing impairment',
	    fr: 'handicap auditif'
	  },
	  mentalImpairment: {
	    en: 'mental impairment',
	    fr: 'handicap psychique'
	  },
	  visualImpairment: {
	    en: 'visual impairment',
	    fr: 'handicap visuel'
	  },
	  signLanguage: {
	    en: 'sign language',
	    fr: 'langue des signes'
	  }
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/AgeFields.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var Select = __webpack_require__(32),
	    React = __webpack_require__(12),
	    labels = __webpack_require__(37),
	    limits = {
	  min: 0,
	  max: 120
	};

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getInitialState: function getInitialState() {

	    var enabled = false;

	    if (this.props.value && this.props.value.min !== undefined && this.props.value.min !== null) {

	      enabled = true;
	    }

	    return {
	      enabled: enabled
	    };
	  },

	  onChange: function onChange(attr) {

	    var self = this;

	    return function (e) {

	      var v,
	          current = JSON.parse((0, _stringify2.default)(self.props.value));

	      if (e.target) {

	        v = e.target.value;
	      } else {

	        v = e;
	      }

	      v = parseInt(v, 10);

	      if (!isNaN(v)) {

	        current[attr] = v;
	      }

	      if (current.min && current.min > self.props.value.max) {

	        current.max = current.min;
	      }

	      self.props.onChange(current);
	    };
	  },

	  onEnabled: function onEnabled(enable) {

	    var self = this;

	    return function () {

	      if (typeof enable == 'undefined') {

	        enable = !self.state.enabled;
	      }

	      var min = self.props.value ? self.props.value.min || null : null,
	          max = self.props.value ? self.props.value.max || null : null;

	      if (enable && min === null) {

	        min = 0;
	      }

	      if (enable && max === null) {

	        max = 99;
	      }

	      self.props.onChange({
	        min: min,
	        max: max
	      });

	      self.setState({
	        enabled: enable
	      });
	    };
	  },

	  /**
	   * get or build select menu options based on propped language
	   */

	  getSelectOptions: function getSelectOptions(minValue) {

	    this.selectOptions = [];

	    if (typeof minValue == 'undefined') {

	      minValue = limits.min;
	    }

	    for (var i = 0; i < limits.max; i++) {

	      if (minValue <= i) {

	        this.selectOptions.push({
	          value: i + '',
	          label: i + ' ' + (i < 2 ? labels.year : labels.years)[this.props.labelsLang]
	        });
	      }
	    }

	    return this.selectOptions;
	  },

	  render: function render() {

	    var min = null,
	        max = null;

	    if (this.state.enabled) {

	      min = this.props.value.min;

	      min = min !== undefined && min !== null ? min + '' : '';

	      max = this.props.value.max;

	      max = max !== undefined && max !== null ? max + '' : '';
	    }

	    return React.createElement(
	      'div',
	      { className: 'cform target-age' },
	      React.createElement(
	        'ul',
	        null,
	        React.createElement(
	          'li',
	          { className: 'line' },
	          React.createElement('input', { type: 'checkbox', name: 'age', checked: this.state.enabled, onClick: this.onEnabled(!this.state.enabled) }),
	          React.createElement(
	            'label',
	            { onClick: this.onEnabled() },
	            this.props.label[this.props.labelsLang]
	          ),
	          ' -',
	          React.createElement(
	            'label',
	            { onClick: this.onEnabled(), 'for': 'minage' },
	            labels.min[this.props.labelsLang]
	          ),
	          React.createElement(Select, {
	            name: 'minage',
	            value: min,
	            options: this.getSelectOptions(),
	            clearable: false,
	            onChange: this.onChange('min'),
	            onFocus: this.onEnabled(true),
	            onBlur: this.onChange('min'),
	            placeholder: labels.select[this.props.labelsLang]
	          }),
	          React.createElement(
	            'label',
	            { 'for': 'maxage' },
	            labels.max[this.props.labelsLang]
	          ),
	          React.createElement(Select, {
	            name: 'maxage',
	            value: max,
	            options: this.getSelectOptions(this.props.value ? min : false),
	            clearable: false,
	            onChange: this.onChange('max'),
	            onBlur: this.onChange('max'),
	            onFocus: this.onEnabled(true),
	            placeholder: labels.select[this.props.labelsLang]
	          })
	        )
	      )
	    );
	  }

	}));

/***/ },
/* 37 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  year: {
	    fr: 'an',
	    en: 'year'
	  },
	  years: {
	    fr: 'ans',
	    en: 'years'
	  },
	  min: {
	    fr: 'De',
	    en: 'From'
	  },
	  max: {
	    fr: 'à',
	    en: 'to'
	  },
	  select: {
	    fr: 'Sélectionner',
	    en: 'Select'
	  }
	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _redboxReact2 = __webpack_require__(11);

	var _redboxReact3 = _interopRequireDefault(_redboxReact2);

	var _react2 = __webpack_require__(12);

	var _react3 = _interopRequireDefault(_react2);

	var _reactTransformCatchErrors3 = __webpack_require__(13);

	var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _components = {
	  _component: {}
	};

	var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
	  filename: '/var/www/html/OpenAgenda/cibul-templates/eventForm/js/TimingsPicker.jsx',
	  components: _components,
	  locals: [],
	  imports: [_react3.default, _redboxReact3.default]
	});

	function _wrapComponent(id) {
	  return function (Component) {
	    return _reactTransformCatchErrors2(Component, id);
	  };
	}

	var React = __webpack_require__(12),
	    Picker = __webpack_require__(39),
	    utils = __webpack_require__(2),
	    transform = __webpack_require__(40);

	module.exports = _wrapComponent('_component')(React.createClass({
	  displayName: 'exports',


	  getDefaultProps: function getDefaultProps() {

	    return {
	      day: {
	        start: '07:00',
	        end: '07:00'
	      }
	    };
	  },

	  getLang: function getLang() {

	    var langs = {
	      fr: 'fr-FR',
	      en: 'en-US'
	    };

	    return langs[this.props.lang];
	  },

	  onChange: function onChange(timings, targetTiming, operation) {

	    var processed = transform.toEventFormFormat(timings, this.props.day.start, this.props.day.end);

	    this.props.onChange(processed, timings.length ? false : this.props.labels.noDates[this.props.lang]);
	  },

	  getTimings: function getTimings() {

	    return transform.toTimingsWidgetFormat(this.props.timings, this.props.day.start, this.props.day.end);
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'p',
	        { className: 'help' },
	        React.createElement(
	          'a',
	          { target: '_blank', href: 'https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement' },
	          this.props.labels.timingsHelp[this.props.lang]
	        )
	      ),
	      React.createElement(
	        'h2',
	        null,
	        this.props.labels.timings[this.props.lang]
	      ),
	      React.createElement(Picker, {
	        startTime: this.props.day.start,
	        endTime: this.props.day.end,
	        timings: this.getTimings(),
	        activeDays: this.props.configuration ? this.props.configuration.activeDays : undefined,
	        weekStartDay: 1,
	        onTimingsChange: this.onChange,
	        readOnly: false,
	        timeStep: 60,
	        timingStep: 30,
	        lang: this.getLang() })
	    );
	  }

	}));

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"date-format-lite\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var utils = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../utils/utils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var propTypes = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../utils/propTypes\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var i18n = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../locales/locales.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var Header = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./header/header\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Scheduler = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./scheduler/scheduler\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Recurrencer = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./scheduler/recurrencer\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var Stats = __webpack_require__( !(function webpackMissingModule() { var e = new Error("Cannot find module \"./stats/stats\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) );

	var TimingsPicker = React.createClass({displayName: "TimingsPicker",

	  propTypes: {
	    startTime: propTypes.time,
	    endTime: propTypes.time,
	    weekDayStart: React.PropTypes.number,
	    readOnly: React.PropTypes.bool,
	    onTimingClick: React.PropTypes.func,
	    onTimingsChange: React.PropTypes.func,
	    timings: React.PropTypes.array,
	    additionalLanguages: propTypes.additionalLanguages,
	    lang: propTypes.locale,
	    dateFormat: React.PropTypes.string,
	    timeFormat: React.PropTypes.string
	  },

	  getDefaultProps: function () {
	    return {
	      timingStep: 10,
	      startTime: "7:00",
	      endTime: "3:00",
	      weekStartDay: 1,
	      readOnly: false,
	      onTimingClick: function () { },
	      onTimingsChange: function () { },
	      timings: [],
	      additionalLanguages: [],
	      lang: navigator.language,
	      dateFormat: "DD-MM-YYYY",
	      timeFormat: "h:mm"
	    }
	  },

	  isOverlap: function (t1, t2) {
	    return t1.start < t2.end && t1.end > t2.start
	  },

	  canCreateTiming: function (targetTiming, overlapChecking, timings) {

	    overlapChecking = overlapChecking == undefined ? true : overlapChecking;
	    timings = timings || this.state.timings;

	    if (targetTiming.start.getTime() === targetTiming.end.getTime()) return false;

	    if (utils.minutesDifference(targetTiming.start, targetTiming.end, true) > this.state.allMinutes) return false;

	    var timings = this.state.timings;

	    if (overlapChecking) {

	      for (var i = 0, len = timings.length; i < len; i++) {

	        if (this.isOverlap(timings[i], targetTiming)) return false;

	      }

	    }

	    return true;

	  },

	  addTiming: function ( targetTiming ) {

	    if ( !this.canCreateTiming( targetTiming ) ) return;

	    var timings = this.state.timings,

	    lastId = this.state.lastTimingId;

	    targetTiming[this.state.timingsIdProperty] = lastId++;

	    timings.push( targetTiming );

	    this.setState({
	      timings: timings,
	      lastTimingId: lastId
	    });

	    this.props.onTimingsChange.call( this, this.state.timings, targetTiming, "Add timing" );


	  },

	  addTimings: function( targetTimings, overlapCheking ) {
	    var timings = this.state.timings,

	      lastId = this.state.lastTimingId,

	      addedTimings = [],

	      idName = this.state.timingsIdProperty;

	    for ( var i = 0, len = targetTimings.length; i < len; i++ ) {


	      if ( !this.canCreateTiming( targetTimings[i], overlapCheking ) ) return;


	      targetTimings[i][idName] = lastId++;

	      timings.push(targetTimings[i]);

	      addedTimings.push(targetTimings[i]);

	    }

	    this.setState({ timings: timings, lastTimingId: lastId });

	    if ( addedTimings.length > 0 ) {

	      this.props.onTimingsChange.call( this, this.state.timings, addedTimings, "Add timings" );

	    }

	  },

	  clearTimings: function() {

	    this.setState( {
	      timings: []
	    } );

	    this.props.onTimingsChange.call( this, [], null, 'Cleared timings' );

	  },

	  removeTiming: function (targetTiming, event) {

	    event.stopPropagation();

	    var timings = this.state.timings;

	    for ( var i = 0; i < timings.length; i++ ) {

	      if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {

	        timings.splice(i, 1/*on element to remove*/);
	        break;
	      }

	    }

	    this.setState({
	      timings: timings
	    });

	    this.props.onTimingsChange.call( this, timings, targetTiming, 'Remove timing' );

	  },

	  changeTiming: function (targetTiming) {
	    var timings = this.state.timings;

	    for (var i = 0; i < timings.length; i++) {
	      if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {
	        timings[i].start = targetTiming.start;
	        timings[i].end = targetTiming.end;
	      }
	    }

	    this.setState({
	      timings: timings
	    });

	    this.props.onTimingsChange.call(this, timings, targetTiming, "Change timing");
	  },
	  getStartDay: function (sortedArray, prop) {
	  var today = utils.setTime(new Date(), 0, 0, 0, 0);

	  for (var i = 0; i < sortedArray.length; i++) {
	    var d = new Date(sortedArray[i][prop]);
	    if (d > today) {
	      return d;
	    }
	  }
	  return new Date(sortedArray[sortedArray.length - 1][prop]);
	  },

	  getTimingsStartDate: function () {
	    var sortedTimings = this.props.timings.sort(function (t1, t2) {
	      return t1.start > t2.start ? 1 :
	          t1.start < t2.start ? -1 : 0;
	      }),
	    startDay;

	    startDay = this.getStartDay(sortedTimings, 'start');
	    return startDay;
	  },

	  getActiveDaysStartDate: function () {
	    var sortedActiveDays = this.props.activeDays.sort(function (t1, t2) {
	      return t1.startDate > t2.startDate ? 1 :
	      t1.startDate < t2.startDate ? -1 : 0;
	    }),
	    startDay;

	    startDay = this.getStartDay(sortedActiveDays, 'startDate');
	    return startDay;
	  },

	  getDateArrayFromActiveDays: function( days ) {

	    var startDate = new Date( days.startDate ),
	        endDate = new Date( days.endDate ),
	        result = [],
	        date;

	    startDate.setHours( startDate.getHours() + startDate.getTimezoneOffset() / 60 );
	    endDate.setHours( endDate.getHours() + endDate.getTimezoneOffset() / 60 );

	    for ( date = startDate; date <= endDate; date.setDate(date.getDate() + 1 ) ) {

	      result.push( new Date( date ) );

	    }

	    return result;
	  },

	  getInitialState: function () {

	    var timingStep = this.props.timingStep,

	    startTime = utils.parseTime( this.props.startTime ),

	    endTime = utils.parseTime( this.props.endTime ),

	  activeStartDay = this.hasActiveDays() ? this.getActiveDaysStartDate() : new Date(),

	    startDate = activeStartDay,

	    timings = [],

	    activeDays = [],

	    timingsIdProperty = "_rc_id",

	    _rc_id = 0;

	    endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;

	    if ( this.props.timings.length > 0 ) {

	      startDate = this.getTimingsStartDate();

	      timings = this.props.timings.map( function ( t ) {

	        var result = {
	          start: utils.setSecondsToZero( new Date(t.start) ),
	          end: utils.setSecondsToZero( new Date(t.end) ),
	          originalTiming: t,
	        };

	        result[timingsIdProperty] = _rc_id++;

	        return result;

	      });

	    }

	    if ( this.hasActiveDays() ) {

	      var result = [],
	          len = this.props.activeDays.length,
	          i = 0,
	          days;

	      for( i; i<len; i++ ) {

	        days = this.getDateArrayFromActiveDays( this.props.activeDays[i] );

	        result = result.concat(days);

	      }

	      activeDays = result.sort( function(t1, t2) {
	        
	        return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
	        
	      } );
	    }

	    while ( startDate.getDay() != this.props.weekStartDay ) {

	      startDate = utils.addDays( startDate, -1 );

	    }

	    var weekStart = utils.setTime( startDate, startTime.getHours(), startTime.getMinutes() ),

	    weekEnd = utils.setTime(utils.addDays(weekStart, 7), endTime.getHours(), endTime.getMinutes()),

	    isDayActive;

	    if( activeDays && activeDays.length && activeDays[activeDays.length - 1] > weekEnd ) {

	    isDayActive = utils.isDayActive(activeDays, weekEnd);
	    
	      if (!isDayActive) {
	        weekEnd = this.getNextActiveDay(activeDays, weekEnd);
	      }

	    }

	    var readOnly = this.props.readOnly.toString() === 'true';

	    var addLanguages = Array.isArray(this.props.additionalLanguages) ? this.props.additionalLanguages : [this.props.additionalLanguages];
	    var languages = utils.keyValueCollectionToObject(addLanguages);

	    for (var l in i18n) {
	      if (languages[l] === undefined) {
	        languages[l] = i18n[l]
	      }
	    }
	    var currentLanguage = languages[this.props.lang] ? languages[this.props.lang] :
	                languages["en-US"] ? languages["en-US"] : i18n["en-US"];

	    var weekStartDay = this.props.weekStartDay;

	    return {
	      endTime: endTime,
	      startTime: startTime,
	      weekStart: weekStart,
	    weekStartDay: weekStartDay,
	      weekEnd: weekEnd,
	      allMinutes: utils.minutesDifference(startTime, endTime, true),
	      timings: timings,
	      activeDays: activeDays,
	      timingsIdProperty: timingsIdProperty,
	      lastTimingId: _rc_id,
	      readOnly: readOnly,
	      languages: languages,
	      currentLanguage: currentLanguage,
	      isRecurrenceAdded: null,
	    isInactiveDayOverlap: false,
	      overlaps: [],
	    isDatePickerActive: true
	    };

	  },

	  getNextActiveDay: function(activeDays, day) {
	    var isDayActive = false,
	    activeDay = day;

	    while ( !isDayActive ) {
	    activeDay = utils.addDays(activeDay, 1);
	    isDayActive = utils.isDayActive(activeDays, activeDay);
	    }
	    return activeDay;
	  },

	  hasActiveDays: function() {

	    return this.props.activeDays && this.props.activeDays.length > 0;

	  },

	  shouldComponentUpdate: function (nextProps, nextState) {

	    if ( nextState.isRecurrenceAdded !== this.state.isRecurrenceAdded ) return true;

	    return true;
	  },

	  updateWeekStartAndEnd: function( weekStart ) {
	    var weekEnd = utils.addDays( weekStart, 7 ),
	    isDayActive;

	  if( this.hasActiveDays()) {
	    if( this.state.activeDays[this.state.activeDays.length - 1] > weekEnd ) {
	      isDayActive = utils.isDayActive(this.state.activeDays, weekEnd);
	      if (!isDayActive) {
	        weekEnd = this.getNextActiveDay(this.state.activeDays, weekEnd);
	      }
	      this.setState({ isDatePickerActive: true });
	    } else {
	      this.setState({ isDatePickerActive: false });
	    }
	  }
	    this.setState({
	      weekStart: weekStart,
	      weekEnd: weekEnd
	    });

	  },

	  goAnotherWeek: function ( next ) {

	    this.updateWeekStartAndEnd( utils.addDays( this.state.weekStart, next ? 7 : -7 ) );

	  },

	  goAnotherMonth: function (month) {

	    var newWeekStart = this.state.weekStart;
	    var daysInMonth = utils.daysInMonth(newWeekStart.getYear(), month);
	    newWeekStart.setDate(newWeekStart.getDate() > daysInMonth ? daysInMonth : newWeekStart.getDate());
	    newWeekStart.setMonth(month);

	    while (newWeekStart.getDay() != this.props.weekStartDay) {
	      newWeekStart = utils.addDays(newWeekStart, -1);
	    }

	    this.updateWeekStartAndEnd( newWeekStart );

	  },

	  goAnotherYear: function( year ) {

	    var newWeekStart = this.state.weekStart;

	    newWeekStart.setFullYear( year );

	    while ( newWeekStart.getDay() !== this.props.weekStartDay ) {

	      newWeekStart = utils.addDays( newWeekStart, -1 );

	    }

	    this.updateWeekStartAndEnd( newWeekStart );

	  },

	  getInactiveDaysOverlaps: function(days) {
	    var result = [],
	      activeDays = this.state.activeDays,
	      daysLen = days.length,
	      getUniqueDays,
	      activeDaysLen = activeDays.length,
	      i,
	      j;

	    getUniqueDays = function(days) {
	      var i = 0,
	        j = 0,
	        len = days.length,
	        dublicateIndexArray = [];

	      for(i; i<len; i++) {
	        if(days[i] === days[i+1]) {
	          days[i] = null;
	          dublicateIndexArray.push(i);
	        }
	      }
	      if(dublicateIndexArray) {
	        for(j = dublicateIndexArray.length - 1; j>=0; j--) {
	          days.splice(dublicateIndexArray[j], 1);
	        }
	      }

	      return days;
	    };
	    if(activeDaysLen && daysLen) {
	      days = getUniqueDays(days);

	      for(i = days.length - 1; i>=0; i--) {
	        for(j = activeDaysLen - 1; j>=0; j--) {
	          if(days[i] === activeDays[j].toDateString()) {
	            days.splice(i, 1);
	          }
	        }
	      }
	      result = days;
	    }
	    return result;
	  },
	  createRecurrence: function (startDate, endDate) {
	    var days = [],
	    isInactiveDayOverlap = false,
	    isOverlap = false,
	    overlaps =[];

	    var weekStart = this.state.weekStart,
	    weekEnd = this.state.weekEnd;
	    var recurrenceStart = utils.addDays(utils.setTime(startDate, this.state.startTime.getHours(), this.state.startTime.getMinutes()), 7),
	    recurrenceEnd = utils.setTime(endDate, this.state.endTime.getHours(), this.state.endTime.getMinutes());

	    if ( recurrenceEnd < utils.setTime(endDate, this.state.startTime.getHours(), this.state.startTime.getMinutes()) ) {

	    recurrenceEnd = utils.addDays(recurrenceEnd, 1);

	    }

	    var currentWeekTimings = utils.createTwoDimensionalArray( 7 ); /*7 days*/
	    this.refs.scheduler.props.timings.forEach(function (t) {

	    currentWeekTimings[t.start.getDay()].push(t);

	    });

	    var timingsToReccurence = [];
	    for (var start = recurrenceStart; start < recurrenceEnd; start = utils.addDays(start, 1)) {

	    var currentDayTimings = currentWeekTimings[start.getDay()];
	    for (var l = 0; l < currentDayTimings.length; l++) {
	      var daysDiff = Math.ceil(utils.minutesDifference(currentDayTimings[l].start, start, true) / 1440); /*1440 - minutes in day*/
	      timingsToReccurence.push({ start: utils.addDays(currentDayTimings[l].start, daysDiff), end: utils.addDays(currentDayTimings[l].end, daysDiff) });
	      days.push(start.toDateString());
	    }

	    }

	    overlaps = this.getInactiveDaysOverlaps(days);
	    if(overlaps.length){
	      isInactiveDayOverlap = true;
	      isOverlap = true;
	    } else {
	      var selectedPeriodTimings = utils.createTwoDimensionalArray(7);
	      /*7 days*/
	      this.state.timings.filter(function (t) {

	        return !(t.start >= weekStart && t.end <= weekEnd) && (t.start >= recurrenceStart && t.end <= recurrenceEnd);

	      }).forEach(function (t) {

	        selectedPeriodTimings[t.start.getDay()].push(t);

	      });

	      var format = this.props.timeFormat + " " + this.props.dateFormat;
	      for (var j = 0; j < timingsToReccurence.length; j++) {

	        var t = timingsToReccurence[j], timingsToCheck = selectedPeriodTimings[t.start.getDay()];
	        for (var k = 0; k < timingsToCheck.length; k++) {
	          if (this.isOverlap(t, timingsToCheck[k])) {

	            overlaps.push("" + this.state.currentLanguage.from + " " + timingsToCheck[k].start.format(format) +
	              " " + this.state.currentLanguage.to + " " + timingsToCheck[k].end.format(format));
	            isOverlap = true;

	          }
	        }
	      }
	    }

	    if (isOverlap) {

	      this.setState({ isRecurrenceAdded: false, overlaps: overlaps, isInactiveDayOverlap: isInactiveDayOverlap });

	    }
	    else {

	      this.addTimings( timingsToReccurence, isOverlap );
	      this.setState({ isRecurrenceAdded: true });
	      setTimeout((function () { this.setState({ isRecurrenceAdded: null }) }).bind(this), 3000);

	    }
	  },

	  render: function () {
	    var weekStart = this.state.weekStart,
	    weekStartDay = this.state.weekStartDay,
	    weekEnd = this.state.weekEnd;

	    var timings = this.state.timings.filter(function (t) {
	      return t.start >= weekStart && t.end <= weekEnd;
	    });

	    var activeDays = this.state.activeDays;

	    var timingsModifications = this.state.readOnly === true ? undefined : {
	      addTiming: this.addTiming,
	      removeTiming: this.removeTiming,
	      changeTiming: this.changeTiming
	    };

	    var lang = this.state.currentLanguage;
	    var bottompart;

	    if (!this.state.readOnly) {

	      var messageCloseFunction = (function () { this.setState({ isRecurrenceAdded: undefined }) }).bind(this);
	      var messageCloseIcon = React.createElement("div", {className: "rc-message-close rc-icon rc-icon-close", onClick: messageCloseFunction})
	      if (this.state.isRecurrenceAdded === true) {
	        bottompart = React.createElement("div", {className: "rc-success"}, 
	          lang.recurrenceAddedSuccessfully, 
	          messageCloseIcon
	        )
	      }
	      else if (this.state.isRecurrenceAdded === false) {
	        bottompart =
	        React.createElement("div", {className: "rc-error"}, 
	          this.state.isInactiveDayOverlap ? lang.inactiveDaysPreventRecurring : lang.timingsPreventRecurring, ":", 
	          React.createElement("ul", null, 
	            this.state.overlaps.map(function(value, i){
	              return React.createElement("li", {key: i}, value)
	            })
	          ), 
	          messageCloseIcon
	        );
	      }
	      else {
	        bottompart = React.createElement(Recurrencer, {
	          createRecurrence: this.createRecurrence, 
	          startDate: weekStart, 
	          endDate: weekEnd, 
	      weekStartDay: weekStartDay, 
	          strings: lang, 
	      activeDays: activeDays, 
	          dateFormat: this.props.dateFormat, 
	      isDatePickerActive: this.state.isDatePickerActive});
	      }
	    }

	    return (
	      React.createElement("div", {className: "rc-calendar rc-noselect"}, 
	        React.createElement("div", {className: "rc-calendar-body"}, 
	          React.createElement(Stats, {
	            timings: this.state.timings, 
	            onClear: this.clearTimings, 
	            strings: lang}), 
	          React.createElement(Header, {
	            startDate: weekStart, 
	            goAnotherWeek: this.goAnotherWeek, 
	            goAnotherMonth: this.goAnotherMonth, 
	            goAnotherYear: this.goAnotherYear, 
	            months: lang.months, 
	            weekdays: lang.weekdays}), 
	          React.createElement(Scheduler, {ref: "scheduler", 
	            strings: lang, 
	            startDate: weekStart, 
	            startTime: this.state.startTime, 
	            endTime: this.state.endTime, 
	            timeStep: this.props.timeStep, 
	            allMinutes: this.state.allMinutes, 
	            timings: timings, 
	            timingStep: this.props.timingStep, 
	            defaultTimigDuration: this.props.defaultTimigDuration, 
	            weekdays: lang.weekdays, 
	            timingsModifications: timingsModifications, 
	            readOnly: this.state.readOnly, 
	            activeDays: activeDays, 
	            onTimingClick: this.props.onTimingClick, 
	            timingsIdProperty: this.state.timingsIdProperty, 
	            startTimeLabel: lang.startTime, 
	            endTimeLabel: lang.endTime})
	        ), 
	        React.createElement("div", {className: "rc-reccurencer"}, 
	          bottompart
	        )
	      )
	      );
	  }
	});

	module.exports = TimingsPicker;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2);

	module.exports = {
	  toTimingsWidgetFormat: toTimingsWidgetFormat,
	  toEventFormFormat: toEventFormFormat
	};

	/**
	 * [{
	 *   "date":"2010-01-01",
	 *   "begin":"10:00",
	 *   "end":"15:00"
	 *  },{
	 *    "date":"2010-10-10",
	 *    "begin":"13:00",
	 *    "end":"20:00"
	 *  },{
	 *    "date":"2012-08-01",
	 *    "begin":"08:00",
	 *    "end":"15:00"
	 *  },{
	 *    "date":"2010-03-10",
	 *    "begin":"10:00",
	 *    "end":"20:00"
	 *  }]
	 */

	function toEventFormFormat(timings, dayStart, dayEnd) {

	  return timings.filter(function (t) {

	    var s = new Date(t.start),
	        e = new Date(t.end);

	    if (s.getDate() !== e.getDate()) {

	      if (dayEnd < _stringifyHours(e)) return false;
	    }

	    return true;
	  }).map(function (t) {

	    var s = new Date(t.start),
	        e = new Date(t.end);

	    return {
	      date: s.getFullYear() + '-' + utils.fZ(s.getMonth() + 1) + '-' + utils.fZ(s.getDate()),
	      begin: _stringifyHours(s),
	      end: _stringifyHours(e)
	    };
	  });
	}

	/**
	 *  [ {
	 *    "start":"2010-01-01T10:00+01:00",
	 *    "end":"2010-01-01T15:00+01:00"
	 *  }, {
	 *    "start":"2010-10-10T13:00+02:00",
	 *    "end":"2010-10-10T20:00+02:00"
	 *  }, {
	 *    "start":"2012-08-01T08:00+02:00",
	 *    "end":"2012-08-01T15:00+02:00"
	 *  }, {
	 *    "start":"2010-03-10T10:00+01:00",
	 *    "end":"2010-03-10T20:00+01:00"
	 *  } ]
	 */

	/**
	 * [{
	 *   "start":"2010-01-01T09:00:00.000Z",
	 *   "end":"2010-01-01T14:00:00.000Z"
	 * },{
	 *   "start":"2010-03-10T09:00:00.000Z",
	 *   "end":"2010-03-10T19:00:00.000Z"
	 * },{
	 *   "start":"2010-10-10T11:00:00.000Z",
	 *   "end":"2010-10-10T18:00:00.000Z"
	 * },{
	 *   "start":"2012-08-01T06:00:00.000Z",
	 *   "end":"2012-08-01T13:00:00.000Z"
	 * },{
	 *   "start":"2012-08-03T07:00:00.000Z",
	 *   "end":"2012-08-03T10:00:00.000Z"
	 * }]
	 */

	function toTimingsWidgetFormat(timings, dayStart, dayEnd) {

	  return (timings || []).filter(function (t) {

	    // we cannot handle end times that go beyond timing column
	    if (t.end <= t.begin) {

	      if (t.end > dayEnd) return false;
	    }

	    return true;
	  }).map(function (t) {

	    return {
	      start: t.date + 'T' + t.begin + _tZ(t.date),
	      end: _endDate(t.date, t.begin, t.end) + 'T' + t.end + _tZ(t.date)
	    };
	  });
	}

	function _endDate(d, begin, end) {

	  var date;

	  if (end > begin) {

	    return d;
	  }

	  date = new Date(d);

	  date.setDate(date.getDate() + 1);

	  return [date.getFullYear(), utils.fZ(date.getMonth() + 1), utils.fZ(date.getDate())].join('-');
	}

	function _tZ(d) {

	  var tzh = new Date(d).getTimezoneOffset() / 60;

	  return (tzh >= 0 ? '' : '+') + utils.fZ(-tzh) + ':00';
	}

	function _stringifyHours(d) {

	  return utils.fZ(d.getHours()) + ':' + utils.fZ(d.getMinutes());
	}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(42);

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    lang: React.PropTypes.string.isRequired,
	    set: React.PropTypes.object,
	    tags: React.PropTypes.array,
	    selection: React.PropTypes.array,
	    labels: React.PropTypes.object.isRequired
	  },

	  getInitialState: function getInitialState() {

	    return {
	      userHasTyped: []
	    };
	  },

	  componentDidMount: function componentDidMount() {

	    // need to validate data on mount
	    this.props.onChange(this.props.selection, this.getAllGroupErrors(this.props.selection));
	  },

	  isLegacyMode: function isLegacyMode() {

	    return !this.props.set;
	  },

	  getLabel: function getLabel(name) {

	    return this.props.labels[name][this.props.lang];
	  },

	  /**
	   * if tags do not come as a set,
	   * this function creates the set from legacy tag list
	   */

	  getSet: function getSet() {

	    if (this.isLegacyMode()) return {
	      groups: [{
	        tags: this.props.tags
	      }]
	    };

	    return this.props.set;
	  },

	  removeItem: function removeItem(item, groupIndex) {

	    var newSelection = [],
	        self = this;

	    this.props.selection.forEach(function (s) {

	      if (self.getSlug(item) !== self.getSlug(s)) {

	        newSelection.push(s);
	      }
	    });

	    this.setState({
	      userHasTyped: this.state.userHasTyped.concat([groupIndex])
	    });

	    this.props.onChange(newSelection, this.getAllGroupErrors(newSelection));
	  },

	  getAllGroupErrors: function getAllGroupErrors(newSelection) {

	    var errors = [],
	        self = this;

	    this.getSet().groups.forEach(function (g, i) {

	      errors = errors.concat(self.getErrors(i, newSelection));
	    });

	    return errors;
	  },

	  getErrors: function getErrors(i, newSelection) {

	    var self = this,
	        hasSelected = false,
	        selectedSlugs = (newSelection || this.props.selection).map(this.getSlug);

	    if (!this.getSet().groups[i].required) {

	      return [];
	    }

	    // if tags of the current group are in selection, then we are good
	    if (this.getSet().groups[i].tags.filter(function (t) {

	      return selectedSlugs.indexOf(self.getSlug(t)) !== -1;
	    }).length) return [];

	    return [{
	      field: 'tags' + i,
	      label: this.getGroupName(i),
	      message: this.props.labels.requiredTagError
	    }];
	  },

	  // rudimentary slugify for test purposes
	  // ( slug must be set when integrated )
	  getSlug: function getSlug(item) {

	    var slug = item.slug;

	    if (!slug) {

	      slug = item.label.toLowerCase().replace(/\s/g, '-');
	    }

	    return slug;
	  },

	  getGroupName: function getGroupName(groupIndex) {

	    var group = this.getSet().groups[groupIndex];

	    return group.name ? group.name : this.getLabel('defaultTagGroupName');
	  },

	  addItem: function addItem(item, groupIndex) {

	    this.setState({
	      userHasTyped: this.state.userHasTyped.concat([groupIndex])
	    });

	    this.props.onChange(this.props.selection.concat(item));
	  },

	  renderItem: function renderItem(item, groupIndex) {

	    var self = this,
	        checked = !!this.props.selection.filter(function (s) {
	      return self.getSlug(s) == self.getSlug(item);
	    }).length;

	    return React.createElement(
	      'div',
	      { className: 'checkbox',
	        key: this.getSlug(item) },
	      React.createElement(
	        'label',
	        null,
	        React.createElement('input', { type: 'checkbox', checked: checked, onChange: (checked ? this.removeItem : this.addItem).bind(null, item, groupIndex) }),
	        item.label
	      )
	    );
	  },

	  renderGroup: function renderGroup(group, i) {

	    var self = this,
	        displayError = this.state.userHasTyped.indexOf(i) !== -1 && this.getErrors(i).length;

	    return React.createElement(
	      'div',
	      { className: 'tc-group', key: i },
	      React.createElement(
	        'div',
	        { className: 'tc-head' },
	        React.createElement(
	          'label',
	          { className: displayError ? 'error' : '' },
	          this.getGroupName(i),
	          group.required ? ' (*)' : ''
	        ),
	        group.info ? React.createElement(
	          'p',
	          null,
	          group.info
	        ) : null
	      ),
	      React.createElement(
	        'div',
	        { className: 'tc-selector-items' },
	        group.tags.map(function (t) {
	          return self.renderItem(t, i);
	        })
	      )
	    );
	  },

	  render: function render() {

	    return React.createElement(
	      'div',
	      { className: 'tc-selector' },
	      this.getSet().groups.map(this.renderGroup)
	    );
	  }

	});

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    labels = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"labels/agenda-locations/selector\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    LocationSearch = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LocationSearch\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    LocationForm = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./LocationForm\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    createLabels = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"labels/agenda-locations/create\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {

	    lang: React.PropTypes.string,

	    location: React.PropTypes.object,

	    // agenda-specific settings for selector
	    settings: React.PropTypes.object,

	    /**
	     * mode of the selector needs to be handled by
	     * the parent component as in the event form use case,
	     * the component is displayed at 2 different locations depending
	     * on the mode. Create replaces the form, search is embedded in it;
	     */
	    mode: React.PropTypes.string,

	    onChangeMode: React.PropTypes.func,

	    onChange: React.PropTypes.func // if location has changed, returns it;
	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      mode: 'create',
	      settings: {
	        eventForm: {
	          detailed: false
	        }
	      }
	    };
	  },

	  getInitialState: function getInitialState() {

	    return {
	      name: ''
	    };
	  },

	  getLabel: function getLabel(name, values) {

	    var str = labels[name][this.props.lang],
	        k;

	    if (values) {

	      for (k in values) {

	        str = str.replace(k, values[k]);
	      }
	    }

	    return str;
	  },

	  getMode: function getMode() {

	    return this.props.mode || 'show';
	  },

	  onSelect: function onSelect(l) {

	    this.props.onChange(l, 'show');
	  },

	  onCreateRequest: function onCreateRequest(value) {

	    this.props.onChangeMode('create', { name: value });
	  },

	  onCreateSuccess: function onCreateSuccess(l) {

	    this.props.onChange(l, 'show');
	  },

	  switchToSearch: function switchToSearch() {

	    this.props.onChangeMode('search');
	  },

	  renderSelected: function renderSelected() {

	    var l = this.props.location;

	    return React.createElement(
	      'div',
	      { className: 'selected-location' },
	      React.createElement(
	        'div',
	        { className: 'actions' },
	        React.createElement(
	          'a',
	          {
	            onClick: this.switchToSearch,
	            className: 'btn btn-default' },
	          this.getLabel(l ? 'change' : 'find')
	        )
	      ),
	      l ? React.createElement(
	        'div',
	        null,
	        React.createElement(
	          'div',
	          { className: 'name' },
	          l.name
	        ),
	        React.createElement(
	          'div',
	          { className: 'address' },
	          l.address
	        )
	      ) : React.createElement(
	        'div',
	        null,
	        React.createElement(
	          'p',
	          { className: 'nolocation' },
	          this.getLabel('nolocation')
	        )
	      )
	    );
	  },
	  renderSearch: function renderSearch() {

	    return React.createElement(LocationSearch, {
	      init: this.props.location ? this.props.location.name : '',
	      getLabel: this.getLabel,
	      res: this.props.res,
	      lang: this.props.lang,
	      onSelect: this.onSelect,
	      onCreateRequest: this.onCreateRequest });
	  },

	  renderForm: function renderForm() {

	    return React.createElement(LocationForm, {
	      settings: this.props.settings,
	      detailedInfo: this.props.settings.eventForm && this.props.settings.eventForm.detailed,
	      res: this.props.res,
	      lang: this.props.lang,
	      onCancel: this.switchToSearch,
	      onSuccess: this.onCreateSuccess,
	      labels: createLabels,
	      location: this.props.location });
	  },

	  render: function render() {

	    var self = this;

	    return React.createElement(
	      'div',
	      { className: 'location-selector' },
	      function () {

	        switch (self.getMode()) {
	          case 'show':
	            return self.renderSelected();
	          case 'search':
	            return self.renderSearch();
	          case 'create':
	            return self.renderForm();
	        }
	      }()
	    );
	  }

	});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(45);

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    lang: React.PropTypes.string.isRequired,
	    set: React.PropTypes.object,
	    categories: React.PropTypes.array,
	    selection: React.PropTypes.object,
	    labels: React.PropTypes.object.isRequired
	  },

	  getInitialState: function getInitialState() {

	    return {
	      userHasTyped: false
	    };
	  },

	  componentDidMount: function componentDidMount() {

	    // need to validate data on mount
	    this.props.onChange(this.props.selection, this.getErrors(this.props.selection));
	  },

	  getLabel: function getLabel(name) {

	    return this.props.labels[name][this.props.lang];
	  },

	  getTitle: function getTitle() {

	    if (this.props.set && this.props.set.name) {

	      return this.props.set.name;
	    } else {

	      return this.getLabel('categoriesTitle');
	    }
	  },

	  getErrors: function getErrors(selection) {

	    var set = this.getSet();

	    if (!set.required || selection) return [];

	    return [{
	      field: "categories",
	      label: this.getTitle(),
	      message: this.props.labels.requiredCategoryError
	    }];
	  },

	  // rudimentary slugify for test purposes
	  // ( slug must be set when integrated )
	  getSlug: function getSlug(item) {

	    var slug = item.slug;

	    if (!slug) {

	      slug = item.label.toLowerCase().replace(/\s/g, '-');
	    }

	    return slug;
	  },

	  onSelect: function onSelect(item, selected) {

	    var value = selected ? undefined : item,
	        errors = this.getErrors(value);

	    this.setState({
	      userHasTyped: true
	    });

	    this.props.onChange(value, errors);
	  },

	  renderItem: function renderItem(item) {

	    var checked = this.props.selection && this.getSlug(this.props.selection) == this.getSlug(item);

	    return React.createElement(
	      'div',
	      { className: 'radio', key: this.getSlug(item) },
	      React.createElement(
	        'label',
	        null,
	        React.createElement('input', { type: 'radio', checked: checked, onChange: this.onSelect.bind(null, item, checked).bind(null, item) }),
	        item.label
	      )
	    );
	  },

	  getSet: function getSet() {

	    if (this.props.set) return this.props.set;

	    return {
	      info: false,
	      required: false,
	      categories: this.props.categories
	    };
	  },

	  render: function render() {

	    var displayError = this.state.userHasTyped && this.getErrors(this.props.selection).length,
	        set = this.getSet();

	    return React.createElement(
	      'div',
	      { className: 'tc-selector' },
	      React.createElement(
	        'div',
	        { className: 'tc-head' },
	        React.createElement(
	          'label',
	          { className: displayError ? 'error' : '' },
	          this.getTitle(),
	          set.required ? ' (*)' : ''
	        ),
	        set.info ? React.createElement(
	          'p',
	          null,
	          set.info
	        ) : null
	      ),
	      React.createElement(
	        'div',
	        { className: 'tc-selector-items' },
	        this.getSet().categories.map(this.renderItem)
	      )
	    );
	  }

	});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/React\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    TagsInput = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react-tagsinput\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    validate = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./validate\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    labels = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"labels/event/registration\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	module.exports = React.createClass({
	  displayName: 'exports',


	  propTypes: {
	    typeIconClassNames: React.PropTypes.object,
	    value: React.PropTypes.string.isRequired,
	    lang: React.PropTypes.string
	  },

	  getInitialState: function getInitialState() {

	    return {
	      inputValue: ''
	    };
	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      lang: 'en',
	      typeIconClassNames: {
	        link: 'fa fa-link',
	        phone: 'fa fa-phone',
	        email: 'fa fa-envelope',
	        error: 'fa fa-exclamation-circle'
	      }
	    };
	  },

	  renderTag: function renderTag(t) {

	    if (t.tag.error) t.className += ' error';

	    return React.createElement(
	      'span',
	      { key: t.key, className: t.className },
	      React.createElement('i', { className: this.props.typeIconClassNames[t.tag.type || 'error'] }),
	      t.tag.value,
	      React.createElement('a', { onClick: t.onRemove.bind(null, t.key) })
	    );
	  },

	  getValues: function getValues() {

	    if (!this.props.value) return [];

	    return this.props.value.split(',').map(validate);
	  },

	  getLabels: function getLabels(code) {

	    return labels[code][this.props.lang];
	  },

	  onChange: function onChange(v) {

	    this.setState({ inputValue: '' });

	    this.props.onChange(v.map(function (item) {
	      return typeof item == 'string' ? item : item.value;
	    }).join(', '));
	  },

	  onBlur: function onBlur(v) {

	    var value = this.state.inputValue;

	    if (!value.length) return;

	    this.setState({ inputValue: '' });

	    // stick the last typed entry to the values and signal parent
	    this.onChange(this.getValues().concat(value));
	  },

	  onInputChange: function onInputChange(v) {

	    var value = v.target.value;

	    if (value.indexOf(',') !== -1) {

	      this.onChange(this.getValues().concat(value.split(',')[0]));

	      value = value.split(',')[1];
	    }

	    this.setState({ inputValue: value });
	  },

	  render: function render() {

	    var values = this.getValues(),
	        error = !!values.filter(function (v) {
	      return v.error;
	    }).length;

	    return React.createElement(
	      'div',
	      { className: 'registration-input' + (error ? ' error' : '') },
	      React.createElement(
	        'label',
	        null,
	        this.getLabels(error ? 'error' : 'info')
	      ),
	      React.createElement(TagsInput, {
	        value: values,
	        renderTag: this.renderTag,
	        onChange: this.onChange,
	        inputProps: {
	          onBlur: this.onBlur,
	          onChange: this.onInputChange,
	          value: this.state.inputValue,
	          placeholder: !values.length ? this.getLabels('placeholder') : null,
	          style: !values.length ? { width: '300px' } : null
	        } })
	    );
	  }

	});

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/update\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  getSwapIndex: getSwapIndex,
	  isSame: isSame
	};

	/**
	 * if one language has changed but order and count
	 * has remained the same, then the operation is
	 * a language swap
	 */
	function getSwapIndex(l1, l2) {

	  var changeIndexes = [];

	  if (l1.length !== l2.length) {

	    return -1;
	  }

	  for (var i = l1.length - 1; i >= 0; i--) {

	    if (l1[i] !== l2[i]) changeIndexes.push(i);
	  }

	  // we are interested in one swap; not more
	  if (changeIndexes.length !== 1) {

	    return -1;
	  }

	  return changeIndexes[0];
	}

	//http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
	function isSame(a, b) {

	  // if the other array is a falsy value, return
	  if (!a) return false;

	  // compare lengths - can save a lot of time
	  if (b.length != a.length) return false;

	  for (var i = 0; i < b.length; i++) {

	    // Check if we have nested arrays
	    if (b[i] instanceof Array && a[i] instanceof Array) {

	      // recurse into the nested arrays
	      if (!b[i].compare(a[i])) {

	        return false;
	      }
	    } else if (b[i] != a[i]) {

	      // Warning - two different object instances will never be equal: {x:20} != {x:20}
	      return false;
	    }
	  }
	  return true;
	}

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"react/lib/ReactDOM\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2);

	module.exports = function (formConfiguration, options) {

	  var params = utils.extend({
	    lang: 'en'
	  }, options);

	  return {
	    field: field
	  };

	  function field(name) {

	    var configuration = getConfiguration();

	    return utils.extend({}, configuration, {
	      getLabel: getLabel,
	      getPlaceholder: getPlaceholder,
	      display: display
	    });

	    function getConfiguration() {

	      var fields = formConfiguration.fields || [],
	          fieldConfiguration = fields.filter(function (f) {

	        return f.name == name;
	      });

	      if (!fieldConfiguration.length) return false;

	      return fieldConfiguration[0];
	    }

	    function getLabel(translated, defaults) {

	      if (configuration && configuration.label) {

	        return translated ? configuration.label[params.lang] : configuration.label;
	      }

	      return translated ? defaults[name][params.lang] : defaults[name];
	    }

	    function getPlaceholder(translated, defaults) {

	      if (configuration && configuration.placeholder) {

	        return translated ? configuration.placeholder[params.lang] : configuration.placeholder;
	      }

	      return translated ? defaults[name + 'Placeholder'][this.props.lang] : defaults[name + 'Placeholder'];
	    }

	    function display() {

	      if (!configuration || configuration.display === undefined) return true;

	      return configuration.display;
	    }
	  }
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  descriptionSection: {
	    fr: 'Descriptifs',
	    en: 'Description fields'
	  },
	  locationSection: {
	    fr: 'Lieu',
	    en: 'Location'
	  },
	  title: {
	    fr: 'Titre',
	    en: 'Title'
	  },
	  description: {
	    fr: 'Description',
	    en: 'Description'
	  },
	  longDescription: {
	    fr: 'Description longue',
	    en: 'Long description'
	  },
	  longDescriptionPlaceholder: {
	    fr: 'Saisissez une description détaillée de votre événement. \n\nVouz pouvez également ajouter des liens vers des images (.jpg ou autre). \n\nIntégrez des vidéos youtube en collant le lien de la page. ex: http://www.youtube.com/watch?v=wZZ7oFKsKzY',
	    en: 'Type in a detailed description of your event. \n\nPaste in image links too (.jpg or other). \n\nEmbed youtube videos by simply pasting in the link. ex: http://www.youtube.com/watch?v=wZZ7oFKsKzY'
	  },
	  keywords: {
	    fr: 'Mots clés',
	    en: 'Keywords'
	  },
	  accessibility: {
	    fr: 'Accessibilité particulière',
	    en: 'Accessibility conditions'
	  },
	  conditions: {
	    fr: 'Conditions',
	    en: 'Conditions'
	  },
	  conditionsPlaceholder: {
	    fr: 'Entrée libre, inscription requise, tarif, autre...',
	    en: 'Free access, inscription required, pricing, other...'
	  },
	  ticketLink: {
	    fr: 'Lien de réservation',
	    en: 'Reservation link'
	  },
	  age: {
	    fr: 'Age du public ciblé',
	    en: 'Targeted public age'
	  },
	  timings: {
	    fr: 'Horaires',
	    en: 'Timings'
	  },
	  timingsHelp: {
	    fr: 'Comment ça marche?',
	    en: 'How does this work?'
	  },
	  uploadButton: {
	    fr: 'Sélectionner',
	    en: 'Select'
	  },
	  addLanguage: {
	    'en' : 'add a language',
	    'fr' : 'ajouter une langue'
	  },
	  keywordPlaceholder: {
	    fr: 'Ajoutez des mots-clés séparés par des virgules',
	    en: 'Add comma-separated keywords'
	  },
	  noDates: {
	    fr: 'Au moins un horaire doit être défini',
	    en: 'At least one timing must be defined'
	  },
	  categoriesTitle: {
	    en: 'Categories',
	    fr: 'Catégories'
	  },
	  tagsTitle: {
	    en: 'Tags',
	    fr: 'Tags'
	  },
	  categoriesInfo: {
	    en: 'These are used to index your event in the agenda. Pick one.',
	    fr: 'Celles-ci servent pour l\'indexation dans l\'agenda. Vous pouvez en choisir une.'
	  },
	  defaultTagGroupName: {
	    en: 'Tags',
	    fr: 'Tags'
	  },
	  defaultTagGroupInfo: {
	    en: 'These are used to index your event in the agenda. You can select several.',
	    fr: 'Ceux-ci servent pour l\'indexation dans l\'agenda. Vous pouvez en choisir plusieurs.'
	  },
	  required: {
	    en: 'Required.',
	    fr: 'Requis.'
	  },
	  categoriesRequired: {
	    en: 'Required.',
	    fr: 'Requis.'
	  },
	  requiredTagError: {
	    en: 'You must select at least one item',
	    fr: 'Vous devez faire au minimum une sélection'
	  },
	  requiredCategoryError: {
	    en: 'You must select one item',
	    fr: 'Vous devez faire une sélection'
	  }
	}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(10);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var utils = __webpack_require__(2),
	    rUtils = __webpack_require__(3),
	    eventValidator = __webpack_require__(53),
	    lUtils = __webpack_require__(48);

	module.exports = function (params) {

	  params = utils.extend({
	    event: {},
	    events: {
	      log: 'log',
	      fetch: 'eventfetch',
	      description: {
	        fetch: 'edescriptionfetch',
	        write: 'edescriptionfieldsend',
	        remove: 'edescriptionfieldremove'
	      },
	      location: {
	        fetch: 'elocationfetch',
	        remove: 'elocationremove',
	        write: 'elocationsend'
	      },
	      image: {
	        fetch: 'eimagefetch',
	        remove: 'eimageremove',
	        write: 'eimagesend'
	      },
	      agenda: {
	        fetch: 'eagendafetch',
	        write: 'eagendawrite'
	      },
	      customfields: {
	        write: 'ecustomfieldssend'
	      },
	      singleField: {
	        write: 'esinglesend'
	      },
	      timingsField: {
	        write: 'etimingssend'
	      },
	      uidfetch: 'euidfetch',
	      validate: 'evalidate',
	      fetchEncoded: 'efetchencoded',
	      languageChange: 'elanguageschange',
	      fetchLanguages: 'elanguagesfetch',
	      clear: 'eventclear'
	    },
	    descriptionFields: ['title', 'description', 'tags', 'freeText']

	  }, params);

	  var eh = rUtils.eh,
	      validator = eventValidator({ labels: params.labels }),
	      nextLocationIndex = 0,
	      currentErrors = [],
	      event = params.event,
	      onValidate = false,
	      languages = [],
	      callbackIds = []; // keep track of callbacks used by event handler

	  function init() {

	    if (Object.prototype.toString.call(event) === '[object Array]') {

	      event = {};
	    }

	    _on(params.events.log, function () {

	      console.log(event);
	    });

	    _on(params.events.fetch, function (cb) {

	      cb(JSON.parse((0, _stringify2.default)(event)));
	    });

	    _on(params.events.description.fetch, function (cb) {

	      cb({
	        title: event.title,
	        description: event.description,
	        tags: event.tags,
	        freeText: event.freeText,
	        conditions: event.conditions
	      });
	    });

	    _on(params.events.description.write, function (data) {

	      currentErrors = data.errors;

	      if (!event[data.name]) event[data.name] = {};

	      event[data.name] = JSON.parse((0, _stringify2.default)(data.value));

	      if (data.callback) data.callback(error);

	      _evaluate();
	    });

	    _on(params.events.location.fetch, function (cb) {

	      cb(event.location);
	    });

	    _on(params.events.location.write, function (location) {

	      event.location = JSON.parse((0, _stringify2.default)(location));

	      _evaluate();
	    });

	    // get agenda information

	    _on(params.events.agenda.fetch, function (data) {

	      if (event.agendas) for (var a in event.agendas) {

	        if (event.agendas[a].uid == data.uid) return data.callback(event.agendas[a]);
	      }

	      data.callback(false);
	    });

	    // write agenda information in existing or new entry

	    _on(params.events.agenda.write, function (data) {

	      currentErrors = data.errors;

	      _evaluate();

	      if (!event.agendas) event.agendas = [];

	      for (var i = event.agendas.length - 1; i >= 0; i--) {

	        if (event.agendas[i].uid == data.uid) {

	          event.agendas[i] = data;

	          return;
	        }
	      }

	      event.agendas.push(data);
	    });

	    // update agenda information

	    _on(params.events.image.fetch, function (callback) {

	      callback(event.image ? { image: event.image } : false);
	    });

	    _on(params.events.image.remove, function () {

	      event.image = false;

	      _evaluate();
	    });

	    _on(params.events.image.write, function (data) {

	      if (data.image) event.image = data.image;

	      _evaluate();
	    });

	    _on(params.events.singleField.write, function (data) {

	      currentErrors = data.errors;

	      event[data.name] = JSON.parse((0, _stringify2.default)(data.value));
	    });

	    _on(params.events.timingsField.write, function (newTimings) {

	      event.timings = JSON.parse((0, _stringify2.default)(newTimings));
	    });

	    _on(params.events.customfields.write, function (data) {

	      event.custom = data.values;

	      currentErrors = data.errors;

	      _evaluate();
	    });

	    _on(params.events.uidfetch, function (cb) {

	      cb({
	        uid: event.uid || false,
	        draft: !!event.draft
	      });
	    });

	    _on(params.events.validate, function (callbacks) {

	      onValidate = callbacks.onChange;

	      _evaluate(callbacks.onSuccess);
	    });

	    _on(params.events.fetchEncoded, function (cb) {

	      cb((0, _stringify2.default)(event));
	    });

	    _on(params.events.fetchLanguages, function (cb) {

	      cb(languages);
	    });

	    _on(params.events.languageChange, _updateLanguages);

	    _on(params.events.clear, function () {

	      // unregister methods
	      utils.forEach(callbackIds, function (id) {

	        eh.cancel(id);
	      });
	    });
	  }

	  function _on(eventName, callback) {

	    callbackIds.push(eh.on(eventName, callback));
	  }

	  function _validate(field, value) {

	    validator.process(field, value);
	  }

	  function _evaluate(onSuccess) {

	    if (onValidate || onSuccess) _validateEvent(currentErrors, function (success, errors) {

	      if (success && onSuccess) onSuccess();

	      if (onValidate) onValidate(success, errors);
	    });
	  }

	  function _extract(attr, obj, filterIfFalse) {

	    var extract = {};

	    if (typeof filterIfFalse == 'undefined') filterIfFalse = false;

	    for (var i in obj) {

	      if (!filterIfFalse || obj[i][attr] !== false) {

	        extract[i] = obj[i][attr];
	      }
	    }

	    return extract;
	  }

	  function _validateEvent(preErrors, callback) {

	    var errors = validator.processFull(event),
	        concatenated = preErrors.concat(errors);

	    callback(concatenated.length ? false : true, concatenated);
	  }

	  function _updateLanguages(newLanguages) {

	    // compare with existing

	    var swapIndex = lUtils.getSwapIndex(languages, newLanguages),
	        hasChanges = !lUtils.isSame(languages, newLanguages);

	    if (swapIndex == -1 && !hasChanges) {

	      // nothing happened here..
	      return;
	    }

	    if (swapIndex !== -1) {

	      // we have a language swap, current must be replaced by new
	      var swapFrom = languages[swapIndex],
	          swapTo = newLanguages[swapIndex];

	      ['title', 'description', 'freeText', 'tags', 'conditions'].forEach(function (field) {

	        event[field][swapTo] = event[field][swapFrom];

	        delete event[field][swapFrom];
	      });

	      currentErrors = currentErrors.map(function (e) {

	        if (typeof e.message !== 'string' && e.message[swapFrom]) {

	          e.message[swapTo] = e.message[swapFrom];

	          delete e.message[swapFrom];
	        }

	        return e;
	      });
	    } else if (hasChanges) {

	      // there is a change in languages, removed languages must be cleared out from event.
	      languages.filter(function (l) {

	        return newLanguages.indexOf(l) == -1;
	      }).forEach(function (l) {

	        ['title', 'description', 'freeText', 'tags', 'conditions'].forEach(function (field) {

	          delete event[field][l];
	        });

	        currentErrors = currentErrors.map(function (e) {

	          if (typeof e.message !== 'string' && e.message[l]) {

	            delete e.message[l];
	          }

	          return e;
	        }).filter(function (e) {

	          return typeof e.message == 'string' || utils.size(e.message);
	        });
	      });
	    }

	    languages = newLanguages;

	    validator.updateLanguages(languages);

	    eh.trigger(params.events.languageChange, languages);
	  };

	  init();
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var utils = __webpack_require__(2);

	module.exports = function (params) {

	  params = utils.extend({

	    labels: {
	      title: 'Title',
	      description: 'Description',
	      address: 'Address',
	      location: 'Location',
	      noLocation: 'No location is defined',
	      placename: 'The name of the place',
	      tags: 'The tags',
	      freeText: 'The Free Text field',
	      empty: '%noun% cannot be empty',
	      max: '%noun% cannot exceed %max% characters',
	      timings: 'Timings',
	      noDates: 'There must be at least one date for each location'
	    },

	    title: { max: 140 },
	    description: { max: 200 },
	    tags: { max: 255 },
	    freeText: { max: 10000 },
	    placename: { max: 100 },
	    address: { max: 255 },
	    conditions: { max: 255 }

	  }, params);

	  var langs,
	      updateLanguages = function updateLanguages(languages) {

	    langs = languages;
	  },
	      process = function process(field, value) {

	    _validators[field](value);
	  },
	      processFull = function processFull(event) {

	    var errors = [];

	    // if some fields are missing in any of the languages, set them to empty
	    /*utils.forEach(['title', 'description', 'tags', 'freeText', 'conditions' ], function(field) {
	      if (typeof event[field] == 'undefined') event[field] = {};
	    });*/

	    /*utils.forEach(langs, function(lang) {
	       try { process('title', event['title'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
	      try { process('description', event['description'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
	      try { process('tags', event['tags'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
	      try { process('freeText', event['freeText'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
	      try { process('conditions', event['conditions'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
	     });*/

	    if (event.location) {

	      try {
	        process('placename', event.location.name);
	      } catch (e) {
	        if (!contains(errors, e)) errors.push(e);
	      }
	      try {
	        process('address', event.location.address);
	      } catch (e) {
	        if (!contains(errors, e)) errors.push(e);
	      }
	    } else {

	      errors.push({
	        field: 'location',
	        label: params.labels.location,
	        message: params.labels.noLocation
	      });
	    }

	    try {
	      process('timings', event.timings);
	    } catch (e) {
	      if (!contains(errors, e)) errors.push(e);
	    }

	    return errors;
	  },
	      _validators = {

	    location: function location(value) {},

	    title: function title(value) {

	      _shouldNotBeEmpty('title', value);

	      _maxLength('title', value);
	    },

	    description: function description(value) {

	      _shouldNotBeEmpty('description', value);

	      _maxLength('description', value);
	    },

	    tags: function tags(value) {

	      _maxLength('tags', value);
	    },

	    conditions: function conditions(value) {

	      _maxLength('conditions', value);
	    },

	    freeText: function freeText(value) {

	      _maxLength('freeText', value);
	    },

	    placename: function placename(value) {

	      if (typeof value !== 'string') value = '';

	      _shouldNotBeEmpty('placename', value);

	      _maxLength('placename', value);
	    },

	    address: function address(value) {

	      if (typeof value !== 'string') value = '';

	      _shouldNotBeEmpty('address', value);

	      _maxLength('address', value);
	    },

	    timings: function timings(_timings) {

	      if ((typeof _timings === 'undefined' ? 'undefined' : (0, _typeof3.default)(_timings)) != 'object') _timings = [];

	      if (!_timings.length) {

	        throw {
	          field: 'timings',
	          label: params.labels.timings,
	          message: params.labels.noDates
	        };
	      }
	    }

	  },
	      _maxLength = function _maxLength(field, value) {

	    if (typeof value == 'string' && value.length > params[field].max) {

	      throw {
	        field: field,
	        label: params.labels[field],
	        message: params.labels.max.replace('%max%', params[field].max).replace('%noun%', params.labels[field])
	      };
	    }
	  },
	      _shouldNotBeEmpty = function _shouldNotBeEmpty(field, value) {

	    if (typeof value == 'undefined' || !value.length) {

	      throw {
	        field: field,
	        label: params.labels[field],
	        message: params.labels.empty.replace('%noun%', params.labels[field])
	      };
	    }
	  };

	  return {
	    process: process,
	    processFull: processFull,
	    updateLanguages: updateLanguages
	  };
	};

	function contains(arr, i) {

	  return arr.indexOf(i) !== -1;
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2),
	    rUtils = __webpack_require__(3),
	    du = __webpack_require__(4),
	    remote = __webpack_require__(55),
	    EJS = __webpack_require__(56);

	module.exports = function (params) {

	  params = utils.extend({
	    ajax: false,
	    timeout: 5000,
	    beforeNext: false, // in case submission is ajax, this callback can be called before the next form is loaded
	    canvas: '.js_form_canvas_below',
	    template: '<div class="event-errors js_errors display-none"><p><%= hasErrors %></p><ul></ul></div><div class="js_actions submit-actions"></div>',
	    allowDraft: false,
	    classes: {
	      main: 'submit cform',
	      error: 'err',
	      lightboxFrame: 'lightbox-frame wsq',
	      lightboxCanvas: 'lightbox-canvas',
	      lightboxButtons: 'lightbox-buttons',
	      create: 'green',
	      update: 'green',
	      remove: 'red'
	    },
	    selectors: {
	      actions: '.js_actions',
	      errors: '.js_errors'
	    },
	    create: false,
	    createdraft: false,
	    update: false,
	    publish: false,
	    remove: false,
	    labels: {
	      create: 'Publish',
	      createdraft: 'Create without publishing',
	      update: 'Update',
	      publish: 'Publish',
	      remove: 'Remove',
	      removeMessage: 'Are you sure you want to delete this event?',
	      removeYes: 'Yes',
	      removeNo: 'Cancel',
	      hasErrors: 'Some fields need to be looked at before the form can be submitted'
	    },
	    events: {
	      uidfetch: 'euidfetch',
	      validate: 'evalidate',
	      fetchEncoded: 'efetchencoded',
	      heightChange: 'heightchange',
	      complete: 'formcomplete',
	      clear: 'eventclear',
	      submit: 'formsubmit'
	    }
	  }, params);

	  var elem,
	      eh = rUtils.eh,
	      uid = false,
	      draft = true,
	      run = function run() {

	    _createElement();

	    eh.trigger(params.events.uidfetch, function (data) {

	      uid = data.uid;
	      draft = data.draft;

	      if (!uid) {
	        // event is not created
	        _addButton('create');
	        if (params.allowDraft && params.createdraft) _addButton('createdraft');
	      } else {

	        _addButton('update');
	        if (draft && params.allowDraft && params.publish) _addButton('publish');
	      }
	    });
	  },
	      _addButton = function _addButton(name) {

	    var button = document.createElement('button');

	    button.innerHTML = params.labels[name];

	    if (params.classes[name]) button.className = params.classes[name];

	    du.addEvent(button, 'click', function (e) {

	      du.preventDefault(e);

	      _process[name](function (encodedEvent) {

	        var url = decodeURIComponent(params[name]).replace('{uid}', uid);

	        if (encodedEvent) {

	          _post(url, encodedEvent);
	        } else {

	          window.location.href = url;
	        }
	      });
	    });

	    du.el(elem, params.selectors.actions).appendChild(button);
	  },
	      _post = function _post(url, encodedEvent) {

	    if (!params.ajax) {

	      var form = document.createElement('form');
	      form.setAttribute('method', 'post');
	      form.setAttribute('action', url);

	      var field = document.createElement('input');
	      field.setAttribute('name', 'event');
	      field.value = encodedEvent;

	      form.appendChild(field);

	      form.style.display = 'none'; //IE8
	      du.el('body').appendChild(form); //IE8

	      form.submit();
	    } else {

	      eh.trigger(params.events.submit);

	      // maybe handover to the form controller here (taking err and response)

	      remote.postXmlHttp(url, { data: { event: encodedEvent }, timeout: params.timeout }, function (responseType, data) {

	        if (responseType !== 'success') throw 'submission response error';

	        if (data.next || data.redirect) {

	          _clear();

	          eh.trigger(params.events.complete, data);
	        } else if (data.partial) {

	          _overwrite(data.partial);
	        }
	      });
	    }
	  },
	      _overwrite = function _overwrite(newContent) {

	    _clear();

	    du.el('body').innerHTML = newContent;
	  },
	      _clear = function _clear() {

	    var child;

	    while (child = childObject(du.el('body'))) {

	      du.el('body').removeChild(child);
	    }

	    eh.trigger(params.events.clear);
	  },
	      _process = {
	    create: function create(callback) {
	      _checkValidation(callback, true);
	    },
	    createdraft: function createdraft(callback) {
	      _checkValidation(callback, true);
	    },
	    update: function update(callback) {
	      _checkValidation(callback, true);
	    },
	    publish: function publish(callback) {
	      _checkValidation(callback, true);
	    },
	    remove: function remove(callback) {
	      lightbox({
	        classes: {
	          frame: params.classes.lightboxFrame,
	          canvas: params.classes.lightboxCanvas,
	          buttonBox: params.classes.lightboxButtons
	        },
	        message: params.labels.removeMessage,
	        buttons: {
	          ok: { label: params.labels.removeYes, onClick: callback },
	          cancel: { label: params.labels.removeNo }
	        }
	      });
	    }
	  },
	      _checkValidation = function _checkValidation(_onSuccess, postEvent) {

	    eh.trigger(params.events.validate, { onChange: _displayErrors, onSuccess: function onSuccess() {

	        if (postEvent) {

	          eh.trigger(params.events.fetchEncoded, function (encodedEvent) {

	            _onSuccess(encodedEvent);
	          });
	        } else {
	          _onSuccess();
	        }
	      } });
	  },
	      _displayErrors = function _displayErrors(success, errors) {

	    var errorElem = du.el(elem, params.selectors.errors);

	    if (!errors.length || success) {

	      du.addClass(errorElem, 'display-none');
	    } else {

	      var flattened = [];

	      du.forEach(errors, function (error) {

	        if (typeof error.message !== 'string') {

	          for (var l in error.message) {

	            flattened.push({
	              field: error.field,
	              label: error.label,
	              message: error.message[l],
	              lang: l
	            });
	          }
	        } else {

	          flattened.push(error);
	        }
	      });

	      du.el(errorElem, 'ul').innerHTML = '';

	      du.forEach(flattened, function (error) {

	        var er = document.createElement('li');

	        er.innerHTML = '- <strong>' + error.label + (error.lang ? ' (' + error.lang.toUpperCase() + ')' : '') + '</strong>: ' + error.message;

	        er.className = params.classes.error;

	        du.el(errorElem, 'ul').appendChild(er);
	      });

	      du.removeClass(errorElem, 'display-none');
	    }

	    eh.trigger(params.events.heightChange);
	  },
	      _createElement = function _createElement() {

	    elem = document.createElement('div');

	    elem.className = params.classes.main;

	    elem.innerHTML = new EJS({ text: params.template }).render(params.labels);

	    du.el(params.canvas).appendChild(elem);
	  };

	  run();
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// this guy does not include the getStack method
	module.exports = {
	  get: function get(url, settings, callback, ajax) {
	    if (ajax === undefined) ajax = false;

	    if (ajax) {
	      this.getXmlHttp(url, settings, callback);
	    } else {
	      this.getJsonp(url, settings, callback);
	    }
	  },
	  postXmlHttp: function postXmlHttp(url, settings, callback) {

	    if (settings.form) settings.data = this.serialize(settings.form);

	    this.xmlHttp(url, settings, callback, "POST");
	  },
	  getXmlHttp: function getXmlHttp(url, settings, callback) {

	    this.xmlHttp(url, settings, callback, "GET");
	  },

	  xmlHttp: function xmlHttp(url, settings, callback, type) {

	    var self = this;

	    if (typeof settings == 'function') {
	      callback = settings;
	      settings = {};
	    }

	    var retries = 0;

	    if (settings.retries) retries = settings.retries;
	    if (!settings.timeout) settings.timeout = 2000;
	    if (!settings.name) settings.name = url;

	    var finished = false;

	    if (settings.logger) settings.logger.log('remote.getXmlHttp - preparing get for item ' + settings.name);

	    var sentUrl = type == "GET" ? this.appendToUrl(url, settings.data) : url;

	    var onSuccess = function onSuccess(data) {

	      if (finished) return;

	      finished = true;

	      if (settings.logger) settings.logger.log('remote.getXmlHttp - response received for item ' + settings.name);

	      callback('success', data);
	    };

	    var onTimeout = function onTimeout() {

	      if (finished) return;

	      if (retries) {

	        if (settings.logger) settings.logger.log('remote.getXmlHttp - timeout hit, retrying for item ' + settings.name);

	        sendRequest();

	        retries--;
	      } else {

	        finished = true;

	        if (settings.logger) settings.logger.log('remote.getXmlHttp - timeout hit, no retry for item ' + settings.name);

	        callback('timeout');
	      }
	    };

	    // this will call the timeout if is hit, but will call callback even if it comes after
	    var sendRequest = function sendRequest() {

	      var timer = setTimeout(function () {

	        onTimeout();
	      }, settings.timeout);

	      var xhr = new XMLHttpRequest(),
	          response;

	      xhr.onreadystatechange = function () {

	        if (xhr.readyState == 4) if (xhr.status == 200) {

	          clearTimeout(timer);

	          if (xhr.responseText.substring(0, 1) == '(') {
	            response = xhr.responseText.substring(1).substring(0, xhr.responseText.length - 2);
	          } else {
	            response = xhr.responseText;
	          }

	          if (settings.raw) return onSuccess(response);

	          onSuccess(JSON.parse(response));
	        }
	      };

	      xhr.open(type, sentUrl, true);
	      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	      xhr.setRequestHeader("Content-Type", type == "POST" ? "application/x-www-form-urlencoded" : "text/plain;charset=UTF-8");

	      if (type == "GET") {

	        xhr.send();
	      } else {

	        var body = settings.data;

	        if (typeof body !== 'string') body = self.appendToUrl('', settings.data).substr(1);

	        xhr.send(body);
	      }
	    };

	    sendRequest(onSuccess, onTimeout);
	  },

	  getJsonp: function getJsonp(url, settings, callback) {

	    var timer,
	        timeout = settings.timeout ? settings.timeout : 2000,
	        retries = settings.retries ? settings.retries : 0,
	        sentUrl = this.appendToUrl(url, settings.data),
	        self = this,
	        callbackParamName = settings.callbackParamName ? settings.callbackParamName : 'callback';

	    var handleResponse = function handleResponse(data) {
	      clearTimeout(timer);
	      callback('success', data);
	    };

	    var handleTimeout = function handleTimeout() {
	      if (!window[settings.data.callback] || !retries) return callback('timeout');
	      sendQuery();
	      retries--;
	    };

	    var sendQuery = function sendQuery() {

	      var callbackName,
	          callbackParam = {},
	          script = document.createElement('script'),
	          urlCbNameIndex = sentUrl.indexOf(callbackParamName + '=');

	      script.setAttribute('type', 'text/javascript');

	      if (urlCbNameIndex !== -1) {

	        callbackName = sentUrl.substr(urlCbNameIndex + callbackParamName.length + 1);

	        script.src = sentUrl;
	      } else {

	        callbackName = 'jsonpCb' + Math.ceil(Math.random() * 100000);

	        callbackParam[callbackParamName] = callbackName;

	        script.src = self.appendToUrl(sentUrl, callbackParam);
	      }

	      window[callbackName] = handleResponse;

	      document.getElementsByTagName('head')[0].appendChild(script);
	    };

	    sendQuery();
	  },

	  appendToUrl: function appendToUrl(url, data) {

	    var isArray;

	    if (typeof data != 'undefined') {

	      if (url.indexOf('?') == -1) {
	        url = url + '?';
	      } else {
	        url = url + '&';
	      }

	      for (var name in data) {

	        if ((0, _typeof3.default)(data[name]) == 'object') {

	          isArray = Object.prototype.toString.call(data[name]) === '[object Array]';

	          for (var index in data[name]) {
	            url = url + name + '[' + (isArray ? '' : index) + ']=' + encodeURIComponent(data[name][index]) + '&';
	          }
	        } else {

	          url = url + name + '=' + encodeURIComponent(data[name]) + '&';
	        }
	      }

	      if (url.substr(url.length - 1, 1) == '&') url = url.substr(0, url.length - 1);
	    }

	    return url;
	  },

	  collect: function collect(a, f) {
	    var n = [];
	    for (var i = 0; i < a.length; i++) {
	      var v = f(a[i]);
	      if (v != null) n.push(v);
	    }
	    return n;
	  },

	  serialize: function serialize(f) {
	    function g(n) {
	      return f.getElementsByTagName(n);
	    };
	    var nv = function nv(e) {
	      if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
	    };
	    var i = this.collect(g('input'), function (i) {
	      if (i.type != 'radio' && i.type != 'checkbox' || i.checked) return nv(i);
	    });
	    var s = this.collect(g('select'), nv);
	    var t = this.collect(g('textarea'), nv);
	    return i.concat(s).concat(t).join('&');
	  }
	};

/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';

	var rsplit = function rsplit(string, regex) {
	  var result = regex.exec(string),
	      retArr = new Array(),
	      first_idx,
	      last_idx,
	      first_bit;
	  while (result != null) {
	    first_idx = result.index;last_idx = regex.lastIndex;
	    if (first_idx != 0) {
	      first_bit = string.substring(0, first_idx);
	      retArr.push(string.substring(0, first_idx));
	      string = string.slice(first_idx);
	    }
	    retArr.push(result[0]);
	    string = string.slice(result[0].length);
	    result = regex.exec(string);
	  }
	  if (!string == '') {
	    retArr.push(string);
	  }
	  return retArr;
	},
	    chop = function chop(string) {
	  return string.substr(0, string.length - 1);
	},
	    extend = function extend(d, s) {
	  for (var n in s) {
	    if (s.hasOwnProperty(n)) d[n] = s[n];
	  }
	},
	    EJS = function EJS(options) {
	  options = typeof options == "string" ? { view: options } : options;
	  this.set_options(options);
	  if (options.precompiled) {
	    this.template = {};
	    this.template.process = options.precompiled;
	    EJS.update(this.name, this);
	    return;
	  }
	  if (options.element) {
	    if (typeof options.element == 'string') {
	      var name = options.element;
	      options.element = document.getElementById(options.element);
	      if (options.element == null) throw name + 'does not exist!';
	    }
	    if (options.element.value) {
	      this.text = options.element.value;
	    } else {
	      this.text = options.element.innerHTML;
	    }
	    this.name = options.element.id;
	    this.type = '[';
	  } else if (options.url) {
	    options.url = EJS.endExt(options.url, this.extMatch);
	    this.name = this.name ? this.name : options.url;
	    var url = options.url;
	    //options.view = options.absolute_url || options.view || options.;
	    var template = EJS.get(this.name /*url*/, this.cache);
	    if (template) return template;
	    if (template == EJS.INVALID_PATH) return null;
	    try {
	      this.text = EJS.request(url + (this.cache ? '' : '?' + Math.random()));
	    } catch (e) {}

	    if (this.text == null) {
	      throw { type: 'EJS', message: 'There is no template at ' + url };
	    }
	    //this.name = url;
	  }
	  var template = new EJS.Compiler(this.text, this.type);

	  template.compile(options, this.name);

	  EJS.update(this.name, this);
	  this.template = template;
	};
	/* @Prototype*/
	EJS.prototype = {
	  /**
	   * Renders an object with extra view helpers attached to the view.
	   * @param {Object} object data to be rendered
	   * @param {Object} extra_helpers an object with additonal view helpers
	   * @return {String} returns the result of the string
	   */
	  render: function render(object, extra_helpers) {
	    object = object || {};
	    this._extra_helpers = extra_helpers;
	    var v = new EJS.Helpers(object, extra_helpers || {});
	    return this.template.process.call(object, object, v);
	  },
	  update: function update(element, options) {
	    if (typeof element == 'string') {
	      element = document.getElementById(element);
	    }
	    if (options == null) {
	      _template = this;
	      return function (object) {
	        EJS.prototype.update.call(_template, element, object);
	      };
	    }
	    if (typeof options == 'string') {
	      params = {};
	      params.url = options;
	      _template = this;
	      params.onComplete = function (request) {
	        var object = eval(request.responseText);
	        EJS.prototype.update.call(_template, element, object);
	      };
	      EJS.ajax_request(params);
	    } else {
	      element.innerHTML = this.render(options);
	    }
	  },
	  out: function out() {
	    return this.template.out;
	  },
	  /**
	   * Sets options on this view to be rendered with.
	   * @param {Object} options
	   */
	  set_options: function set_options(options) {
	    this.type = options.type || EJS.type;
	    this.cache = options.cache != null ? options.cache : EJS.cache;
	    this.text = options.text || null;
	    this.name = options.name || null;
	    this.ext = options.ext || EJS.ext;
	    this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
	  }
	};
	EJS.endExt = function (path, match) {
	  if (!path) return null;
	  match.lastIndex = 0;
	  return path + (match.test(path) ? '' : this.ext);
	};

	/* @Static*/
	EJS.Scanner = function (source, left, right) {

	  extend(this, { left_delimiter: left + '%',
	    right_delimiter: '%' + right,
	    double_left: left + '%%',
	    double_right: '%%' + right,
	    left_equal: left + '%=',
	    left_comment: left + '%#' });

	  this.SplitRegexp = left == '[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('(' + this.double_left + ')|(%%' + this.double_right + ')|(' + this.left_equal + ')|(' + this.left_comment + ')|(' + this.left_delimiter + ')|(' + this.right_delimiter + '\n)|(' + this.right_delimiter + ')|(\n)');

	  this.source = source;
	  this.stag = null;
	  this.lines = 0;
	};

	EJS.Scanner.to_text = function (input) {
	  if (input == null || input === undefined) return '';
	  if (input instanceof Date) return input.toDateString();
	  if (input.toString) return input.toString();
	  return '';
	};

	EJS.Scanner.prototype = {
	  scan: function scan(block) {
	    scanline = this.scanline;
	    regex = this.SplitRegexp;
	    if (!this.source == '') {
	      var source_split = rsplit(this.source, /\n/);
	      for (var i = 0; i < source_split.length; i++) {
	        var item = source_split[i];
	        this.scanline(item, regex, block);
	      }
	    }
	  },
	  scanline: function scanline(line, regex, block) {
	    this.lines++;
	    var line_split = rsplit(line, regex);
	    for (var i = 0; i < line_split.length; i++) {
	      var token = line_split[i];
	      if (token != null) {
	        try {
	          block(token, this);
	        } catch (e) {
	          throw { type: 'EJS.Scanner', line: this.lines };
	        }
	      }
	    }
	  }
	};

	EJS.Buffer = function (pre_cmd, post_cmd) {
	  this.line = new Array();
	  this.script = "";
	  this.pre_cmd = pre_cmd;
	  this.post_cmd = post_cmd;
	  for (var i = 0; i < this.pre_cmd.length; i++) {
	    this.push(pre_cmd[i]);
	  }
	};
	EJS.Buffer.prototype = {

	  push: function push(cmd) {
	    this.line.push(cmd);
	  },

	  cr: function cr() {
	    this.script = this.script + this.line.join('; ');
	    this.line = new Array();
	    this.script = this.script + "\n";
	  },

	  close: function close() {
	    if (this.line.length > 0) {
	      for (var i = 0; i < this.post_cmd.length; i++) {
	        this.push(pre_cmd[i]);
	      }
	      this.script = this.script + this.line.join('; ');
	      line = null;
	    }
	  }

	};

	EJS.Compiler = function (source, left) {
	  this.pre_cmd = ['var ___ViewO = [];'];
	  this.post_cmd = new Array();
	  this.source = ' ';
	  if (source != null) {
	    if (typeof source == 'string') {
	      source = source.replace(/\r\n/g, "\n");
	      source = source.replace(/\r/g, "\n");
	      this.source = source;
	    } else if (source.innerHTML) {
	      this.source = source.innerHTML;
	    }
	    if (typeof this.source != 'string') {
	      this.source = "";
	    }
	  }
	  left = left || '<';
	  var right = '>';
	  switch (left) {
	    case '[':
	      right = ']';
	      break;
	    case '<':
	      break;
	    default:
	      throw left + ' is not a supported deliminator';
	      break;
	  }
	  this.scanner = new EJS.Scanner(this.source, left, right);
	  this.out = '';
	};
	EJS.Compiler.prototype = {
	  compile: function compile(options, name) {
	    options = options || {};
	    this.out = '';
	    var put_cmd = "___ViewO.push(";
	    var insert_cmd = put_cmd;
	    var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);
	    var content = '';
	    var clean = function clean(content) {
	      content = content.replace(/\\/g, '\\\\');
	      content = content.replace(/\n/g, '\\n');
	      content = content.replace(/"/g, '\\"');
	      return content;
	    };
	    this.scanner.scan(function (token, scanner) {
	      if (scanner.stag == null) {
	        switch (token) {
	          case '\n':
	            content = content + "\n";
	            buff.push(put_cmd + '"' + clean(content) + '");');
	            buff.cr();
	            content = '';
	            break;
	          case scanner.left_delimiter:
	          case scanner.left_equal:
	          case scanner.left_comment:
	            scanner.stag = token;
	            if (content.length > 0) {
	              buff.push(put_cmd + '"' + clean(content) + '")');
	            }
	            content = '';
	            break;
	          case scanner.double_left:
	            content = content + scanner.left_delimiter;
	            break;
	          default:
	            content = content + token;
	            break;
	        }
	      } else {
	        switch (token) {
	          case scanner.right_delimiter:
	            switch (scanner.stag) {
	              case scanner.left_delimiter:
	                if (content[content.length - 1] == '\n') {
	                  content = chop(content);
	                  buff.push(content);
	                  buff.cr();
	                } else {
	                  buff.push(content);
	                }
	                break;
	              case scanner.left_equal:
	                buff.push(insert_cmd + "(EJS.Scanner.to_text(" + content + ")))");
	                break;
	            }
	            scanner.stag = null;
	            content = '';
	            break;
	          case scanner.double_right:
	            content = content + scanner.right_delimiter;
	            break;
	          default:
	            content = content + token;
	            break;
	        }
	      }
	    });
	    if (content.length > 0) {
	      // Chould be content.dump in Ruby
	      buff.push(put_cmd + '"' + clean(content) + '")');
	    }
	    buff.close();
	    this.out = buff.script + ";";
	    var to_be_evaled = '/*' + name + '*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {' + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";

	    try {
	      eval(to_be_evaled);
	    } catch (e) {
	      if (typeof JSLINT != 'undefined') {
	        JSLINT(this.out);
	        for (var i = 0; i < JSLINT.errors.length; i++) {
	          var error = JSLINT.errors[i];
	          if (error.reason != "Unnecessary semicolon.") {
	            error.line++;
	            var e = new Error();
	            e.lineNumber = error.line;
	            e.message = error.reason;
	            if (options.view) e.fileName = options.view;
	            throw e;
	          }
	        }
	      } else {
	        throw e;
	      }
	    }
	  }
	};

	//type, cache, folder
	/**
	 * Sets default options for all views
	 * @param {Object} options Set view with the following options
	 * <table class="options">
	        <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
	        <tr>
	          <td>type</td>
	          <td>'<'</td>
	          <td>type of magic tags.  Options are '&lt;' or '['
	          </td>
	        </tr>
	        <tr>
	          <td>cache</td>
	          <td>true in production mode, false in other modes</td>
	          <td>true to cache template.
	          </td>
	        </tr>
	  </tbody></table>
	 * 
	 */
	EJS.config = function (options) {
	  EJS.cache = options.cache != null ? options.cache : EJS.cache;
	  EJS.type = options.type != null ? options.type : EJS.type;
	  EJS.ext = options.ext != null ? options.ext : EJS.ext;

	  var templates_directory = EJS.templates_directory || {}; //nice and private container
	  EJS.templates_directory = templates_directory;
	  EJS.get = function (path, cache) {
	    if (cache == false) return null;
	    if (templates_directory[path]) return templates_directory[path];
	    return null;
	  };

	  EJS.update = function (path, template) {
	    if (path == null) return;
	    templates_directory[path] = template;
	  };

	  EJS.INVALID_PATH = -1;
	};
	EJS.config({ cache: true, type: '<', ext: '.ejs' });

	/**
	 * @constructor
	 * By adding functions to EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * @init Creates a view helper.  This function is called internally.  You should never call it.
	 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function (data, extras) {
	  this._data = data;
	  this._extras = extras;
	  extend(this, extras);
	};
	/* @prototype*/
	EJS.Helpers.prototype = {
	  /**
	   * Renders a new view.  If data is passed in, uses that to render the view.
	   * @param {Object} options standard options passed to a new view.
	   * @param {optional:Object} data
	   * @return {String}
	   */
	  view: function view(options, data, helpers) {
	    if (!helpers) helpers = this._extras;
	    if (!data) data = this._data;
	    return new EJS(options).render(data, helpers);
	  },
	  /**
	   * For a given value, tries to create a human representation.
	   * @param {Object} input the value being converted.
	   * @param {Object} null_text what text should be present if input == null or undefined, defaults to ''
	   * @return {String} 
	   */
	  to_text: function to_text(input, null_text) {
	    if (input == null || input === undefined) return null_text || '';
	    if (input instanceof Date) return input.toDateString();
	    if (input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
	    return '';
	  }
	};
	EJS.newRequest = function () {
	  var factories = [function () {
	    return new ActiveXObject("Msxml2.XMLHTTP");
	  }, function () {
	    return new XMLHttpRequest();
	  }, function () {
	    return new ActiveXObject("Microsoft.XMLHTTP");
	  }];
	  for (var i = 0; i < factories.length; i++) {
	    try {
	      var request = factories[i]();
	      if (request != null) return request;
	    } catch (e) {
	      continue;
	    }
	  }
	};

	EJS.request = function (path) {
	  var request = new EJS.newRequest();
	  request.open("GET", path, false);

	  try {
	    request.send(null);
	  } catch (e) {
	    return null;
	  }

	  if (request.status == 404 || request.status == 2 || request.status == 0 && request.responseText == '') return null;

	  return request.responseText;
	};
	EJS.ajax_request = function (params) {
	  params.method = params.method ? params.method : 'GET';

	  var request = new EJS.newRequest();
	  request.onreadystatechange = function () {
	    if (request.readyState == 4) {
	      if (request.status == 200) {
	        params.onComplete(request);
	      } else {
	        params.onComplete(request);
	      }
	    }
	  };
	  request.open(params.method, params.url);
	  request.send(null);
	};

	module.exports = EJS;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2),
	    rUtils = __webpack_require__(3),
	    du = __webpack_require__(4),
	    EJS = __webpack_require__(56),
	    handleEventImage = __webpack_require__(58),
	    formConfiguration = __webpack_require__(50);

	module.exports = function (params) {

	  params = utils.extend({
	    language: 'en',
	    configuration: false,
	    canvas: '.js_event_image_canvas',
	    upload: false, // required. resource to upload image
	    remove: false, // required. resource to remove image
	    events: {
	      fetch: 'eimagefetch',
	      send: 'eimagesend',
	      remove: 'eimageremove',
	      heightChange: 'heightchange'
	    },
	    imagePrefix: 'evf',
	    labels: {},
	    path: false // path where uploaded images are accessible
	  }, params);

	  var eh = rUtils.eh,
	      run = function run() {

	    var imageConfiguration = formConfiguration(params.configuration ? params.configuration : {}, { lang: params.language }).field('image');

	    if (imageConfiguration.info) {

	      params.labels.info = imageConfiguration.info[params.language];
	    }

	    eh.trigger(params.events.fetch, function (data) {

	      handleEventImage({
	        labels: params.labels,
	        canvas: params.canvas,
	        upload: params.upload,
	        remove: params.remove,
	        onSuccess: function onSuccess(name) {

	          eh.trigger(params.events.send, { image: name });
	        },
	        onRemove: function onRemove() {

	          eh.trigger(params.events.remove);

	          eh.trigger(params.events.heightChange);
	        },
	        onImageLoad: function onImageLoad() {

	          eh.trigger(params.events.heightChange);
	        },
	        initName: data.image ? data.image : false,
	        path: params.path,
	        prefix: params.imagePrefix
	      });
	    });
	  };

	  run();
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var utils = __webpack_require__(2),
	    rUtils = __webpack_require__(3),
	    du = __webpack_require__(4),
	    EJS = __webpack_require__(56),
	    remote = __webpack_require__(55),
	    Spinner = __webpack_require__(59);

	module.exports = function (params) {

	  params = utils.extend({
	    canvas: false,
	    templates: {
	      main: ['<div class="form-section">', '<h2><%= imageSection %></h2>', '<div class="upload-image">', '<button><%= upload %></button>', '<span class="js_loader loader"></span>', '<span class="js_message info"></span>', '</div>', '<div class="canvas js_image_canvas"></div>', '<div class="js_remove remove-action">', '<a class="button small red" href="#"><%= removeImage %></a>', '<span class="js_remove_loader"></span>', '<span class="js_remove_message info error"></span>', '</div>', '<div class="separator"></div>', '</div>'].join(''),
	      empty: '<div><%= noImage %></div>'
	    },
	    classes: {
	      main: 'event-image',
	      error: 'error',
	      success: 'success',
	      disabled: 'disabled'
	    },
	    selectors: {
	      button: 'button',
	      imageCanvas: '.js_image_canvas',
	      info: '.js_message',
	      loader: '.js_loader',
	      removeLoader: '.js_remove_loader',
	      remove: '.js_remove',
	      removeMessage: '.js_remove_message'
	    },
	    frameName: 'imageframe',
	    labels: {
	      upload: 'load image',
	      info: 'image should be at least 300px wide',
	      error: 'There was a problem while loading the image. Reload the page and try again.',
	      success: 'Image successfully loaded',
	      imageSection: 'Image',
	      removeImage: 'remove image',
	      removeMessage: 'There was a problem regarding the removal of the image. Reload the page and try again.',
	      noImage: 'No image is currently associated with this event.'
	    },
	    spinner: { lines: 7, length: 1, width: 2, radius: 3, corners: 0, rotate: 0 },
	    upload: false,
	    remove: false,
	    callbackName: 'image_upload_result',
	    initName: false,
	    onSuccess: false,
	    onRemove: false,
	    onImageLoad: false,
	    prefix: false,
	    path: false // path where images are found
	  }, params);

	  var elem,
	      removeElem,
	      form,
	      fileInput,
	      spinner,
	      imageLoaded = false,
	      locked = false,
	      run = function run() {

	    _createElem();

	    _createFrame();

	    _createForm();

	    _declareCallback();

	    _displayMessage();

	    if (params.initName) {
	      imageLoaded = true;
	      _displayImage(params.initName);
	    } else {
	      _displayEmptyMessage();
	    }

	    _toggleRemove();
	  },
	      _createForm = function _createForm() {

	    form = document.createElement('form');

	    form.setAttribute('method', 'post');
	    form.setAttribute('enctype', 'multipart/form-data');
	    form.setAttribute('target', params.frameName);
	    form.setAttribute('action', params.upload + (params.upload.indexOf('?') == -1 ? '?' : '&') + 'callback=' + params.callbackName);

	    fileInput = document.createElement('input');
	    fileInput.setAttribute('type', 'file');
	    fileInput.setAttribute('name', 'image');

	    du.addEvent(fileInput, 'change', _fileChosen);

	    du.addEvent(fileInput, 'click', function (e) {
	      if (locked) du.preventDefault(e);
	    });

	    form.appendChild(fileInput);

	    utils.extend(form.style, {
	      width: du.el(elem, params.selectors.button).offsetWidth + 'px',
	      height: du.el(elem, params.selectors.button).offsetHeight + 'px',
	      position: 'absolute',
	      overflow: 'hidden'
	    });

	    utils.extend(fileInput.style, {
	      opacity: 0,
	      filter: 'alpha(opacity=0)',
	      cursor: 'pointer',
	      position: 'absolute',
	      right: 0
	    });

	    du.el(elem, params.selectors.button).insertAdjacentElement('beforebegin', form);
	  },
	      _createFrame = function _createFrame() {

	    var iframe = document.createElement('iframe');

	    iframe.setAttribute('name', params.frameName);

	    iframe.style.display = 'none';

	    elem.appendChild(iframe);
	  },
	      _fileChosen = function _fileChosen(e) {

	    if (!fileInput.value.length) return;

	    form.submit();

	    _lock(params.selectors.loader);
	  },
	      _imageUploaded = function _imageUploaded(res) {

	    if (res.success) {

	      _displayImage(res.name);

	      _displayMessage(res.message, 'success');

	      imageLoaded = true;

	      _toggleRemove();

	      if (params.onSuccess) params.onSuccess(res.name);
	    } else {

	      _displayMessage(res.message, 'error');
	    }

	    _unlock();
	  },
	      _displayImage = function _displayImage(name) {

	    du.el(elem, params.selectors.imageCanvas).innerHTML = '';

	    if (!name) return _displayEmptyMessage();

	    var img = document.createElement('img');

	    img.setAttribute('src', params.path + params.prefix + name + '?' + Math.random());

	    du.addEvent(img, 'load', function () {
	      params.onImageLoad();
	    });

	    du.el(elem, params.selectors.imageCanvas).appendChild(img);
	  },
	      _displayEmptyMessage = function _displayEmptyMessage() {

	    du.el(elem, params.selectors.imageCanvas).innerHTML = new EJS({ text: params.templates.empty }).render(params.labels);
	  },
	      _displayMessage = function _displayMessage(message, type) {

	    if (!message) if (type == 'error') message = params.labels.error;else if (type == 'success') message = params.labels.success;else message = params.labels.info;

	    var infoElem = du.el(elem, params.selectors.info);

	    du.removeClass(infoElem, params.classes.error);
	    du.removeClass(infoElem, params.classes.success);

	    if (type == 'error') du.addClass(infoElem, params.classes.error);else if (type == 'success') du.addClass(infoElem, params.classes.success);

	    infoElem.innerHTML = message;
	  },
	      _toggleRemove = function _toggleRemove() {

	    if (!removeElem) {

	      removeElem = du.el(elem, params.selectors.remove);

	      du.addEvent(du.el(removeElem, 'a'), 'click', function (e) {

	        du.preventDefault(e);

	        if (locked) return;

	        _lock(params.selectors.removeLoader);

	        remote.get(params.remove, { timeout: 10000 }, function (success, data) {

	          _unlock();

	          if (!success) return;

	          if (!data.success) {

	            du.el(elem, params.selectors.removeMessage).innerHTML = data.message ? data.message : params.labels.removeError;

	            return;
	          }

	          imageLoaded = false;

	          if (params.onRemove) params.onRemove();

	          _displayImage(false);

	          _toggleRemove();
	        }, true);
	      });
	    }

	    du.el(elem, params.selectors.removeMessage).innerHTML = '';

	    removeElem.style.display = imageLoaded ? 'block' : 'none';
	  },
	      _declareCallback = function _declareCallback() {

	    window[params.callbackName] = function (response) {
	      _imageUploaded(response);
	    };
	  },
	      _lock = function _lock(selector) {

	    locked = true;

	    du.el(elem, params.selectors.button).setAttribute('disabled', 'disabled');

	    du.addClass(du.el(elem, params.selectors.remove), params.classes.disabled);

	    if (!spinner) spinner = new Spinner(params.spinner);

	    spinner.spin();

	    du.el(elem, selector).appendChild(spinner.el);
	  },
	      _unlock = function _unlock() {

	    locked = false;

	    du.el(elem, params.selectors.button).removeAttribute('disabled');

	    du.removeClass(du.el(elem, params.selectors.remove), params.classes.disabled);

	    spinner.stop();
	  },
	      _fireEvent = function _fireEvent(elem, types) {

	    if (elem === null || elem === undefined) return;
	    if (typeof types == 'string') types = [types];
	    du.forEach(types, function (type) {
	      if ("fireEvent" in elem) {
	        elem.fireEvent('on' + type);
	      } else {
	        var evt = document.createEvent("HTMLEvents");
	        evt.initEvent(type, false, true);
	        elem.dispatchEvent(evt);
	      }
	    });
	  },
	      _createElem = function _createElem() {

	    elem = document.createElement('div');
	    elem.className = params.classes.main;

	    elem.innerHTML = new EJS({ text: params.templates.main }).render(params.labels);

	    du.el(params.canvas).appendChild(elem);
	  };

	  run();
	};

/***/ },
/* 59 */
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