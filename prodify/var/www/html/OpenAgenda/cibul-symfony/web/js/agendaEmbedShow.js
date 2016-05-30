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

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var controllers = __webpack_require__(2),
	    embedded = __webpack_require__(12),
	    domUtils = __webpack_require__(16),
	    facebookEmbedded = __webpack_require__(18),
	    debug = __webpack_require__(3),
	    log,
	    activeFilters = __webpack_require__(19),
	    list = __webpack_require__(33),
	    cn = __webpack_require__(4),
	    handler,
	    favorites = __webpack_require__(38),
	    Masonry = __webpack_require__(43),
	    msnry = false,
	    defaults = {
	  selectors: {
	    listContent: '.js_list_content',
	    loadNext: '.js_load_next',
	    searchLinks: '.js_use_search' // add search params to links with this class
	  },
	  cascading: false
	},
	    params;

	window.asap(function (options) {

	  params = cn.extend({}, defaults, options);

	  log = debug('embedded agenda show');

	  log('initing with options %s', (0, _stringify2.default)(params));

	  if (params.facebook) {

	    handler = _initFacebook(params, list);
	  } else {

	    handler = _initEmbedded(params);
	  }

	  embedded.copyToSearch(params.selectors.searchLinks);

	  if (params.cascading) {

	    log('cascading mode on');

	    domUtils.whenReady(function () {

	      msnry = _masonry(params.selectors.listContent);
	    });
	  }

	  favorites.init({
	    agendaUid: parseInt(typeof options.uid == 'string' ? options.uid.split('/')[0] : options.uid, 10),
	    res: options.res,
	    bottomBar: false
	  });

	  list.init({
	    total: params.total,
	    perPage: params.perPage,
	    autoLoadNext: false,
	    onLastPage: _hideTrigger(params.selectors.loadNext)
	  });

	  favorites.sweep();

	  _handleLoadNextElements(params.selectors.loadNext);
	});

	function _initFacebook(params, list) {

	  var handler = facebookEmbedded(params);

	  // reset list with controller values when there is a change
	  window.cibul.getController(params.uid).setProxy({
	    update: function update(newValues) {

	      log('change in iframe %s', (0, _stringify2.default)(newValues));

	      for (var i in newValues) {

	        if (newValues[i] === null) delete newValues[i];
	      }

	      window.location.href = domUtils.loadInLocation({
	        search: newValues,
	        fb: 1
	      });
	    }
	  });

	  return handler;
	}

	function _initEmbedded(params) {

	  var handler = embedded({
	    onReceive: function onReceive(message) {

	      if (message.bottom) {

	        _loadNext();
	      }
	    }
	  }, params);

	  // pass on frame search/query changes to parent window
	  window.cibul.getController(params.uid).setProxy({
	    update: function update(newValues) {

	      log('change in iframe %s', (0, _stringify2.default)(newValues));

	      handler.send({ update: newValues });
	    }
	  });

	  //do not manipulate href from inside frame
	  window.cibul.getController(params.uid).disableSyncHref();

	  window.cibul.getController(params.uid).disablePassedAutoLoad();

	  return handler;
	}

	function _handleLoadNextElements(selector) {

	  cn.forEach(cn.els(selector), function (elem) {

	    cn.addEvent(elem, 'click', function (e) {

	      cn.preventDefault(e);

	      _loadNext();
	    });
	  });
	}

	function _loadNext() {

	  if (!handler) return;

	  list.loadNext(function (err) {

	    if (msnry) msnry.reset();

	    handler.contentChange();

	    favorites.sweep();
	  });
	}

	function _hideTrigger(selector) {

	  return function () {

	    cn.forEach(cn.els(selector), function (elem) {

	      elem.style.display = 'none';
	    });
	  };
	}

	function _masonry(listSelector) {

	  var m = _start();

	  return {
	    reset: function reset() {

	      m.destroy();

	      _start();
	    },
	    start: _start
	  };

	  function _start() {

	    return new Masonry(listSelector);
	  }
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"core-js/library/fn/json/stringify\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	"user strict";

	/**
	 * handle widget registration to page controllers
	 */

	if (!window.cibul) {

	  var debug = __webpack_require__(3),
	      cn = __webpack_require__(4),
	      controller = __webpack_require__(6);

	  if (window.env == 'tpl') debug.enable('*');

	  var log = debug('controllers'),
	      controllers = {},
	      getCallbacks = {};

	  window.cibul = {};

	  /**
	   * called by a widget to register itself to the right controller
	   */

	  window.cibul.registerWidget = function (options, cb) {

	    var widgetParams = cn.extend({
	      name: false, // required. name of the widget
	      uid: false // required. the uid of the agenda/embed
	    }, options);

	    log('widget register request received from %s', widgetParams.name);

	    // create controller if not existing

	    if (typeof controllers[widgetParams.uid] == 'undefined') {

	      controllers[widgetParams.uid] = controller(widgetParams.uid);
	    }

	    if (typeof getCallbacks[widgetParams.name] !== 'undefined') {

	      log('calling getWidget callback');

	      getCallbacks[widgetParams.name](widgetParams);
	    }

	    // register widget with right controller

	    return controllers[widgetParams.uid].register(widgetParams);
	  };

	  /**
	   * called for getting a handle on controller
	   */

	  window.cibul.getController = function (uid) {

	    if (!uid) {

	      throw 'agenda uid is missing';
	    }

	    if (!controllers[uid]) {

	      log('getController: controller not existing > creating: %s', uid);

	      controllers[uid] = controller(uid);
	    }

	    return controllers[uid];
	  };

	  /**
	   * for admin only. get widget to fetch config data
	   */

	  exports.getWidget = function (name, cb) {

	    log('attempting to get widget %s', name);

	    if (!cn.size(controllers)) {

	      getCallbacks[name] = cb;

	      return;
	    }

	    for (var c in controllers) {
	      break;
	    }return controllers[c].getWidget(name);
	  };
	}

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.addZero = function (number) {
	  return (parseInt(number, 10) < 10 ? '0' : '') + number;
	};

	/* Object.size */
	exports.size = function (obj) {
	  var size = 0,
	      key;
	  for (key in obj) {
	    if (obj.hasOwnProperty(key)) size++;
	  }
	  return size;
	};

	/* extend */
	exports.extend = function () {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
	    }
	  }return arguments[0];
	};

	/*contains*/
	exports.contains = function (a, obj) {
	  var i = a.length;
	  while (i--) {
	    if (a[i] === obj) {
	      return true;
	    }
	  }
	  return false;
	};

	exports.toCamelCase = function toCamelCase(input) {

	  if ((typeof input === 'undefined' ? 'undefined' : (0, _typeof3.default)(input)) == 'object') {

	    var camelCased = {};

	    for (var key in input) {

	      if (!contains(['parse', '_typeCast'], key)) {

	        camelCased[toCamelCase(key)] = input[key];
	      }
	    }

	    return camelCased;
	  }

	  return input.replace(/[-_](.)/g, function (match, group1) {

	    return group1.toUpperCase();
	  });
	};

	exports.isArray = function (obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	};

	exports.removeValueFromArray = function (arr) {
	  var what,
	      a = arguments,
	      L = a.length,
	      ax;
	  while (L > 1 && arr.length) {
	    what = a[--L];
	    while ((ax = arr.indexOf(what)) !== -1) {
	      arr.splice(ax, 1);
	    }
	  }
	  return arr;
	};

	exports.unpack = function (encoded) {
	  return JSON.parse(encoded);
	};

	var hasClass = function hasClass(element, cls) {
	  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	};
	var addClass = function addClass(element, className) {
	  if (!hasClass(element, className)) element.className = element.className + ' ' + className;
	};
	var removeClass = function removeClass(element, cls) {
	  if (hasClass(element, cls)) {
	    var regex = new RegExp(cls, 'g');element.className = element.className.replace(regex, '');
	  }
	};

	exports.hasClass = hasClass;
	exports.addClass = addClass;
	exports.removeClass = removeClass;

	exports.removeEvent = function (elem, types, eventHandle) {
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

	exports.addEvent = function (elem, types, eventHandle) {
	  if (elem == null || elem == undefined) return;
	  if (typeof types == 'string') types = [types];
	  forEach(types, function (type) {
	    if (elem.addEventListener) {
	      elem.addEventListener(type, eventHandle, false);
	    } else if (elem.attachEvent) {
	      elem.attachEvent("on" + type, eventHandle);
	    } else {
	      elem["on" + type] = eventHandle;
	    }
	  });
	};

	exports.preventDefault = function (event) {
	  event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};

	var getElementsByClassName = exports.getElementsByClassName = function (node, classname) {
	  if (typeof node == 'string') {
	    classname = node;
	    node = document;
	  }
	  var a = [];
	  var re = new RegExp('(^| )' + classname + '( |$)');
	  var els = node.getElementsByTagName("*");
	  for (var i = 0, j = els.length; i < j; i++) {
	    if (re.test(els[i].className)) a.push(els[i]);
	  }return a;
	};

	var els = exports.els = function (node, selector) {

	  if (typeof node == 'string') {
	    selector = node;
	    node = document;
	  }

	  var prefix = selector.substr(0, 1);

	  if ('.#,'.indexOf(prefix) !== -1) selector = selector.substr(1);

	  if (prefix == '.') return getElementsByClassName(node, selector);else if (prefix == '#') {
	    var result = node.getElementById(selector);
	    if (result) return [result];else return [];
	  } else return node.getElementsByTagName(selector);
	};

	exports.el = function (node, selector) {

	  var results = els(node, selector);

	  return results.length ? results[0] : null;
	};

	/* previousObject, nextObject, childObject, getChildIndex v0.1 */
	var previousObject = function previousObject(elem) {

	  elem = elem.previousSibling;

	  while (elem && elem.nodeType != 1) {
	    elem = elem.previousSibling;
	  }return elem;
	};

	exports.previousObject = previousObject;

	exports.nextObject = function (elem) {

	  elem = elem.nextSibling;

	  while (elem && elem.nodeType != 1) {
	    elem = elem.nextSibling;
	  }return elem;
	};

	exports.childObject = function (elem, index) {

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
	};

	exports.getChildIndex = function (child) {

	  var i = 0;

	  while ((child = previousObject(child)) !== null) {
	    i++;
	  }return i;
	};

	var forEach = function forEach(array, action) {
	  for (var i = 0; i < array.length; i++) {
	    action(array[i]);
	  }
	};

	exports.forEach = forEach;

	exports.asymDiff = function (a, b) {

	  if (typeof dSuffix != 'string') dSuffix = '';
	  var diff = {};

	  for (var pName in a) {
	    if (typeof b[pName] != 'undefined') {
	      if (b[pName] !== a[pName]) diff[pName] = a[pName];
	    } else {
	      diff[pName] = a[pName];
	    }
	  }

	  return diff;
	};

	exports.arrDiff = function (a, b) {

	  var diff = [];

	  for (var i = 0; i < a.length; i++) {

	    if (b.indexOf(a[i]) == -1) {

	      diff.push(a[i]);
	    }
	  }

	  for (i = 0; i < b.length; i++) {

	    if (a.indexOf(b[i]) == -1) {

	      diff.push(b[i]);
	    }
	  }

	  return diff;
	};

	/* HTMLElement.prototype.insertAdjacentElement (for FF) */
	if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement) {

	  HTMLElement.prototype.insertAdjacentElement = function (where, parsedNode) {
	    switch (where.toLowerCase()) {
	      case 'beforebegin':
	        this.parentNode.insertBefore(parsedNode, this);
	        break;
	      case 'afterbegin':
	        this.insertBefore(parsedNode, this.firstChild);
	        break;
	      case 'beforeend':
	        this.appendChild(parsedNode);
	        break;
	      case 'afterend':
	        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);else this.parentNode.appendChild(parsedNode);
	        break;
	    }
	  };

	  if (!HTMLElement.prototype.insertAdjacentHTML) HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
	    var r = this.ownerDocument.createRange();
	    r.setStartBefore(this);
	    var parsedHTML = r.createContextualFragment(htmlStr);
	    this.insertAdjacentElement(where, parsedHTML);
	  };

	  if (!HTMLElement.prototype.insertAdjacentText) HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
	    var parsedText = document.createTextNode(txtStr);
	    this.insertAdjacentElement(where, parsedText);
	  };
	}

	exports.getScrollOffsets = function (w) {

	  // Use the specified window or the current window if no argument
	  w = w || window;

	  // This works for all browsers except IE versions 8 and before
	  if (typeof w.pageXOffset !== 'undefined') return {
	    x: w.pageXOffset,
	    y: w.pageYOffset
	  };

	  // For IE (or any browser) in Standards mode
	  var d = w.document;
	  if (document.compatMode == "CSS1Compat") {
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
	};

	exports.windowInnerHeight = function (w, d) {

	  if (!w) {
	    w = window;
	    d = document;
	  }

	  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName('body')[0].clientHeight;
	};

	exports.triggerEvent = function (elem, name) {

	  var e;

	  if (document.createEvent) {
	    e = document.createEvent("HTMLEvents");
	    e.initEvent(name, true, true);
	  } else {
	    e = document.createEventObject();
	    e.eventType = name;
	  }

	  e.eventName = name;

	  if (document.createEvent) {
	    elem.dispatchEvent(e);
	  } else {
	    elem.fireEvent("on" + e.eventType, e);
	  }
	};

	exports.isElement = function (o) {
	  return (typeof HTMLElement === 'undefined' ? 'undefined' : (0, _typeof3.default)(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
	  o && (typeof o === 'undefined' ? 'undefined' : (0, _typeof3.default)(o)) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
	};

	// add trim function to IE8
	if (typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function () {
	    return this.replace(/^\s+|\s+$/g, '');
	  };
	}

	exports.removeProperty = function (obj, name) {

	  if (typeof obj.removeProperty !== 'undefined') return obj.removeProperty(name);

	  return obj.removeAttribute(name);
	};

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

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(3),
	    cn = __webpack_require__(4),
	    remote = __webpack_require__(7),
	    filters = __webpack_require__(8),
	    geoLib = __webpack_require__(9),
	    controlDataFetch = __webpack_require__(10),
	    qs = __webpack_require__(11),
	    env = window.env ? window.env : 'prod',
	    defaults = {
	  all: {
	    search: '//openagenda.com/widgets/{uid}/search'
	  },
	  dev: {
	    search: '//d.openagenda.com/widgets/{uid}/search'
	  },
	  test: {
	    search: '//d.openagenda.com/widgets/{uid}/search'
	  },
	  tpl: {
	    search: '//d.openagenda.com/widgets/{uid}/search'
	  }
	},
	    params = cn.extend(defaults.all, defaults[env] ? defaults[env] : {});

	module.exports = function (uid) {

	  var log = debug('controller ' + uid),
	      ctl = false,
	      // full agenda data in js form

	  ready = false,
	      // is server connection established

	  widgets = [],
	      // collection of interfaces to widgets handled by controller

	  sendRequest = false,
	      // callback given by link widget to notify of request params updates

	  ctlRequests = [],
	      // stack of callbacks to call when control data is available

	  currentRequestParams = {},
	      // current agenda request parameters

	  whatUids = false,
	      what,
	      scope,
	      passed,
	      // those are for the same feature ( aggregated search )

	  enabled = false,
	      firstSweepCompleted = false,
	      embedMode = (uid + '').indexOf('/') !== -1,
	      // embedMode is true if widget is for agenda embed

	  proxy = false,
	      syncHref = false,
	      modalTaken = false,
	      passedAutoLoad = true;

	  return function () {

	    log('controller loaded in %s environment', env);

	    log('controller is configured in %s mode', embedMode ? 'embed' : 'agenda');

	    _redirectLegacySearch();

	    controlDataFetch({
	      jsonp: !_isAjax(),
	      uid: (uid + '').split('/')[0],
	      embedUid: embedMode ? (uid + '').split('/')[1] : false
	    }, function (err, data) {

	      if (err || !data) {

	        log('problem while fetching data %s', err);

	        if (!data) {

	          log('not data could be retrieved');
	        }

	        return;
	      }

	      log('successfully fetched control data');

	      ctl = _initControlData(data);

	      syncHref = !!ctl.sh;

	      if (typeof _readHrefQuery().geolocate !== 'undefined') {

	        geoLib(ctl, _readHrefQuery('geolocate'), function (err, cornerParams) {

	          if (err) {

	            _init();
	          } else {

	            _init(cornerParams);
	          }
	        });
	      } else {

	        _init();
	      }
	    });

	    return {
	      register: register,
	      getWidget: getWidget,
	      requestModal: requestModal,
	      releaseModal: releaseModal,
	      update: update,
	      sweep: sweep,
	      getControlData: getControlData,
	      getCurrentQuery: getCurrentQuery,
	      isDifferent: isDifferent,
	      setProxy: setProxy,
	      disableSyncHref: disableSyncHref,
	      disablePassedAutoLoad: disablePassedAutoLoad
	    };
	  }();

	  function _init(initParams) {

	    var change = _initCurrentRequestParams(initParams);

	    _processWidgetCtlRequests(false);

	    ready = true;

	    // hack to allow some widgets to run getControlData callback once all
	    // is declared ready,
	    _processWidgetCtlRequests(true);

	    log('controller will sync with href ? %s', syncHref ? 'yes' : 'no');

	    if (syncHref) {

	      if (change) _forEachWidget('change', currentRequestParams);

	      cn.addEvent(window, 'popstate', _handlePop);
	    }

	    _fetchWhatUids(function () {

	      sweep();
	    });
	  }

	  function _handlePop() {

	    if (!syncHref) return;

	    update(_readHrefQuery('oaq'));
	  }

	  /**
	   * register a widget - run by widget to establish link with controller
	   */

	  function register(options) {

	    var widgetParams = cn.extend({
	      name: false // required. name of the widget
	    }, options);

	    log('registering widget %s', widgetParams.name);

	    widgets.push(widgetParams);

	    if (firstSweepCompleted && widgetParams.include) {

	      setTimeout(function () {

	        _trasverseInclude(widgetParams);

	        if (enabled) {

	          widgetParams.enable(currentRequestParams);
	        }
	      }, 100);
	    } else if (enabled) {

	      widgetParams.enable(currentRequestParams);
	    }

	    return {
	      update: update,
	      getControlData: getControlData,
	      requestModal: requestModal,
	      releaseModal: releaseModal,
	      getCurrentQuery: getCurrentQuery,
	      isDifferent: isDifferent
	    };
	  }

	  function getWidget(name) {

	    var widgetParams = false;

	    cn.forEach(widgets, function (widget) {

	      if (widget.name == name) {

	        widgetParams = widget;
	      }
	    });

	    return widgetParams;
	  }

	  /**
	   * hand over control data when ready.
	   */

	  function getControlData(postReady, cb) {

	    if (!cb) {

	      cb = postReady;

	      postReady = false;
	    }

	    if (ctl) {

	      log('control data available, handing over');

	      cb(ctl);
	    } else {

	      log('control data not yet available, stacking request');

	      ctlRequests.push([postReady, cb]);
	    }
	  }

	  function getCurrentQuery() {

	    return cn.extend({}, currentRequestParams);
	  }

	  function setProxy(p) {

	    proxy = p;
	  }

	  function disableSyncHref() {

	    syncHref = false;
	  }

	  function disablePassedAutoLoad() {

	    passedAutoLoad = false;
	  }

	  /**
	   * controller
	   * 
	   * called by widget when some agenda request parameters were updated
	   */

	  function update(originWidget, updatedParams) {

	    if (arguments.length == 1) {

	      updatedParams = originWidget;

	      originWidget = {};
	    }

	    log('updating with %s', (0, _stringify2.default)(updatedParams));

	    var newParams = _clean(cn.extend({}, currentRequestParams, {
	      uid: null
	    }, updatedParams));

	    if (!isDifferent(newParams)) return;

	    currentRequestParams = newParams;

	    if (!ready) {

	      log('control data not yet received');

	      return;
	    }

	    if (proxy && proxy.update) proxy.update(updatedParams);

	    if (syncHref) {

	      _updateHrefQuery(currentRequestParams);
	    }

	    _forEachWidget('change', currentRequestParams, originWidget);

	    _fetchWhatUids(function () {

	      sweep(originWidget);
	    });
	  }

	  function _fetchWhatUids(cb) {

	    if (what === currentRequestParams.what && scope === currentRequestParams.scope && passed === currentRequestParams.passed) return cb();

	    whatUids = false;

	    what = currentRequestParams.what;

	    scope = currentRequestParams.scope, passed = currentRequestParams.passed;

	    if (!what) return cb();

	    var searchQuery = { what: what };

	    if (scope) searchQuery.scope = scope;

	    if (passed) searchQuery.passed = passed;

	    remote.getJsonp(params.search.replace('{uid}', uid) + '?' + qs.stringify({ oaq: searchQuery }), {
	      data: {},
	      timeout: 10000
	    }, function (responseType, data) {

	      if (responseType == 'success') {

	        whatUids = data;
	      }

	      cb();
	    });
	  }

	  /**
	   * disable all widgets except caller
	   */

	  function requestModal(name, cb) {

	    modalTaken = true;

	    _forEachWidget('disable', name);

	    enabled = false;

	    if (cb) cb();
	  }

	  /**
	   * re-enables all widgets
	   */

	  function releaseModal() {

	    modalTaken = false;

	    _forEachWidget('enable', currentRequestParams);

	    enabled = true;
	  }

	  function _initCurrentRequestParams(overridingParams) {

	    var today = new Date(),
	        hrefParams,
	        change = false;

	    if (typeof overridingParams !== 'undefined') {

	      currentRequestParams = overridingParams;

	      if (syncHref) _updateHrefQuery(currentRequestParams);

	      change = true;

	      return change;
	    }

	    if (syncHref) {

	      hrefParams = _clean(_readHrefQuery('oaq'));

	      if (isDifferent(hrefParams)) {

	        currentRequestParams = hrefParams;

	        change = true;
	      }
	    }

	    if (ctl.lo) {

	      // bit of a transitional hack (2015-03-06) - remove ctl.p in other widgets before anything here
	      ctl.p = today > new Date(ctl.lo.end);
	    }

	    if (ctl.p && passedAutoLoad && typeof currentRequestParams.passed == 'undefined') {

	      change = true;

	      currentRequestParams.passed = 1;

	      if (syncHref) _updateHrefQuery(currentRequestParams);
	    }

	    return change;
	  }

	  function _hasControlData() {

	    return !!ctl;
	  }

	  /**
	   * run method of each widget at the optional exception of...
	   */

	  function _forEachWidget(methodName, methodParams, except) {

	    if (arguments.length == 2 && typeof methodParams == 'string') {

	      except = methodParams;

	      methodParams = {};
	    } else if (arguments.length == 2) {

	      except = false;
	    } else if (arguments.length == 1) {

	      methodParams = {};

	      except = false;
	    }

	    log('running %s for all widgets with %s except for %s', methodName, (0, _stringify2.default)(methodParams), except ? except : 'no one');

	    for (var i = widgets.length - 1; i >= 0; i--) {

	      if (widgets[i].name !== except) {

	        if (widgets[i][methodName]) {

	          widgets[i][methodName](methodParams);
	        } else {

	          log('%s not set for widget "%s"', methodName, widgets[i].name);
	        }
	      }
	    }
	  }

	  function _processWidgetCtlRequests(postReady) {

	    var toProcess = ctlRequests.length;

	    var stackedCallback,
	        restacked = [];

	    // send control data to whoever requested it during registration process
	    while (stackedCallback = ctlRequests.pop()) {

	      if (stackedCallback[0] === postReady) {

	        stackedCallback[1](ctl);
	      } else {

	        restacked.push(stackedCallback);
	      }
	    }

	    ctlRequests = restacked;
	  }

	  function _initControlData(data) {

	    // distribute location data throughout events

	    var locations = {},
	        today = _stringifyDate();

	    cn.forEach(data.l, function (l) {

	      locations[l.u] = { lt: l.lt, lg: l.lg };
	    });

	    data.geolocate = typeof _readHrefQuery().geolocate !== 'undefined';

	    cn.forEach(data.ev, function (e) {

	      if (e.l) {

	        if (typeof locations[e.l] !== 'undefined') {

	          e.lt = locations[e.l].lt;

	          e.lg = locations[e.l].lg;
	        } else {

	          console.log('invalid location for event');
	          console.log(e);
	        }
	      }

	      // append is passed info

	      e.p = true;

	      for (var i = e.d.length - 1; i >= 0; i--) {

	        if (e.d[i] >= today) {

	          e.p = false;

	          break;
	        }
	      };
	    });

	    locations = undefined;

	    return data;
	  }

	  function _isAjax() {

	    if (embedMode && window.env !== 'tpl') {

	      return false;
	    }

	    return true;
	  }

	  /**
	   * uses the control data ( agenda js data ) to determine which
	   * events are included and which are not
	   */

	  function sweep(originWidget) {

	    var includedCount = 0;

	    if (typeof currentRequestParams == 'undefined') currentRequestParams = {};

	    if (!ready) {

	      log('controller not ready, sweep aborted');

	      return;
	    }

	    log('doing sweep with params %s', (0, _stringify2.default)(currentRequestParams));

	    // clear all the widgets!
	    _forEachWidget('clear');

	    _forEachWidget('disable', originWidget);

	    // let clear & disable happen
	    setTimeout(function () {

	      includedCount = _trasverseInclude();

	      enabled = true;
	      firstSweepCompleted = true;

	      log('sweep result %d out of %d', includedCount, cn.size(ctl.ev));

	      // enable all the widgets ( if modal is not taken )
	      if (!modalTaken) {

	        _forEachWidget('enable', currentRequestParams);
	      }
	    }, 10);
	  }

	  function _trasverseInclude(targetWidget) {

	    var counter = 0;

	    // go through each event, determine if should be included
	    // .. in which case include in widgets
	    for (var i in ctl.ev) {

	      if (_applyFilters(ctl.ev[i], currentRequestParams)) {

	        counter++;

	        ctl.ev[i].passed = _isPassed(ctl.ev[i]);

	        _include(ctl.ev[i], currentRequestParams, targetWidget);
	      }
	    }

	    return counter;
	  }

	  /**
	   * have there been any changes in parameters?
	   */

	  function isDifferent(data) {

	    for (var i in currentRequestParams) {

	      if (typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i]) return true;
	    }

	    for (i in data) {

	      if (typeof currentRequestParams[i] == 'undefined') return true;

	      if (data[i] !== currentRequestParams[i]) return true;
	    }

	    return false;
	  }

	  /**
	   * as part of sweep, tell widgets event item passed through filters
	   */

	  function _include(item, p, targetWidget) {

	    if (targetWidget) {

	      targetWidget.include(item, p);
	    } else {

	      for (var i = widgets.length - 1; i >= 0; i--) {

	        if (widgets[i].include) {

	          widgets[i].include(item, p);
	        }
	      }
	    }
	  }

	  function _applyFilters(item, reqParams) {

	    for (var i in filters) {

	      if (!filters[i](item, reqParams, whatUids)) return false;
	    }

	    return true;
	  }

	  function _clean(data) {

	    var cleanData = {},
	        tags;

	    for (var k in data) {

	      if (data[k] !== null) {

	        if (['neLat', 'neLng', 'swLat', 'swLng'].indexOf(k) !== -1) {

	          cleanData[k] = parseFloat(data[k]);
	        } else if (k == 'tags') {

	          if (cn.isArray(data[k]) && data[k].length) {

	            tags = data[k].filter(function (t) {

	              return t.length;
	            });

	            if (tags.length) cleanData[k] = tags;
	          }
	        } else if (k == 'what') {

	          if (data[k].length) {

	            cleanData[k] = data[k];
	          }
	        } else {

	          cleanData[k] = data[k];
	        }
	      }
	    }

	    return cleanData;
	  }

	  function _isPassed(eItem) {

	    var today = _stringifyDate(new Date());

	    for (var i = eItem.d.length - 1; i >= 0; i--) {

	      if (eItem.d[i] >= today) return false;
	    };

	    return true;
	  }

	  function _updateHrefQuery(updatedQuery) {

	    log('attempting to update href query');

	    var href = window.location.href,
	        dashPart = false,
	        query = false,
	        queryPart;

	    if (href.split('#').length > 1) {

	      dashPart = href.split('#')[0];
	    }

	    href = href.split('?')[0];

	    if (typeof window.history == 'undefined' || typeof window.history.pushState == 'undefined') {

	      log('window.history is not available');
	    } else {

	      query = _readHrefQuery();

	      if (cn.size(updatedQuery)) {

	        query.oaq = updatedQuery;
	      } else {

	        delete query.oaq;
	      }

	      if (cn.size(query)) {

	        href = href + '?' + qs.stringify(query);
	      }

	      if (dashPart) {

	        href = href + '#' + dashPart;
	      }

	      if (typeof window.history !== 'undefined' && typeof window.history.pushState !== 'undefined') {

	        window.history.pushState(updatedQuery, null, href);
	      }
	    }
	  }

	  function _readHrefQuery(key) {

	    var query = {},
	        queryParts;

	    try {

	      queryParts = window.location.href.split('#')[0].split('?').slice(1);

	      if (queryParts.length) {

	        query = qs.parse(queryParts[0]);
	      }

	      return key ? query[key] ? query[key] : {} : query;
	    } catch (e) {

	      log('had some trouble reading href query: %s', e);
	    }

	    return {};
	  }

	  function _redirectLegacySearch() {

	    var queryParts = window.location.href.split('#')[0].split('?').slice(1);

	    if (!queryParts.length) return;

	    if (queryParts[0].replace('%5B', '[').replace('%5D', ']').indexOf('search[') !== -1) {

	      window.location.href = window.location.href.replace(/search\[/g, 'oaq[').replace(/search%5B/g, 'oaq%5B');
	    }
	  }

	  function _stringifyDate(d) {

	    if (!d) d = new Date();

	    return [d.getFullYear(), _fZ(d.getMonth() + 1), _fZ(d.getDate())].join('-');
	  }

	  function _fZ(str) {

	    if ((str + '').length == 1) {

	      return '0' + str;
	    }

	    return str;
	  }
	};

/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  what: what,
	  passed: passed,
	  event: event,
	  categories: categories,
	  tags: tags,
	  organizations: organizations,
	  locations: locations,
	  dates: dates
	};

	function what(item, reqParams, whatUids) {

	  if (reqParams.what) {

	    if (!whatUids || whatUids.indexOf(parseInt(item.u, 10)) == -1) {

	      return false;
	    }
	  }

	  return true;
	}

	function passed(item, reqParams) {

	  var today = new Date();

	  today = today.getFullYear() + '-' + _fZ(today.getMonth() + 1) + '-' + _fZ(today.getDate());

	  if (!reqParams.passed && !reqParams.from) {

	    for (var i in item.d) {

	      if (item.d[i] >= today) {

	        return true;
	      }
	    }

	    return false;
	  }

	  return true;
	}

	function event(item, reqParams) {

	  if (reqParams.uid) {

	    return item.u + '' == reqParams.uid + '';
	  };

	  return true;
	}

	function categories(item, reqParams) {

	  if (reqParams.category && item.c !== reqParams.category) return false;

	  return true;
	}

	function tags(item, reqParams) {

	  var reqTags;

	  if (!reqParams.tags) return true;

	  reqTags = typeof reqParams.tags == 'string' ? [reqParams.tags] : reqParams.tags;

	  if (!reqTags.length) return true;

	  if (!item.t) return false;

	  for (var i = reqTags.length - 1; i >= 0; i--) {

	    if (item.t.indexOf(reqTags[i]) == -1) {

	      return false;
	    }
	  }

	  return true;
	}

	function organizations(item, reqParams) {

	  if (reqParams.org && (!item.org || item.org.s !== reqParams.org)) return false;

	  return true;
	}

	function dates(item, reqParams) {

	  if (!reqParams.from) {

	    return true;
	  }

	  var period = [reqParams.from, reqParams.to ? reqParams.to : reqParams.from];

	  for (var i in item.d) {

	    if (item.d[i] >= period[0] && item.d[i] <= period[1]) {

	      return true;
	    }
	  }

	  return false;
	}

	function locations(item, reqParams) {

	  if (reqParams.location) {

	    return parseInt(reqParams.location, 10) == item.l;
	  }

	  // is one of the locations within square... works most places

	  if (reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng) {

	    var ne = [parseFloat(reqParams.neLat), parseFloat(reqParams.neLng)],
	        sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)];

	    if (item.lt <= ne[0] && item.lg <= ne[1] && item.lt >= sw[0] && item.lg >= sw[1]) return true;

	    return false;
	  }

	  return true;
	}

	function _fZ(n) {
	  return (n > 9 ? '' : '0') + n;
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (ctlData, initValues, cb) {

	  var requestTimeout;

	  if (initValues.lat && initValues.lng) return cb(null, [initValues.lat, initValues.lng]);

	  if (!_hasFeature()) return cb('navigator cannot geolocate');

	  if (!initValues.count) initValues.count = 10;

	  initValues.count = Math.min(initValues.count, 50);

	  requestTimeout = setTimeout(function () {
	    cb('user did not respond to geolocate');
	  }, 5000);

	  _requestGeolocation(function (err, coords) {

	    clearTimeout(requestTimeout);

	    if (err) return cb(err);

	    // find distance from point encompassing the count locations

	    var closest = _extractClosest(ctlData.l, coords, initValues.count),
	        boundParams = _determineBounds(closest);

	    cb(null, boundParams);
	  });
	};

	function _determineBounds(locations) {

	  var neLat = false,
	      neLng = false,
	      swLat = false,
	      swLng = false,
	      lat,
	      lng;

	  for (var l in locations) {

	    var lat = locations[l].lt,
	        lng = locations[l].lg;

	    if (!neLat) {

	      neLat = swLat = lat;

	      neLng = swLng = lng;
	    } else {

	      if (lat > neLat) neLat = lat;

	      if (lat < swLat) swLat = lat;

	      if (lng > neLng) neLng = lng;

	      if (lng < swLng) swLng = lng;
	    }
	  }

	  return {
	    neLat: neLat,
	    neLng: neLng,
	    swLat: swLat,
	    swLng: swLng
	  };
	}

	/**
	 * given a lat/lng pair and a list of locations, find the 'count' first locations
	 */

	function _extractClosest(locations, coords, count, cb) {

	  var currentLocation,
	      currentDistance,
	      furthestDistance = false,
	      closestDistances = [],
	      newFurthest = false,
	      closestLocations = {},
	      processed = {};

	  for (var i = locations.length - 1; i >= 0; i--) {

	    currentLocation = locations[i];

	    if (typeof processed[currentLocation.u] == 'undefined') {

	      currentDistance = parseInt(_distance(currentLocation.lt, currentLocation.lg, coords[0], coords[1]), 10);

	      if (closestDistances.length >= count && currentDistance < furthestDistance) {

	        // one needs to go and be replaced

	        newFurthest = currentDistance; // furthest is once again unknown

	        for (var c in closestDistances) {

	          if (closestDistances[c] == furthestDistance) {

	            // the furthest is out and replaced
	            closestDistances[c] = currentDistance;
	            closestLocations[c] = currentLocation;
	          } else {

	            if (closestDistances[c] > newFurthest) {

	              // new furthest is found
	              newFurthest = closestDistances[c];
	            }
	          }
	        }

	        furthestDistance = newFurthest;
	      } else if (closestDistances.length < count) {

	        closestDistances.push(currentDistance);

	        closestLocations[closestDistances.length - 1] = currentLocation;

	        if (!furthestDistance || currentDistance > furthestDistance) {

	          furthestDistance = currentDistance;
	        }
	      }

	      processed[currentLocation.u] = true;
	    }
	  };

	  return closestLocations;
	}

	function _distance(lat1, lon1, lat2, lon2) {

	  var radlat1 = Math.PI * lat1 / 180,
	      radlat2 = Math.PI * lat2 / 180,
	      radlon1 = Math.PI * lon1 / 180,
	      radlon2 = Math.PI * lon2 / 80,
	      radtheta = Math.PI * (lon1 - lon2) / 180;

	  return 60 * 1.1515 * 1609.344 * 180 / Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));
	}

	function _requestGeolocation(cb) {

	  navigator.geolocation.getCurrentPosition(function (pos) {

	    cb(null, [pos.coords.latitude, pos.coords.longitude]);
	  }, function (err) {

	    cb(err.message);
	  });
	}

	function _hasFeature() {

	  return 'geolocation' in navigator;
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var cn = __webpack_require__(4),
	    remote = __webpack_require__(7),
	    res = {
	  prod: {
	    agenda: '//openagenda.com/agendas/{uid}/controldata',
	    embed: '//openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
	  },
	  dev: {
	    agenda: '//d.openagenda.com/agendas/{uid}/controldata',
	    embed: '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
	  },
	  test: {
	    agenda: '//d.openagenda.com/agendas/{uid}/controldata',
	    embed: '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
	  },
	  tpl: {
	    agenda: '/server/testdata/controldata-pepite.json',
	    embed: '/server/testdata/' + (window.testControlData ? window.testControlData : 'embedcontroldata-pepite.json')
	  }
	},
	    defaults = {
	  uid: false, // required. the uid of the agenda
	  embedUid: false, // optional. the uid of the embed
	  jsonp: false
	};

	module.exports = fetch;

	function fetch(options, cb) {

	  var params = cn.extend({}, defaults, options),
	      fetchRes = res[window.env || 'prod'][params.embedUid ? 'embed' : 'agenda'].replace('{uid}', params.uid);

	  if (params.embedUid) {

	    fetchRes = fetchRes.replace('{embedUid}', params.embedUid);
	  }

	  if (params.jsonp) {

	    fetchRes += '?callback=cb' + params.uid + (params.embedUid || '');
	  }

	  remote.get(fetchRes, { timeout: 20000 }, function (responseType, data) {

	    if (responseType !== 'success') {

	      return cb(responseType);
	    }

	    cb(null, data.data);
	  }, !params.jsonp);
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var frameLink = __webpack_require__(13).frame,
	    debug = __webpack_require__(3),
	    log,
	    cn = __webpack_require__(4),
	    pageHeight = __webpack_require__(14),
	    linkClickController = false;

	module.exports = embeddedPage;

	module.exports.copyToSearch = copyToSearch;

	function embeddedPage(pageOptions) {

	  var sendFunc;

	  log = debug('embedded');

	  log('initing');

	  _catchLinkEvents();

	  frameLink(function (s) {

	    sendFunc = s;

	    log('linked with parent');

	    pageHeight.setOnChange(function (height) {

	      sendFunc({
	        height: height
	      });
	    });

	    pageHeight.force();

	    linkClickController = function linkClickController(href, target) {

	      sendFunc({
	        load: href,
	        target: target
	      });
	    };
	  }, function (parentMessage) {

	    if (pageOptions.onReceive) pageOptions.onReceive(parentMessage);
	  });

	  return {
	    send: function send(data) {

	      if (sendFunc) {

	        sendFunc(data);
	      } else {

	        log('send is not ready');
	      }
	    },
	    contentChange: function contentChange() {

	      pageHeight.check();

	      _catchLinkEvents();
	    }
	  };
	}

	function copyToSearch(selector, queryPart) {

	  if (typeof queryPart === 'undefined') {

	    var query = window.location.href.split('?');

	    if (!query.length == 2) return;

	    queryPart = query[1];
	  }

	  cn.forEach(cn.els(selector) || [], function (el) {

	    el.setAttribute('href', el.getAttribute('href').split('?')[0] + '?' + queryPart);
	  });
	}

	function _catchLinkEvents() {

	  var flaggedAttr = 'data-frame-link';

	  cn.forEach(cn.els('a'), function (linkElem) {

	    if (linkElem.hasAttribute('data-frame-link')) return;

	    linkElem.setAttribute('data-frame-link', 'checked');

	    cn.addEvent(linkElem, 'click', function (e) {

	      cn.preventDefault(e);

	      if (!linkClickController) return;

	      linkClickController(linkElem.href, linkElem.hasAttribute('target') ? linkElem.getAttribute('target') : false);
	    });
	  });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(3),
	    cn = __webpack_require__(4);

	module.exports = {
	  frame: parentLink, // link with parent window
	  parent: frameLink // link with frame window
	};

	function parentLink(onLinkEstablished, onParentMessage) {

	  var log = debug('parentLink ( frame script )'),
	      handShakeComplete = false;

	  window.addEventListener('message', function _onParentMessageReceived(e) {

	    // prevent interference from embedded media messages
	    if (['vimeo.com', 'soundcloud.com'].filter(function (unauthorizedOrigin) {

	      return e.origin.indexOf(unauthorizedOrigin) !== -1;
	    }).length) {

	      console.log('unauthorized origin: %s', e.origin);

	      return;
	    }

	    if (!handShakeComplete) {

	      log('received hanshake request from parent');

	      window.parent.postMessage({ href: window.location.href }, e.origin);

	      handShakeComplete = true;

	      onLinkEstablished(function (message) {

	        log('sending message to parent: ', (0, _stringify2.default)(message));

	        window.parent.postMessage((0, _stringify2.default)(message), e.origin);
	      });
	    } else {

	      log('received message from parent');

	      onParentMessage(JSON.parse(e.data));
	    }
	  }, false);
	}

	function frameLink(elem, onLinkEstablished, onReceive) {

	  var log = debug('frameLink ( parent script )'),
	      frameSrc,
	      handShakeComplete = false;

	  cn.addEvent(elem, 'load', function () {

	    _stop();

	    _start();
	  });

	  _start();

	  return;

	  function _start() {

	    frameSrc = _appendProtocol(elem.getAttribute('src'));

	    log('establishing link on frame with %s', frameSrc);

	    handShakeComplete = false;

	    window.addEventListener('message', _onFrameMessageReceived, frameSrc);

	    elem.contentWindow.postMessage(true, frameSrc);
	  }

	  function _stop() {

	    window.removeEventListener('message', _onFrameMessageReceived);
	  }

	  function _onFrameMessageReceived(e) {

	    if (!handShakeComplete) {

	      log('link with frame established');

	      onLinkEstablished(e.data.href, function (message) {

	        elem.contentWindow.postMessage((0, _stringify2.default)(message), frameSrc);
	      });

	      handShakeComplete = true;
	    } else {

	      log('receiving message from frame: %s', e.data);

	      onReceive(typeof e.data == 'string' ? JSON.parse(e.data) : e.data);
	    }
	  }

	  function _appendProtocol(href) {

	    if (href.substr(0, 2) == '//') {

	      return window.location.href.split('//')[0] + href;
	    }

	    return href;
	  }
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var imagesLoaded = __webpack_require__(15);

	module.exports = {
	  check: check,
	  force: force,
	  setOnChange: setOnChange
	};

	var height,
	    cn = __webpack_require__(4),
	    onChangeCb = false,
	    firstChildPaddings = false,
	    enabled = true,
	    enableTimeout;

	cn.addEvent(window, 'resize', check);

	cn.addEvent(window, 'load', function () {

	  imagesLoaded(cn.el('body'), check);
	});

	function check(force) {

	  var current = _getHeight();

	  if (_isDisabled()) return;

	  if (typeof force !== 'boolean') force = false;

	  if (!force && height == current) return;

	  height = current;

	  if (onChangeCb) onChangeCb(height);

	  _disable();

	  _enable(100);
	}

	function force() {

	  check(true);
	}

	function setOnChange(cb) {

	  onChangeCb = cb;
	}

	function _isDisabled() {

	  return !enabled;
	}

	function _disable() {

	  enabled = false;
	}

	function _enable(delay) {

	  if (enableTimeout) clearTimeout(enableTimeout);

	  enableTimeout = setTimeout(function () {

	    enabled = true;
	  }, typeof delay !== 'undefined' ? delay : 0);
	}

	function _getHeight() {

	  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
	  return document.getElementsByTagName('body')[0].offsetHeight - _getFirstChildPaddingSum();
	}

	function _getFirstChildPaddingSum() {

	  var firstElemIndex = 0,
	      firstChild;

	  if (firstChildPaddings) return firstChildPaddings[0] + firstChildPaddings[1]; // they screw up height estimation

	  firstChild = cn.childObject(cn.el('body'), 0);

	  if (firstChild && firstChild.tagName == 'STYLE') {

	    firstChild = cn.childObject(cn.el('body'), 1);
	  }

	  if (!firstChild) {

	    firstChildPaddings = [0, 0];
	  } else {

	    firstChildPaddings = [_getStyleValue(firstChild, 'paddingTop'), _getStyleValue(firstChild, 'paddingBottom')];
	  }

	  return firstChildPaddings[0] + firstChildPaddings[1];
	}

	function _getStyleValue(elem, name) {

	  var style = (window.getComputedStyle ? window.getComputedStyle(elem) : elem.currentStyle) || {};

	  return parseInt(style[name] || 0, 10);
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * imagesLoaded v3.1.8
	 * JavaScript is all like "You images are done yet or what?"
	 * MIT License
	 */

	( function( window, factory ) { 'use strict';
	  // universal module definition

	  /*global define: false, module: false, require: false */

	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	      !(function webpackMissingModule() { var e = new Error("Cannot find module \"eventEmitter/EventEmitter\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	      !(function webpackMissingModule() { var e = new Error("Cannot find module \"eventie/eventie\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function( EventEmitter, eventie ) {
	      return factory( window, EventEmitter, eventie );
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof exports === 'object' ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('wolfy87-eventemitter'),
	      require('eventie')
	    );
	  } else {
	    // browser global
	    window.imagesLoaded = factory(
	      window,
	      window.EventEmitter,
	      window.eventie
	    );
	  }

	})( window,

	// --------------------------  factory -------------------------- //

	function factory( window, EventEmitter, eventie ) {

	'use strict';

	var $ = window.jQuery;
	var console = window.console;
	var hasConsole = typeof console !== 'undefined';

	// -------------------------- helpers -------------------------- //

	// extend objects
	function extend( a, b ) {
	  for ( var prop in b ) {
	    a[ prop ] = b[ prop ];
	  }
	  return a;
	}

	var objToString = Object.prototype.toString;
	function isArray( obj ) {
	  return objToString.call( obj ) === '[object Array]';
	}

	// turn element or nodeList into an array
	function makeArray( obj ) {
	  var ary = [];
	  if ( isArray( obj ) ) {
	    // use object if already an array
	    ary = obj;
	  } else if ( typeof obj.length === 'number' ) {
	    // convert nodeList to array
	    for ( var i=0, len = obj.length; i < len; i++ ) {
	      ary.push( obj[i] );
	    }
	  } else {
	    // array of single index
	    ary.push( obj );
	  }
	  return ary;
	}

	  // -------------------------- imagesLoaded -------------------------- //

	  /**
	   * @param {Array, Element, NodeList, String} elem
	   * @param {Object or Function} options - if function, use as callback
	   * @param {Function} onAlways - callback function
	   */
	  function ImagesLoaded( elem, options, onAlways ) {
	    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
	    if ( !( this instanceof ImagesLoaded ) ) {
	      return new ImagesLoaded( elem, options );
	    }
	    // use elem as selector string
	    if ( typeof elem === 'string' ) {
	      elem = document.querySelectorAll( elem );
	    }

	    this.elements = makeArray( elem );
	    this.options = extend( {}, this.options );

	    if ( typeof options === 'function' ) {
	      onAlways = options;
	    } else {
	      extend( this.options, options );
	    }

	    if ( onAlways ) {
	      this.on( 'always', onAlways );
	    }

	    this.getImages();

	    if ( $ ) {
	      // add jQuery Deferred object
	      this.jqDeferred = new $.Deferred();
	    }

	    // HACK check async to allow time to bind listeners
	    var _this = this;
	    setTimeout( function() {
	      _this.check();
	    });
	  }

	  ImagesLoaded.prototype = new EventEmitter();

	  ImagesLoaded.prototype.options = {};

	  ImagesLoaded.prototype.getImages = function() {
	    this.images = [];

	    // filter & find items if we have an item selector
	    for ( var i=0, len = this.elements.length; i < len; i++ ) {
	      var elem = this.elements[i];
	      // filter siblings
	      if ( elem.nodeName === 'IMG' ) {
	        this.addImage( elem );
	      }
	      // find children
	      // no non-element nodes, #143
	      var nodeType = elem.nodeType;
	      if ( !nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 ) ) {
	        continue;
	      }
	      var childElems = elem.querySelectorAll('img');
	      // concat childElems to filterFound array
	      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
	        var img = childElems[j];
	        this.addImage( img );
	      }
	    }
	  };

	  /**
	   * @param {Image} img
	   */
	  ImagesLoaded.prototype.addImage = function( img ) {
	    var loadingImage = new LoadingImage( img );
	    this.images.push( loadingImage );
	  };

	  ImagesLoaded.prototype.check = function() {
	    var _this = this;
	    var checkedCount = 0;
	    var length = this.images.length;
	    this.hasAnyBroken = false;
	    // complete if no images
	    if ( !length ) {
	      this.complete();
	      return;
	    }

	    function onConfirm( image, message ) {
	      if ( _this.options.debug && hasConsole ) {
	        console.log( 'confirm', image, message );
	      }

	      _this.progress( image );
	      checkedCount++;
	      if ( checkedCount === length ) {
	        _this.complete();
	      }
	      return true; // bind once
	    }

	    for ( var i=0; i < length; i++ ) {
	      var loadingImage = this.images[i];
	      loadingImage.on( 'confirm', onConfirm );
	      loadingImage.check();
	    }
	  };

	  ImagesLoaded.prototype.progress = function( image ) {
	    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
	    // HACK - Chrome triggers event before object properties have changed. #83
	    var _this = this;
	    setTimeout( function() {
	      _this.emit( 'progress', _this, image );
	      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
	        _this.jqDeferred.notify( _this, image );
	      }
	    });
	  };

	  ImagesLoaded.prototype.complete = function() {
	    var eventName = this.hasAnyBroken ? 'fail' : 'done';
	    this.isComplete = true;
	    var _this = this;
	    // HACK - another setTimeout so that confirm happens after progress
	    setTimeout( function() {
	      _this.emit( eventName, _this );
	      _this.emit( 'always', _this );
	      if ( _this.jqDeferred ) {
	        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
	        _this.jqDeferred[ jqMethod ]( _this );
	      }
	    });
	  };

	  // -------------------------- jquery -------------------------- //

	  if ( $ ) {
	    $.fn.imagesLoaded = function( options, callback ) {
	      var instance = new ImagesLoaded( this, options, callback );
	      return instance.jqDeferred.promise( $(this) );
	    };
	  }


	  // --------------------------  -------------------------- //

	  function LoadingImage( img ) {
	    this.img = img;
	  }

	  LoadingImage.prototype = new EventEmitter();

	  LoadingImage.prototype.check = function() {
	    // first check cached any previous images that have same src
	    var resource = cache[ this.img.src ] || new Resource( this.img.src );
	    if ( resource.isConfirmed ) {
	      this.confirm( resource.isLoaded, 'cached was confirmed' );
	      return;
	    }

	    // If complete is true and browser supports natural sizes,
	    // try to check for image status manually.
	    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
	      // report based on naturalWidth
	      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
	      return;
	    }

	    // If none of the checks above matched, simulate loading on detached element.
	    var _this = this;
	    resource.on( 'confirm', function( resrc, message ) {
	      _this.confirm( resrc.isLoaded, message );
	      return true;
	    });

	    resource.check();
	  };

	  LoadingImage.prototype.confirm = function( isLoaded, message ) {
	    this.isLoaded = isLoaded;
	    this.emit( 'confirm', this, message );
	  };

	  // -------------------------- Resource -------------------------- //

	  // Resource checks each src, only once
	  // separate class from LoadingImage to prevent memory leaks. See #115

	  var cache = {};

	  function Resource( src ) {
	    this.src = src;
	    // add to cache
	    cache[ src ] = this;
	  }

	  Resource.prototype = new EventEmitter();

	  Resource.prototype.check = function() {
	    // only trigger checking once
	    if ( this.isChecked ) {
	      return;
	    }
	    // simulate loading on detached element
	    var proxyImage = new Image();
	    eventie.bind( proxyImage, 'load', this );
	    eventie.bind( proxyImage, 'error', this );
	    proxyImage.src = this.src;
	    // set flag
	    this.isChecked = true;
	  };

	  // ----- events ----- //

	  // trigger specified handler for event type
	  Resource.prototype.handleEvent = function( event ) {
	    var method = 'on' + event.type;
	    if ( this[ method ] ) {
	      this[ method ]( event );
	    }
	  };

	  Resource.prototype.onload = function( event ) {
	    this.confirm( true, 'onload' );
	    this.unbindProxyEvents( event );
	  };

	  Resource.prototype.onerror = function( event ) {
	    this.confirm( false, 'onerror' );
	    this.unbindProxyEvents( event );
	  };

	  // ----- confirm ----- //

	  Resource.prototype.confirm = function( isLoaded, message ) {
	    this.isConfirmed = true;
	    this.isLoaded = isLoaded;
	    this.emit( 'confirm', this, message );
	  };

	  Resource.prototype.unbindProxyEvents = function( event ) {
	    eventie.unbind( event.target, 'load', this );
	    eventie.unbind( event.target, 'error', this );
	  };

	  // -----  ----- //

	  return ImagesLoaded;

	});


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(5);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(11),
	    utils = __webpack_require__(17);

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
/* 17 */
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__(3),
	    log,
	    cn = __webpack_require__(4),
	    pageHeight = __webpack_require__(14),
	    params = {
	  fbAppId: false
	};

	module.exports = function (pageOptions) {

	  cn.extend(params, pageOptions);

	  _fbAsyncInit(params.fbAppId, function (err, FB) {

	    FB.Canvas.setAutoGrow();

	    FB.Canvas.scrollTo(0, 400);
	  });

	  return {
	    contentChange: function contentChange() {}
	  };
	};

	function _fbAsyncInit(fbAppId, cb) {

	  window.fbAsyncInit = function () {

	    FB.init({
	      appId: fbAppId,
	      xfbml: true,
	      version: 'v2.4'
	    });

	    cb(null, FB);
	  };

	  (function (d, s, id) {
	    var js,
	        fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) {
	      return;
	    }
	    js = d.createElement(s);js.id = id;
	    js.src = "//connect.facebook.net/en_US/sdk.js";
	    fjs.parentNode.insertBefore(js, fjs);
	  })(document, 'script', 'facebook-jssdk');
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.setOnReady = setOnReady;

	var UID = 0,
	    LANG = 1,
	    MODE = 2,
	    cn = __webpack_require__(4),
	    wLib = __webpack_require__(20),
	    debug = __webpack_require__(3),
	    domLib = __webpack_require__(21),
	    config = __webpack_require__(28),
	    dateLabels = __webpack_require__(29),
	    onReady;

	if (['tpl', 'dev'].indexOf(window.env) !== -1) {

	  debug.enable('*');
	}

	var widget = function widget(elem, options) {

	  var log,
	      enabled = false,
	      activeFilters = {},
	      dom = domLib(elem),
	      lang = 'fr',
	      categories = {},
	      tags = {},
	      organizations = {},
	      controller;

	  return function () {

	    var uid = options.anchorConfig[UID],
	        lang = options.anchorConfig[LANG],
	        log = debug('activeFilters widget ' + uid);

	    dateLabels.setLang(lang);

	    if (options.anchorConfig[MODE]) {

	      dom.setMode(options.anchorConfig[MODE]);
	    }

	    dom.setOnRemove(_onFilterRemove);

	    log('initing');

	    controller = options.register(wLib.interface('activeFilters', uid, {
	      enable: enable,
	      disable: disable
	    }));

	    controller.getControlData(function (data) {

	      _indexLabels(data);

	      log('init complete, enable to render');

	      if (onReady) onReady();
	    });
	  }();

	  function disable() {

	    enabled = false;

	    _render();
	  }

	  function enable(reqParams) {

	    var newFilters = [],
	        reqTags,
	        tagLabels;

	    enabled = true;

	    if (reqParams.neLat) {

	      newFilters.push({
	        label: _label('map'),
	        keys: ['neLat', 'neLng', 'swLat', 'swLng']
	      });
	    }

	    if (reqParams.from) {

	      if (reqParams.to && reqParams.to !== reqParams.from) {

	        newFilters.push({
	          label: dateLabels(reqParams.from, reqParams.to),
	          keys: ['from', 'to']
	        });
	      } else {

	        newFilters.push({
	          label: dateLabels(reqParams.from),
	          keys: ['from', 'to']
	        });
	      }
	    }

	    if (reqParams.what) {

	      newFilters.push({
	        label: reqParams.what,
	        keys: ['what']
	      });
	    }

	    if (reqParams.category) {

	      newFilters.push({
	        label: categories[reqParams.category],
	        keys: ['category']
	      });
	    }

	    if (reqParams.tags) {

	      reqTags = typeof reqParams.tags == 'string' ? [reqParams.tags] : reqParams.tags;

	      tagLabels = [];

	      cn.forEach(reqTags, function (tag) {

	        tagLabels.push(tags[tag]);
	      });

	      newFilters.push({
	        label: tagLabels.join(', '),
	        keys: ['tags']
	      });
	    }

	    if (reqParams.location) {

	      newFilters.push({
	        label: config.labels[lang].location,
	        keys: ['location']
	      });
	    }

	    if (reqParams.org) {

	      newFilters.push({
	        label: organizations[reqParams.org],
	        keys: ['org']
	      });
	    }

	    if (reqParams.passed) {

	      newFilters.push({
	        label: config.labels[lang].passed,
	        keys: ['passed']
	      });
	    }

	    activeFilters = newFilters;

	    _render();
	  }

	  function _render() {

	    dom.render({ filters: activeFilters, enabled: enabled });
	  }

	  function _label(type, values) {

	    if (typeof values == 'undefined') values = {};

	    return _format(config.labels[lang][type], values);
	  }

	  function _format(tpl, ctx) {

	    return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function (m, g) {
	      return ctx[g.trim()] || '';
	    });
	  }

	  function _indexLabels(data) {

	    cn.forEach(data.ct, function (c) {

	      categories[c.s] = c.c;
	    });

	    cn.forEach(data.t, function (t) {

	      tags[t.s] = t.t;
	    });

	    if (data.org) {

	      cn.forEach(data.org, function (o) {

	        organizations[o.s] = o.l;
	      });
	    }
	  }

	  function _onFilterRemove(filter) {

	    var keysToRemove = {};

	    if (!enabled) {

	      log('remove filter ignored, widget not enabled');

	      return;
	    }

	    cn.forEach(filter.keys, function (key) {

	      keysToRemove[key] = null;
	    });

	    controller.update('activeFilters', keysToRemove);
	  }
	};

	function setOnReady(cb) {

	  onReady = cb;
	}

	__webpack_require__(31)(function (register) {

	  wLib.forEachAnchor('.cbpgft', { register: register }, widget);
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var du = __webpack_require__(16),
	    utils = __webpack_require__(17),
	    log = __webpack_require__(3)('widgetLib');

	/**
	 * for each element corresponding to selector, load config in attribute
	 * and handover the element and the config to the callback
	 * callback should be the widget
	 */

	exports.forEachAnchor = function (selector, options, cb) {

	  // do it asap
	  _onAsapReady(_load(selector, options, cb));

	  // at latest, do it if dom is ready
	  _domReady(_load(selector, options, cb));
	};

	function _load(selector, options, cb) {

	  return function () {

	    var found = false,
	        _process = function _process(elem) {

	      found = true;

	      if (!_flagged(elem)) {

	        cb(elem, utils.extend({
	          anchorConfig: readAnchorConfig(elem)
	        }, options));
	      }
	    };

	    du.forEach(du.els(selector), _process);

	    // if class has not been found, attempt to find through backup data attribute selector

	    if (!found && options.backup) {

	      du.forEach(document.querySelectorAll(options.backup.selector), function (elem) {

	        if (options.backup && options.backup.classNames) {

	          du.addClass(elem, options.backup.classNames);
	        }

	        _process(elem);
	      });
	    }
	  };
	}

	/**
	 * bootstrap widget with default controller interface functions
	 */

	exports.interface = function (name, uid, cbs) {

	  return utils.extend({
	    name: name,
	    uid: uid,
	    clear: isNotDefined('clear', name),
	    include: isNotDefined('include', name),
	    enable: isNotDefined('enable', name),
	    disable: isNotDefined('disable', name),
	    change: isNotDefined('change', name)
	  }, cbs);
	};

	function _flagged(elem) {

	  if (elem.hasAttribute('data-flag')) {

	    return true;
	  }

	  elem.setAttribute('data-flag', '1');

	  return false;
	}

	function isNotDefined(type, name) {

	  return function () {};
	}

	function readAnchorConfig(elem) {

	  if (elem.hasAttribute('data-cbctl')) {

	    return elem.getAttribute('data-cbctl').split('|');
	  } else if (elem.hasAttribute('src')) {

	    return elem.getAttribute('src');
	  }
	}

	function _domReady(cb) {

	  if (document.readyState === 'complete') {

	    cb();
	  } else {

	    du.addEvent(window, 'load', cb);
	  }
	}

	function _onAsapReady(timeout, cb) {

	  if (arguments.length == 1) {

	    cb = timeout;

	    timeout = 0;
	  }

	  if (du.el('body')) return cb();

	  setTimeout(function () {

	    _onAsapReady(Math.max((timeout + 10) * 2, 10000), cb);
	  }, timeout);
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ejs = __webpack_require__(22),
	    cn = __webpack_require__(4),
	    log = __webpack_require__(3)('activeFilter dom'),
	    params = {
	  selectors: {
	    itemsCanvas: 'ul'
	  }
	},
	    templates = {
	  main: __webpack_require__(24),
	  bsMain: __webpack_require__(25),
	  item: __webpack_require__(26),
	  bsItem: __webpack_require__(27)
	},
	    mainTemplate = templates.main,
	    itemTemplate = templates.item;

	module.exports = function (anchorElem) {

	  var onRemove; // callback

	  return {
	    render: render,
	    setOnRemove: setOnRemove, // set callback to call when remove request is set
	    setMode: setMode
	  };

	  function render(data) {

	    var wrapper = document.createElement('div'),
	        itemsCanvas;

	    _clear();

	    if (!data.filters || !data.filters.length) {

	      return;
	    }

	    wrapper.innerHTML = ejs.render(mainTemplate, data);

	    itemsCanvas = cn.el(wrapper, params.selectors.itemsCanvas);

	    cn.forEach(data.filters, function (filter) {

	      itemsCanvas.appendChild(_createFilterItem(filter));
	    });

	    anchorElem.appendChild(cn.childObject(wrapper, 0));
	  }

	  function setOnRemove(cb) {

	    onRemove = cb;
	  }

	  function setMode(mode) {

	    if (mode == 'bs') {

	      mainTemplate = templates.bsMain;

	      itemTemplate = templates.bsItem;
	    }
	  }

	  function _createFilterItem(filter) {

	    var itemWrapper = document.createElement('ul'),
	        filterElem;

	    itemWrapper.innerHTML = ejs.render(itemTemplate, filter);

	    filterElem = cn.el(itemWrapper, 'li');

	    cn.addEvent(cn.el(filterElem, 'a'), 'click', function (e) {

	      log('click');

	      cn.preventDefault(e);

	      onRemove(filter); // handle this in widget
	    });

	    return filterElem;
	  }

	  function _clear() {

	    var child;

	    while (child = cn.childObject(anchorElem, 0)) {

	      anchorElem.removeChild(child);
	    }
	  }
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EJS = __webpack_require__(23);

	module.exports = {
	  render: render
	};

	function render(template, data) {

	  var escaped = _removeOnload(data);

	  return new EJS({ text: template }).render(escaped);
	}

	function _removeOnload(data) {

	  var escaped = {};

	  for (var i in data) {

	    if (typeof data[i] == 'string') {

	      escaped[i] = data[i].replace(/onload=/g, '');
	    } else {

	      escaped[i] = data[i];
	    }
	  }

	  return escaped;
	}

/***/ },
/* 23 */
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
/* 24 */
/***/ function(module, exports) {

	module.exports = "<% if ( filters.length ) { %>\n<ul class=\"active-filters\" <% if ( !enabled ) { %>class=\"disabled\"<% } %>></ul>\n<% } %>"

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = "<ul class=\"nav nav-pills\"></ul>"

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = "<li><span><%= label %></span><a>&#10005</a></li>"

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = "<li class=\"active\"><a href=\"#\"><%= label %></a></li>"

/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  labels: {
	    fr: {
	      dateRange: 'du {{from}} au {{to}}',
	      map: 'carte',
	      passed: 'événements passés',
	      location: 'lieu'
	    },
	    en: {
	      dateRange: 'from {{from}} to {{to}}',
	      map: 'map',
	      passed: 'past events',
	      location: 'place'
	    },
	    es: {
	      dateRange: 'desde {{from}} hasta {{to}}',
	      map: 'mapa',
	      passed: 'pasado',
	      location: 'lugar'
	    },
	    it: {
	      dateRange: 'dal {{from}} al {{to}}',
	      map: 'carta',
	      passed: 'passato',
	      location: 'luogo'
	    },
	    de: {
	      dateRange: 'von {{from}} bis {{to}}',
	      map: 'karte',
	      passed: 'vergangenheit',
	      location: 'platz'
	    }
	  }
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var labels = {
	  fr: __webpack_require__(30)
	},
	    lang = 'en',
	    months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

	module.exports = renderLabel;

	module.exports.setLang = setLang;

	function renderLabel() {

	  if (arguments.length == 2) {

	    return renderRange(arguments[0], arguments[1]);
	  } else {

	    return renderDate(arguments[0]);
	  }
	}

	function renderRange(s, e) {

	  var label = 'from %start% to %end%';

	  if (lang !== 'en') label = labels[lang][label];

	  return label.replace('%start%', renderDate(s)).replace('%end%', renderDate(e));
	}

	function renderDate(d) {

	  var date = new Date(d),
	      now = new Date(),
	      displayYear = date.getFullYear() !== now.getFullYear(),
	      month = months[date.getMonth()];

	  if (lang !== 'en') month = labels[lang][month];

	  return date.getDate() + ' ' + month + (displayYear ? ' ' + date.getFullYear() : '');
	}

	function setLang(l) {

	  lang = l;
	}

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = {
		"from %start% to %end%": "du %start% au %end%",
		"january": "janvier",
		"february": "février",
		"march": "mars",
		"april": "avril",
		"may": "mai",
		"june": "juin",
		"july": "juillet",
		"august": "août",
		"september": "septembre",
		"october": "octobre",
		"november": "novembre",
		"december": "décembre",
		"monday": "lundi",
		"tuesday": "mardi",
		"wednesday": "mercredi",
		"thursday": "jeudi",
		"friday": "vendredi",
		"saturday": "samedi",
		"sunday": "dimanche"
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var loadJs = __webpack_require__(32),
	    cn = __webpack_require__(4),
	    defaults = {
	  all: {
	    controllersPath: '//openagenda.com/js/embed/cibulControllers.js'
	  },
	  dev: {
	    controllersPath: '//d.openagenda.com/js/embed/cibulControllers.js'
	  },
	  tpl: {
	    controllersPath: '/js/browserified/widgetsControllerMain.js'
	  }
	},
	    env = window.env ? window.env : 'prod',
	    params = cn.extend(defaults.all, defaults[env] ? defaults[env] : {});

	module.exports = function (cb) {

	  getRegister(cb);
	};

	var getRegister = function getRegister(cb) {

	  if (window.cibul) {

	    cb(window.cibul.registerWidget);
	  } else {

	    loadJs(params.controllersPath, function () {

	      cb(window.cibul.registerWidget);
	    });
	  }
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (src, callback) {

	  if (typeof src == 'string') {

	    var script = document.createElement('script');

	    if (script.readyState) {
	      // IE

	      script.onreadystatechange = function () {

	        if (script.readyState == "loaded" || script.readyState == "complete") {

	          script.onreadystatechange = null;

	          if (typeof callback == "function") callback();

	          callback = null;
	        }
	      };
	    } else {

	      script.onload = function () {

	        if (typeof callback == "function") callback();callback = null;
	      };
	    }

	    script.charset = "utf-8";

	    script.src = src;

	    script.type = 'text/javascript';

	    document.getElementsByTagName('head')[0].appendChild(script);
	  } else {

	    var loadedScriptCount = 0;

	    for (var i = 0; i < src.length; i++) {

	      loadJs(src[i], function () {

	        loadedScriptCount++;

	        if (loadedScriptCount == src.length) {

	          callback();
	          callback = null;
	        }
	      });
	    }
	  }
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__(3),
	    log,
	    pagination = __webpack_require__(34),
	    partialLoader = __webpack_require__(35),
	    cn = __webpack_require__(4),
	    config = __webpack_require__(36),
	    params = {
	  empty: false, // true if agenda is empty
	  total: false, // total items
	  perPager: false, // items per page
	  onLoad: false,
	  selectors: {
	    list: '.js_list_content'
	  },
	  autoLoadNext: true,
	  onLastPage: false
	},
	    loader,
	    pagination;

	module.exports = {
	  init: init,
	  reset: reset,
	  loadNext: loadNext
	};

	function init(options) {

	  log = debug('agenda list');

	  log('initing');

	  cn.extend(params, options);

	  if (options.empty) return;

	  loader = partialLoader(cn.extend(config.partialOptions, {
	    canvas: cn.el(params.selectors.list),
	    onLoad: params.onLoad
	  }));

	  pagination.init({
	    href: window.location.href,
	    total: params.total,
	    perPage: params.perPage,
	    loadNext: loader.after,
	    loadPrev: loader.before,
	    auto: params.autoLoadNext,
	    onLastPage: params.onLastPage
	  });
	}

	function loadNext(cb) {

	  log('load next');

	  pagination.loadNext(cb);
	}

	function reset(newHref) {

	  loader.replace(newHref, function (err, data) {

	    if (err) {

	      console.log(err);

	      return;
	    }

	    pagination.reset(newHref, data.total);
	  });
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var cn = __webpack_require__(4),
	    debug = __webpack_require__(3),
	    log,
	    qs = __webpack_require__(11),
	    params = {
	  loadNext: false, // cb to get next page content
	  loadPrev: false, // cb to get previous page content
	  auto: true, // loads next page on bottom hit
	  selectors: {
	    pager: '.js_pages',
	    list: '.js_list_content',
	    previous: '.js_previous_page'
	  },
	  classes: {
	    displayNone: 'display-none'
	  },
	  onLastPage: false
	},
	    page = 1,
	    loading = false,
	    prevPageExists = true;

	module.exports = {
	  init: init,
	  reset: reset,
	  loadNext: loadNext
	};

	function init(options) {

	  log = debug('pagination');

	  cn.extend(params, options);

	  log('initing with params %s', (0, _stringify2.default)(options));

	  _readPage(params.href);

	  _hidePager();

	  _initPrevPage(params.href);

	  if (params.auto) {

	    _onHitBottom(loadNext);
	  }

	  if (!_hasNext() && params.onLastPage) params.onLastPage();
	}

	function reset(newHref, total) {

	  params.total = total;

	  params.href = newHref;

	  _removePrevPage();

	  page = 1;

	  loading = false;

	  if (!_hasNext() && params.onLastPage) params.onLastPage();
	}

	function loadNext(cb) {

	  log('loading next');

	  var newHref;

	  if (loading) {

	    log('already loading');

	    return cb ? cb('already loading') : null;
	  }

	  loading = true;

	  if (!_hasNext()) {

	    log('last page already reached: %s', page);

	    if (params.onLastPage) params.onLastPage();

	    return cb ? cb('last page already reached') : null;
	  }

	  newHref = _setHrefPage(params.href, page + 1);

	  params.loadNext(newHref, function (err, data) {

	    loading = false;

	    page += 1;

	    if (!_hasNext() && params.onLastPage) params.onLastPage();

	    if (cb) cb(err);
	  });
	}

	function _onHitBottom(cb) {

	  var offset,
	      body = cn.el('body');

	  cn.addEvent(document, 'scroll', function () {

	    var scrollPos = cn.getScrollOffsets().y,
	        pageBottom = body.offsetHeight,
	        windowHeight = cn.windowInnerHeight();

	    if (pageBottom - windowHeight <= scrollPos) {

	      cb();
	    }
	  });
	}

	function _hidePager() {

	  cn.forEach(cn.els(params.selectors.pager), function (pagerElem) {

	    cn.addClass(pagerElem, params.classes.displayNone);
	  });
	}

	function _setHrefPage(href, newPage) {

	  var parts = href.split('?'),
	      queryString = parts.length == 1 ? '' : parts[1].split('#')[0],
	      query = qs.parse(queryString);

	  query.page = newPage;

	  return parts[0] + '?' + qs.stringify(query);
	}

	function _initPrevPage(href) {

	  var firstPage = page;

	  if (firstPage > 1) {

	    cn.addEvent(cn.el(params.selectors.previous), 'click', function () {

	      params.loadPrev(_setHrefPage(href, firstPage - 1), function (err, data) {

	        loading = false;

	        firstPage -= 1;

	        if (firstPage == 1) {

	          _removePrevPage();
	        }
	      });
	    });

	    cn.removeClass(cn.el(params.selectors.previous), params.classes.displayNone);
	  } else {

	    _removePrevPage();
	  }
	}

	function _removePrevPage() {

	  if (prevPageExists && cn.el(params.selectors.previous)) {

	    cn.el(params.selectors.previous).parentNode.removeChild(cn.el(params.selectors.previous));

	    prevPageExists = false;
	  }
	}

	function _readPage(href) {

	  var parts = href.split('?'),
	      query = {};

	  if (parts.length == 1) {

	    page = 1;

	    return;
	  }

	  query = qs.parse(parts[1].split('#')[0]);

	  if (query.page) {

	    page = parseInt(query.page, 10);
	  } else {

	    page = 1;
	  }
	}

	function _hasNext() {

	  return page * params.perPage < params.total;
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var remote = __webpack_require__(7),
	    cn = __webpack_require__(4),
	    log = __webpack_require__(3)('partialLoader'),
	    qs = __webpack_require__(11),
	    defaults = {
	  canvas: false, // canvas elem where content is loaded
	  href: false, // this is the href loaded
	  raw: false, // response should be considered as raw data
	  decorate: {}, // response should be decorated with this
	  preventBrowserCache: true,
	  onLoad: false
	};

	module.exports = function (options) {

	  var params = cn.extend({}, defaults, options),
	      init = function init() {

	    log('initing');

	    return {
	      replace: _action('replace'),
	      after: _action('after'),
	      before: _action('before')
	    };
	  },
	      _action = function _action(name) {

	    return function (href, cb) {

	      _get(href, function (err, data) {

	        if (err) {

	          return cb(err);
	        }

	        _dom[name](data);

	        if (cb) cb(null, data);

	        if (params.onLoad) params.onLoad(null, data);
	      });
	    };
	  },
	      _dom = {

	    replace: function replace(data) {

	      _clear(params.canvas);

	      params.canvas.innerHTML = data.partial;
	    },

	    after: function after(data) {

	      params.canvas.insertAdjacentHTML('beforeend', data.partial);
	    },

	    before: function before(data) {

	      params.canvas.insertAdjacentHTML('afterbegin', data.partial);
	    }

	  },
	      _get = function _get(href, cb) {

	    var settings = {};

	    if (params.raw) {

	      settings.raw = true;
	    }

	    if (params.preventBrowserCache) {

	      settings.data = { preventCache: Math.random() };
	    }

	    if (window.env == 'tpl') href = _templateHref(href);

	    remote.getXmlHttp(href, settings, function (responseType, data) {

	      var response = {};

	      if (responseType !== 'success') {

	        cb(responseType);

	        return;
	      }

	      if (params.raw) {

	        response.partial = data;
	      } else {

	        response = data;
	      }

	      if (params.decorate) {

	        cn.extend(response, options.decorate);
	      }

	      cb(null, response);
	    });
	  };

	  return init();
	};

	function _clear(elem) {

	  var child;

	  while (child = cn.childObject(elem, 0)) {

	    elem.removeChild(child);
	  }
	}

	/**
	 * fetch partial directly in template mode
	 */

	function _templateHref(href) {

	  var parts = href.split('?');

	  return parts[0].replace('embedS', 's') + '.part' + (parts.length == 2 ? '?' + parts[1] : '');
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var deepExtend = __webpack_require__(37),
	    config = {
	  all: {
	    partialOptions: {}
	  },
	  tpl: {
	    partialOptions: {
	      raw: true,
	      decorate: {
	        page: 1,
	        count: 20,
	        total: 65
	      }
	    }
	  }
	},
	    currentConfig = typeof config[window.env] == 'undefined' ? {} : config[window.env];

	module.exports = deepExtend(config.all, currentConfig);

/***/ },
/* 37 */
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
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var du = __webpack_require__(16),
	    utils = __webpack_require__(17),
	    store = __webpack_require__(39),
	    debug = __webpack_require__(3),
	    log,
	    qs = __webpack_require__(11),
	    bBar = __webpack_require__(40),
	    frLabels = __webpack_require__(41),
	    i18n = __webpack_require__(42),
	    __,
	    params = {
	  lang: 'fr',
	  agendaUid: false, // required
	  bottomBar: true, // use bottom bar
	  classes: {
	    displayNone: 'display-none'
	  },
	  selectors: {
	    item: '.js_fav_item',
	    menu: '.js_favorite_menu',
	    exports: '.js_fav_export',
	    info: '.js_fav_info',
	    clear: '.js_fav_clear',
	    empty: '.js_favorite_menu_empty'
	  },
	  attributes: {
	    uid: 'data-event-uid'
	  },
	  storeKey: 'favorites',
	  templates: {
	    favorited: '<i class="fa fa-star active"></i>',
	    unfavorited: '<i class="fa fa-star-o"></i>'
	  },
	  res: {
	    actions: '#' // required
	  }
	},
	    favUids;

	module.exports = {
	  init: init,
	  sweep: sweep,
	  menu: menu
	};

	if (['tpl', 'dev'].indexOf(window.env) !== -1) {

	  debug.enable('*');
	}

	function init(options) {

	  utils.extend(params, options);

	  favUids = _getFavUids();

	  __ = i18n(params.lang == 'fr' ? frLabels : {});

	  log = debug('favorites');
	}

	/**
	 * go through displayed event items
	 */

	function sweep(ignoreFlagged) {

	  log('sweeping %s', ignoreFlagged ? 'forced' : '');

	  utils.forEach(du.els(params.selectors.item), function (favElem) {

	    if (favElem.hasAttribute('data-fav-flagged') && !ignoreFlagged) return;

	    favElem.setAttribute('data-fav-flagged', 1);

	    var uid = parseInt(favElem.getAttribute(params.attributes.uid), 10),
	        isFaved = favUids.indexOf(uid) !== -1;

	    (isFaved ? _setFavorited : _setUnfavorited)(favElem);

	    du.addEvent(favElem, 'click', function (e) {

	      e.preventDefault();
	      e.stopPropagation();

	      isFaved = !isFaved;

	      (isFaved ? _setFavorited : _setUnfavorited)(favElem);

	      if (isFaved) {

	        favUids.push(uid);
	      } else {

	        favUids.splice(favUids.indexOf(uid), 1);
	      }

	      _saveFavUids(favUids);

	      if (params.bottomBar) {

	        bBar.setContent(__('You have now %count% events in your selection', { '%count%': favUids.length }) + ' - <a href="' + params.res.actions + '">' + __('export') + '</a>' + ' - <a class="js_fav_clear">' + __('clear') + '</a>');

	        bBar.show(5000);
	      }

	      _eventifyClear();
	    });
	  });
	}

	function menu() {

	  if (!favUids.length) {

	    if (du.el(params.selectors.menu)) {

	      du.addClass(du.el(params.selectors.menu), params.classes.displayNone);
	      du.removeClass(du.el(params.selectors.empty), params.classes.displayNone);
	    }

	    return;
	  }

	  var query = qs.stringify({ search: { uids: favUids } });

	  du.el(params.selectors.info).innerHTML = du.el(params.selectors.info).innerHTML.replace('{count}', favUids.length);

	  utils.forEach(du.els(params.selectors.exports), function (linkElem) {

	    linkElem.setAttribute('href', linkElem.getAttribute('href') + '?' + query);
	  });

	  du.addClass(du.el(params.selectors.empty), params.classes.displayNone);
	  du.removeClass(du.el(params.selectors.menu), params.classes.displayNone);

	  _eventifyClear();
	}

	/**
	 * give behavior to clear link. Should be only one ine the page
	 */

	function _eventifyClear(cb) {

	  var elem = du.el(params.selectors.clear);

	  if (!elem) return;

	  du.addEvent(elem, 'click', function (e) {

	    du.preventDefault(e);

	    favUids = [];

	    _saveFavUids(favUids);

	    sweep(true);

	    if (params.bottomBar) {

	      bBar.hide();
	    }

	    menu();
	  });
	}

	function _createItem() {

	  var item = document.createElement('div');

	  item.innerHTML = params.templates.item;

	  return du.childObject(item, 0);
	}

	function _setUnfavorited(item) {

	  item.innerHTML = params.templates.unfavorited;
	}

	function _setFavorited(item) {

	  item.innerHTML = params.templates.favorited;
	}

	function _saveFavUids(uids) {

	  var v = JSON.parse(store.get(params.storeKey) || '{}');

	  v[params.agendaUid] = uids;

	  store.set(params.storeKey, (0, _stringify2.default)(v));
	}

	function _getFavUids() {

	  var v = JSON.parse(store.get(params.storeKey) || '{}');

	  return v[params.agendaUid] || [];
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {;(function(win){
		var store = {},
			doc = win.document,
			localStorageName = 'localStorage',
			scriptTag = 'script',
			storage

		store.disabled = false
		store.version = '1.3.17'
		store.set = function(key, value) {}
		store.get = function(key, defaultVal) {}
		store.has = function(key) { return store.get(key) !== undefined }
		store.remove = function(key) {}
		store.clear = function() {}
		store.transact = function(key, defaultVal, transactionFn) {
			if (transactionFn == null) {
				transactionFn = defaultVal
				defaultVal = null
			}
			if (defaultVal == null) {
				defaultVal = {}
			}
			var val = store.get(key, defaultVal)
			transactionFn(val)
			store.set(key, val)
		}
		store.getAll = function() {}
		store.forEach = function() {}

		store.serialize = function(value) {
			return JSON.stringify(value)
		}
		store.deserialize = function(value) {
			if (typeof value != 'string') { return undefined }
			try { return JSON.parse(value) }
			catch(e) { return value || undefined }
		}

		// Functions to encapsulate questionable FireFox 3.6.13 behavior
		// when about.config::dom.storage.enabled === false
		// See https://github.com/marcuswestin/store.js/issues#issue/13
		function isLocalStorageNameSupported() {
			try { return (localStorageName in win && win[localStorageName]) }
			catch(err) { return false }
		}

		if (isLocalStorageNameSupported()) {
			storage = win[localStorageName]
			store.set = function(key, val) {
				if (val === undefined) { return store.remove(key) }
				storage.setItem(key, store.serialize(val))
				return val
			}
			store.get = function(key, defaultVal) {
				var val = store.deserialize(storage.getItem(key))
				return (val === undefined ? defaultVal : val)
			}
			store.remove = function(key) { storage.removeItem(key) }
			store.clear = function() { storage.clear() }
			store.getAll = function() {
				var ret = {}
				store.forEach(function(key, val) {
					ret[key] = val
				})
				return ret
			}
			store.forEach = function(callback) {
				for (var i=0; i<storage.length; i++) {
					var key = storage.key(i)
					callback(key, store.get(key))
				}
			}
		} else if (doc.documentElement.addBehavior) {
			var storageOwner,
				storageContainer
			// Since #userData storage applies only to specific paths, we need to
			// somehow link our data to a specific path.  We choose /favicon.ico
			// as a pretty safe option, since all browsers already make a request to
			// this URL anyway and being a 404 will not hurt us here.  We wrap an
			// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
			// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
			// since the iframe access rules appear to allow direct access and
			// manipulation of the document element, even for a 404 page.  This
			// document can be used instead of the current document (which would
			// have been limited to the current path) to perform #userData storage.
			try {
				storageContainer = new ActiveXObject('htmlfile')
				storageContainer.open()
				storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
				storageContainer.close()
				storageOwner = storageContainer.w.frames[0].document
				storage = storageOwner.createElement('div')
			} catch(e) {
				// somehow ActiveXObject instantiation failed (perhaps some special
				// security settings or otherwse), fall back to per-path storage
				storage = doc.createElement('div')
				storageOwner = doc.body
			}
			var withIEStorage = function(storeFunction) {
				return function() {
					var args = Array.prototype.slice.call(arguments, 0)
					args.unshift(storage)
					// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
					// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
					storageOwner.appendChild(storage)
					storage.addBehavior('#default#userData')
					storage.load(localStorageName)
					var result = storeFunction.apply(store, args)
					storageOwner.removeChild(storage)
					return result
				}
			}

			// In IE7, keys cannot start with a digit or contain certain chars.
			// See https://github.com/marcuswestin/store.js/issues/40
			// See https://github.com/marcuswestin/store.js/issues/83
			var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
			function ieKeyFix(key) {
				return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
			}
			store.set = withIEStorage(function(storage, key, val) {
				key = ieKeyFix(key)
				if (val === undefined) { return store.remove(key) }
				storage.setAttribute(key, store.serialize(val))
				storage.save(localStorageName)
				return val
			})
			store.get = withIEStorage(function(storage, key, defaultVal) {
				key = ieKeyFix(key)
				var val = store.deserialize(storage.getAttribute(key))
				return (val === undefined ? defaultVal : val)
			})
			store.remove = withIEStorage(function(storage, key) {
				key = ieKeyFix(key)
				storage.removeAttribute(key)
				storage.save(localStorageName)
			})
			store.clear = withIEStorage(function(storage) {
				var attributes = storage.XMLDocument.documentElement.attributes
				storage.load(localStorageName)
				for (var i=0, attr; attr=attributes[i]; i++) {
					storage.removeAttribute(attr.name)
				}
				storage.save(localStorageName)
			})
			store.getAll = function(storage) {
				var ret = {}
				store.forEach(function(key, val) {
					ret[key] = val
				})
				return ret
			}
			store.forEach = withIEStorage(function(storage, callback) {
				var attributes = storage.XMLDocument.documentElement.attributes
				for (var i=0, attr; attr=attributes[i]; ++i) {
					callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
				}
			})
		}

		try {
			var testKey = '__storejs__'
			store.set(testKey, testKey)
			if (store.get(testKey) != testKey) { store.disabled = true }
			store.remove(testKey)
		} catch(e) {
			store.disabled = true
		}
		store.enabled = !store.disabled

		if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
		else if (true) { !(__WEBPACK_AMD_DEFINE_FACTORY__ = (store), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) }
		else { win.store = store }

	})(Function('return this')());

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./../webpack/buildin/module.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))(module)))

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var du = __webpack_require__(16),
	    to = false; // time out ref

	module.exports = {
	  show: show,
	  hide: hide,
	  setContent: setContent
	};

	var params = {
	  template: ['<div class="edge-bar fixed-bottom">', '<ul class="edge-list">', '<li class="edge-item">', '<span class="edge-info">{content}</span>', '</li>', '</ul>', '</div>'].join('')
	},
	    elem,
	    content;

	function setContent(c) {

	  content = c;
	}

	function show(time) {

	  if (to) clearTimeout(to);

	  _display();

	  if (time) {

	    to = setTimeout(function () {

	      hide();
	    }, time);
	  }
	}

	function hide() {

	  if (!elem) return;

	  du.el('body').removeChild(elem);

	  elem = false;
	}

	function _display() {

	  if (elem) hide();

	  elem = document.createElement('div');

	  elem.innerHTML = params.template.replace('{content}', content);

	  elem = du.childObject(elem, 0);

	  du.el('body').appendChild(elem);
	}

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = {
		"You have now %count% events in your selection": "Vous avez %count% événements dans votre sélection",
		"clear": "supprimer",
		"export": "exporter"
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (labelSet) {

	  return function (label, values) {

	    if (!values) values = {};

	    var translation = label;

	    if (labelSet && labelSet[label]) {

	      translation = labelSet[label];
	    }

	    for (var key in values) {

	      translation = translation.replace(key, values[key]);
	    }

	    return translation;
	  };
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Masonry v3.3.0
	 * Cascading grid layout library
	 * http://masonry.desandro.com
	 * MIT License
	 * by David DeSandro
	 */

	( function( window, factory ) {
	  'use strict';
	  // universal module definition
	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"outlayer/outlayer\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"get-size/get-size\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"fizzy-ui-utils/utils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())
	      ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof exports === 'object' ) {
	    // CommonJS
	    module.exports = factory(
	      require('outlayer'),
	      require('get-size'),
	      require('fizzy-ui-utils')
	    );
	  } else {
	    // browser global
	    window.Masonry = factory(
	      window.Outlayer,
	      window.getSize,
	      window.fizzyUIUtils
	    );
	  }

	}( window, function factory( Outlayer, getSize, utils ) {

	'use strict';

	// -------------------------- masonryDefinition -------------------------- //

	  // create an Outlayer layout class
	  var Masonry = Outlayer.create('masonry');

	  Masonry.prototype._resetLayout = function() {
	    this.getSize();
	    this._getMeasurement( 'columnWidth', 'outerWidth' );
	    this._getMeasurement( 'gutter', 'outerWidth' );
	    this.measureColumns();

	    // reset column Y
	    var i = this.cols;
	    this.colYs = [];
	    while (i--) {
	      this.colYs.push( 0 );
	    }

	    this.maxY = 0;
	  };

	  Masonry.prototype.measureColumns = function() {
	    this.getContainerWidth();
	    // if columnWidth is 0, default to outerWidth of first item
	    if ( !this.columnWidth ) {
	      var firstItem = this.items[0];
	      var firstItemElem = firstItem && firstItem.element;
	      // columnWidth fall back to item of first element
	      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
	        // if first elem has no width, default to size of container
	        this.containerWidth;
	    }

	    var columnWidth = this.columnWidth += this.gutter;

	    // calculate columns
	    var containerWidth = this.containerWidth + this.gutter;
	    var cols = containerWidth / columnWidth;
	    // fix rounding errors, typically with gutters
	    var excess = columnWidth - containerWidth % columnWidth;
	    // if overshoot is less than a pixel, round up, otherwise floor it
	    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
	    cols = Math[ mathMethod ]( cols );
	    this.cols = Math.max( cols, 1 );
	  };

	  Masonry.prototype.getContainerWidth = function() {
	    // container is parent if fit width
	    var container = this.options.isFitWidth ? this.element.parentNode : this.element;
	    // check that this.size and size are there
	    // IE8 triggers resize on body size change, so they might not be
	    var size = getSize( container );
	    this.containerWidth = size && size.innerWidth;
	  };

	  Masonry.prototype._getItemLayoutPosition = function( item ) {
	    item.getSize();
	    // how many columns does this brick span
	    var remainder = item.size.outerWidth % this.columnWidth;
	    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
	    // round if off by 1 pixel, otherwise use ceil
	    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
	    colSpan = Math.min( colSpan, this.cols );

	    var colGroup = this._getColGroup( colSpan );
	    // get the minimum Y value from the columns
	    var minimumY = Math.min.apply( Math, colGroup );
	    var shortColIndex = utils.indexOf( colGroup, minimumY );

	    // position the brick
	    var position = {
	      x: this.columnWidth * shortColIndex,
	      y: minimumY
	    };

	    // apply setHeight to necessary columns
	    var setHeight = minimumY + item.size.outerHeight;
	    var setSpan = this.cols + 1 - colGroup.length;
	    for ( var i = 0; i < setSpan; i++ ) {
	      this.colYs[ shortColIndex + i ] = setHeight;
	    }

	    return position;
	  };

	  /**
	   * @param {Number} colSpan - number of columns the element spans
	   * @returns {Array} colGroup
	   */
	  Masonry.prototype._getColGroup = function( colSpan ) {
	    if ( colSpan < 2 ) {
	      // if brick spans only one column, use all the column Ys
	      return this.colYs;
	    }

	    var colGroup = [];
	    // how many different places could this brick fit horizontally
	    var groupCount = this.cols + 1 - colSpan;
	    // for each group potential horizontal position
	    for ( var i = 0; i < groupCount; i++ ) {
	      // make an array of colY values for that one group
	      var groupColYs = this.colYs.slice( i, i + colSpan );
	      // and get the max value of the array
	      colGroup[i] = Math.max.apply( Math, groupColYs );
	    }
	    return colGroup;
	  };

	  Masonry.prototype._manageStamp = function( stamp ) {
	    var stampSize = getSize( stamp );
	    var offset = this._getElementOffset( stamp );
	    // get the columns that this stamp affects
	    var firstX = this.options.isOriginLeft ? offset.left : offset.right;
	    var lastX = firstX + stampSize.outerWidth;
	    var firstCol = Math.floor( firstX / this.columnWidth );
	    firstCol = Math.max( 0, firstCol );
	    var lastCol = Math.floor( lastX / this.columnWidth );
	    // lastCol should not go over if multiple of columnWidth #425
	    lastCol -= lastX % this.columnWidth ? 0 : 1;
	    lastCol = Math.min( this.cols - 1, lastCol );
	    // set colYs to bottom of the stamp
	    var stampMaxY = ( this.options.isOriginTop ? offset.top : offset.bottom ) +
	      stampSize.outerHeight;
	    for ( var i = firstCol; i <= lastCol; i++ ) {
	      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
	    }
	  };

	  Masonry.prototype._getContainerSize = function() {
	    this.maxY = Math.max.apply( Math, this.colYs );
	    var size = {
	      height: this.maxY
	    };

	    if ( this.options.isFitWidth ) {
	      size.width = this._getContainerFitWidth();
	    }

	    return size;
	  };

	  Masonry.prototype._getContainerFitWidth = function() {
	    var unusedCols = 0;
	    // count unused columns
	    var i = this.cols;
	    while ( --i ) {
	      if ( this.colYs[i] !== 0 ) {
	        break;
	      }
	      unusedCols++;
	    }
	    // fit container to columns that have been used
	    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
	  };

	  Masonry.prototype.needsResizeLayout = function() {
	    var previousWidth = this.containerWidth;
	    this.getContainerWidth();
	    return previousWidth !== this.containerWidth;
	  };

	  return Masonry;

	}));


/***/ }
/******/ ]);