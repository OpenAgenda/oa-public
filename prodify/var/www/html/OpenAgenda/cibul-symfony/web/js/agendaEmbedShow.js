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

	var controllers = __webpack_require__(4),
	    embedded = __webpack_require__(86),
	    domUtils = __webpack_require__(91),
	    facebookEmbedded = __webpack_require__(93),
	    debug = __webpack_require__(5),
	    log,
	    activeFilters = __webpack_require__(94),
	    list = __webpack_require__(108),
	    cn = __webpack_require__(8),
	    handler,
	    favorites = __webpack_require__(117),
	    Masonry = __webpack_require__(123),
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

	  _copyToSearch();

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

	function _copyToSearch() {

	  var query = window.location.href.split('?');

	  if (!query.length == 2) return;

	  query = query[1];

	  cn.forEach(cn.els(params.selectors.searchLinks) || [], function (el) {

	    el.setAttribute('href', el.getAttribute('href').split('?')[0] + '?' + query);
	  });
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

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(3)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	"user strict";

	/**
	 * handle widget registration to page controllers
	 */

	if (!window.cibul) {

	  var debug = __webpack_require__(5),
	      cn = __webpack_require__(8),
	      controller = __webpack_require__(76);

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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(6);
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(7);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 's':
	      return n * s;
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(9);

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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(10);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(60);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(11), __esModule: true };

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(12);
	__webpack_require__(55);
	module.exports = __webpack_require__(59).f('iterator');

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(13)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(16)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(14)
	  , defined   = __webpack_require__(15);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(17)
	  , $export        = __webpack_require__(18)
	  , redefine       = __webpack_require__(32)
	  , hide           = __webpack_require__(22)
	  , has            = __webpack_require__(33)
	  , Iterators      = __webpack_require__(34)
	  , $iterCreate    = __webpack_require__(35)
	  , setToStringTag = __webpack_require__(51)
	  , getPrototypeOf = __webpack_require__(53)
	  , ITERATOR       = __webpack_require__(52)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(19)
	  , core      = __webpack_require__(3)
	  , ctx       = __webpack_require__(20)
	  , hide      = __webpack_require__(22)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 19 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(21);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(23)
	  , createDesc = __webpack_require__(31);
	module.exports = __webpack_require__(27) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(24)
	  , IE8_DOM_DEFINE = __webpack_require__(26)
	  , toPrimitive    = __webpack_require__(30)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(27) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(25);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(27) && !__webpack_require__(28)(function(){
	  return Object.defineProperty(__webpack_require__(29)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(28)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(25)
	  , document = __webpack_require__(19).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(25);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(22);

/***/ },
/* 33 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(36)
	  , descriptor     = __webpack_require__(31)
	  , setToStringTag = __webpack_require__(51)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(22)(IteratorPrototype, __webpack_require__(52)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(24)
	  , dPs         = __webpack_require__(37)
	  , enumBugKeys = __webpack_require__(49)
	  , IE_PROTO    = __webpack_require__(46)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(29)('iframe')
	    , i      = enumBugKeys.length
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(50).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(23)
	  , anObject = __webpack_require__(24)
	  , getKeys  = __webpack_require__(38);

	module.exports = __webpack_require__(27) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(39)
	  , enumBugKeys = __webpack_require__(49);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(33)
	  , toIObject    = __webpack_require__(40)
	  , arrayIndexOf = __webpack_require__(43)(false)
	  , IE_PROTO     = __webpack_require__(46)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(41)
	  , defined = __webpack_require__(15);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(42);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(40)
	  , toLength  = __webpack_require__(44)
	  , toIndex   = __webpack_require__(45);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(14)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(14)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(47)('keys')
	  , uid    = __webpack_require__(48);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(19)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(19).document && document.documentElement;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(23).f
	  , has = __webpack_require__(33)
	  , TAG = __webpack_require__(52)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(47)('wks')
	  , uid        = __webpack_require__(48)
	  , Symbol     = __webpack_require__(19).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(33)
	  , toObject    = __webpack_require__(54)
	  , IE_PROTO    = __webpack_require__(46)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(15);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(56);
	var global        = __webpack_require__(19)
	  , hide          = __webpack_require__(22)
	  , Iterators     = __webpack_require__(34)
	  , TO_STRING_TAG = __webpack_require__(52)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(57)
	  , step             = __webpack_require__(58)
	  , Iterators        = __webpack_require__(34)
	  , toIObject        = __webpack_require__(40);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(16)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(52);

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(61), __esModule: true };

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(62);
	__webpack_require__(73);
	__webpack_require__(74);
	__webpack_require__(75);
	module.exports = __webpack_require__(3).Symbol;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(19)
	  , has            = __webpack_require__(33)
	  , DESCRIPTORS    = __webpack_require__(27)
	  , $export        = __webpack_require__(18)
	  , redefine       = __webpack_require__(32)
	  , META           = __webpack_require__(63).KEY
	  , $fails         = __webpack_require__(28)
	  , shared         = __webpack_require__(47)
	  , setToStringTag = __webpack_require__(51)
	  , uid            = __webpack_require__(48)
	  , wks            = __webpack_require__(52)
	  , wksExt         = __webpack_require__(59)
	  , wksDefine      = __webpack_require__(64)
	  , keyOf          = __webpack_require__(65)
	  , enumKeys       = __webpack_require__(66)
	  , isArray        = __webpack_require__(69)
	  , anObject       = __webpack_require__(24)
	  , toIObject      = __webpack_require__(40)
	  , toPrimitive    = __webpack_require__(30)
	  , createDesc     = __webpack_require__(31)
	  , _create        = __webpack_require__(36)
	  , gOPNExt        = __webpack_require__(70)
	  , $GOPD          = __webpack_require__(72)
	  , $DP            = __webpack_require__(23)
	  , $keys          = __webpack_require__(38)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(71).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(68).f  = $propertyIsEnumerable;
	  __webpack_require__(67).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(17)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(22)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(48)('meta')
	  , isObject = __webpack_require__(25)
	  , has      = __webpack_require__(33)
	  , setDesc  = __webpack_require__(23).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(28)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(19)
	  , core           = __webpack_require__(3)
	  , LIBRARY        = __webpack_require__(17)
	  , wksExt         = __webpack_require__(59)
	  , defineProperty = __webpack_require__(23).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(38)
	  , toIObject = __webpack_require__(40);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(38)
	  , gOPS    = __webpack_require__(67)
	  , pIE     = __webpack_require__(68);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 68 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(42);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(40)
	  , gOPN      = __webpack_require__(71).f
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(39)
	  , hiddenKeys = __webpack_require__(49).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(68)
	  , createDesc     = __webpack_require__(31)
	  , toIObject      = __webpack_require__(40)
	  , toPrimitive    = __webpack_require__(30)
	  , has            = __webpack_require__(33)
	  , IE8_DOM_DEFINE = __webpack_require__(26)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(27) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 73 */
/***/ function(module, exports) {

	

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(64)('asyncIterator');

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(64)('observable');

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(5),
	    cn = __webpack_require__(8),
	    remote = __webpack_require__(77),
	    filters = __webpack_require__(78),
	    geoLib = __webpack_require__(79),
	    controlDataFetch = __webpack_require__(80),
	    qs = __webpack_require__(81),
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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(9);

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
/* 78 */
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
/* 79 */
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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var cn = __webpack_require__(8),
	    remote = __webpack_require__(77),
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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(82);


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Stringify = __webpack_require__(83);
	var Parse = __webpack_require__(85);


	// Declare internals

	var internals = {};


	module.exports = {
	    stringify: Stringify,
	    parse: Parse
	};


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(84);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    indices: true
	};


	internals.stringify = function (obj, prefix, options) {

	    if (Utils.isBuffer(obj)) {
	        obj = obj.toString();
	    }
	    else if (obj instanceof Date) {
	        obj = obj.toISOString();
	    }
	    else if (obj === null) {
	        obj = '';
	    }

	    if (typeof obj === 'string' ||
	        typeof obj === 'number' ||
	        typeof obj === 'boolean') {

	        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
	    }

	    var values = [];

	    if (typeof obj === 'undefined') {
	        return values;
	    }

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        if (!options.indices &&
	            Array.isArray(obj)) {

	            values = values.concat(internals.stringify(obj[key], prefix, options));
	        }
	        else {
	            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));
	        }
	    }

	    return values;
	};


	module.exports = function (obj, options) {

	    options = options || {};
	    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
	    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;

	    var keys = [];

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return '';
	    }

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        keys = keys.concat(internals.stringify(obj[key], key, options));
	    }

	    return keys.join(delimiter);
	};


/***/ },
/* 84 */
/***/ function(module, exports) {

	// Load modules


	// Declare internals

	var internals = {};


	exports.arrayToObject = function (source) {

	    var obj = {};
	    for (var i = 0, il = source.length; i < il; ++i) {
	        if (typeof source[i] !== 'undefined') {

	            obj[i] = source[i];
	        }
	    }

	    return obj;
	};


	exports.merge = function (target, source) {

	    if (!source) {
	        return target;
	    }

	    if (typeof source !== 'object') {
	        if (Array.isArray(target)) {
	            target.push(source);
	        }
	        else {
	            target[source] = true;
	        }

	        return target;
	    }

	    if (typeof target !== 'object') {
	        target = [target].concat(source);
	        return target;
	    }

	    if (Array.isArray(target) &&
	        !Array.isArray(source)) {

	        target = exports.arrayToObject(target);
	    }

	    var keys = Object.keys(source);
	    for (var k = 0, kl = keys.length; k < kl; ++k) {
	        var key = keys[k];
	        var value = source[key];

	        if (!target[key]) {
	            target[key] = value;
	        }
	        else {
	            target[key] = exports.merge(target[key], value);
	        }
	    }

	    return target;
	};


	exports.decode = function (str) {

	    try {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    } catch (e) {
	        return str;
	    }
	};


	exports.compact = function (obj, refs) {

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return obj;
	    }

	    refs = refs || [];
	    var lookup = refs.indexOf(obj);
	    if (lookup !== -1) {
	        return refs[lookup];
	    }

	    refs.push(obj);

	    if (Array.isArray(obj)) {
	        var compacted = [];

	        for (var i = 0, il = obj.length; i < il; ++i) {
	            if (typeof obj[i] !== 'undefined') {
	                compacted.push(obj[i]);
	            }
	        }

	        return compacted;
	    }

	    var keys = Object.keys(obj);
	    for (i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        obj[key] = exports.compact(obj[key], refs);
	    }

	    return obj;
	};


	exports.isRegExp = function (obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};


	exports.isBuffer = function (obj) {

	    if (obj === null ||
	        typeof obj === 'undefined') {

	        return false;
	    }

	    return !!(obj.constructor &&
	        obj.constructor.isBuffer &&
	        obj.constructor.isBuffer(obj));
	};


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(84);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    depth: 5,
	    arrayLimit: 20,
	    parameterLimit: 1000
	};


	internals.parseValues = function (str, options) {

	    var obj = {};
	    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

	    for (var i = 0, il = parts.length; i < il; ++i) {
	        var part = parts[i];
	        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

	        if (pos === -1) {
	            obj[Utils.decode(part)] = '';
	        }
	        else {
	            var key = Utils.decode(part.slice(0, pos));
	            var val = Utils.decode(part.slice(pos + 1));

	            if (!obj.hasOwnProperty(key)) {
	                obj[key] = val;
	            }
	            else {
	                obj[key] = [].concat(obj[key]).concat(val);
	            }
	        }
	    }

	    return obj;
	};


	internals.parseObject = function (chain, val, options) {

	    if (!chain.length) {
	        return val;
	    }

	    var root = chain.shift();

	    var obj = {};
	    if (root === '[]') {
	        obj = [];
	        obj = obj.concat(internals.parseObject(chain, val, options));
	    }
	    else {
	        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
	        var index = parseInt(cleanRoot, 10);
	        var indexString = '' + index;
	        if (!isNaN(index) &&
	            root !== cleanRoot &&
	            indexString === cleanRoot &&
	            index >= 0 &&
	            index <= options.arrayLimit) {

	            obj = [];
	            obj[index] = internals.parseObject(chain, val, options);
	        }
	        else {
	            obj[cleanRoot] = internals.parseObject(chain, val, options);
	        }
	    }

	    return obj;
	};


	internals.parseKeys = function (key, val, options) {

	    if (!key) {
	        return;
	    }

	    // The regex chunks

	    var parent = /^([^\[\]]*)/;
	    var child = /(\[[^\[\]]*\])/g;

	    // Get the parent

	    var segment = parent.exec(key);

	    // Don't allow them to overwrite object prototype properties

	    if (Object.prototype.hasOwnProperty(segment[1])) {
	        return;
	    }

	    // Stash the parent if it exists

	    var keys = [];
	    if (segment[1]) {
	        keys.push(segment[1]);
	    }

	    // Loop through children appending to the array until we hit depth

	    var i = 0;
	    while ((segment = child.exec(key)) !== null && i < options.depth) {

	        ++i;
	        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
	            keys.push(segment[1]);
	        }
	    }

	    // If there's a remainder, just add whatever is left

	    if (segment) {
	        keys.push('[' + key.slice(segment.index) + ']');
	    }

	    return internals.parseObject(keys, val, options);
	};


	module.exports = function (str, options) {

	    if (str === '' ||
	        str === null ||
	        typeof str === 'undefined') {

	        return {};
	    }

	    options = options || {};
	    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
	    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
	    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
	    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

	    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
	    var obj = {};

	    // Iterate over the keys and setup the new object

	    var keys = Object.keys(tempObj);
	    for (var i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        var newObj = internals.parseKeys(key, tempObj[key], options);
	        obj = Utils.merge(obj, newObj);
	    }

	    return Utils.compact(obj);
	};


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var frameLink = __webpack_require__(87).frame,
	    debug = __webpack_require__(5),
	    log,
	    cn = __webpack_require__(8),
	    pageHeight = __webpack_require__(88),
	    linkClickController = false;

	module.exports = function (pageOptions) {

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
	};

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
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(5),
	    cn = __webpack_require__(8);

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
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var imagesLoaded = __webpack_require__(89);

	module.exports = {
	  check: check,
	  force: force,
	  setOnChange: setOnChange
	};

	var height,
	    cn = __webpack_require__(8),
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
/* 89 */
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
	      __webpack_require__(90)
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
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * eventie v1.0.6
	 * event binding helper
	 *   eventie.bind( elem, 'click', myFn )
	 *   eventie.unbind( elem, 'click', myFn )
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true */
	/*global define: false, module: false */

	( function( window ) {

	'use strict';

	var docElem = document.documentElement;

	var bind = function() {};

	function getIEEvent( obj ) {
	  var event = window.event;
	  // add event.target
	  event.target = event.target || event.srcElement || obj;
	  return event;
	}

	if ( docElem.addEventListener ) {
	  bind = function( obj, type, fn ) {
	    obj.addEventListener( type, fn, false );
	  };
	} else if ( docElem.attachEvent ) {
	  bind = function( obj, type, fn ) {
	    obj[ type + fn ] = fn.handleEvent ?
	      function() {
	        var event = getIEEvent( obj );
	        fn.handleEvent.call( fn, event );
	      } :
	      function() {
	        var event = getIEEvent( obj );
	        fn.call( obj, event );
	      };
	    obj.attachEvent( "on" + type, obj[ type + fn ] );
	  };
	}

	var unbind = function() {};

	if ( docElem.removeEventListener ) {
	  unbind = function( obj, type, fn ) {
	    obj.removeEventListener( type, fn, false );
	  };
	} else if ( docElem.detachEvent ) {
	  unbind = function( obj, type, fn ) {
	    obj.detachEvent( "on" + type, obj[ type + fn ] );
	    try {
	      delete obj[ type + fn ];
	    } catch ( err ) {
	      // can't delete window object properties
	      obj[ type + fn ] = undefined;
	    }
	  };
	}

	var eventie = {
	  bind: bind,
	  unbind: unbind
	};

	// ----- module definition ----- //

	if ( true ) {
	  // AMD
	  !(__WEBPACK_AMD_DEFINE_FACTORY__ = (eventie), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  // CommonJS
	  module.exports = eventie;
	} else {
	  // browser global
	  window.eventie = eventie;
	}

	})( window );


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(9);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(81),
	    utils = __webpack_require__(92);

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
/* 92 */
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
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__(5),
	    log,
	    cn = __webpack_require__(8),
	    pageHeight = __webpack_require__(88),
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
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.setOnReady = setOnReady;

	var UID = 0,
	    LANG = 1,
	    MODE = 2,
	    cn = __webpack_require__(8),
	    wLib = __webpack_require__(95),
	    debug = __webpack_require__(5),
	    domLib = __webpack_require__(96),
	    config = __webpack_require__(103),
	    dateLabels = __webpack_require__(104),
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

	__webpack_require__(106)(function (register) {

	  wLib.forEachAnchor('.cbpgft', { register: register }, widget);
	});

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var du = __webpack_require__(91),
	    utils = __webpack_require__(92),
	    log = __webpack_require__(5)('widgetLib');

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

	  if (document.readyState === "complete") {

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
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ejs = __webpack_require__(97),
	    cn = __webpack_require__(8),
	    log = __webpack_require__(5)('activeFilter dom'),
	    params = {
	  selectors: {
	    itemsCanvas: 'ul'
	  }
	},
	    templates = {
	  main: __webpack_require__(99),
	  bsMain: __webpack_require__(100),
	  item: __webpack_require__(101),
	  bsItem: __webpack_require__(102)
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
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EJS = __webpack_require__(98);

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
/* 98 */
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
/* 99 */
/***/ function(module, exports) {

	module.exports = "<% if ( filters.length ) { %>\n<ul class=\"active-filters\" <% if ( !enabled ) { %>class=\"disabled\"<% } %>></ul>\n<% } %>"

/***/ },
/* 100 */
/***/ function(module, exports) {

	module.exports = "<ul class=\"nav nav-pills\"></ul>"

/***/ },
/* 101 */
/***/ function(module, exports) {

	module.exports = "<li><span><%= label %></span><a>&#10005</a></li>"

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = "<li class=\"active\"><a href=\"#\"><%= label %></a></li>"

/***/ },
/* 103 */
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var labels = {
	  fr: __webpack_require__(105)
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
/* 105 */
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
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var loadJs = __webpack_require__(107),
	    cn = __webpack_require__(8),
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
/* 107 */
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
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__(5),
	    log,
	    pagination = __webpack_require__(109),
	    partialLoader = __webpack_require__(110),
	    cn = __webpack_require__(8),
	    config = __webpack_require__(111),
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
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var cn = __webpack_require__(8),
	    debug = __webpack_require__(5),
	    log,
	    qs = __webpack_require__(81),
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
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var remote = __webpack_require__(77),
	    cn = __webpack_require__(8),
	    log = __webpack_require__(5)('partialLoader'),
	    qs = __webpack_require__(81),
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
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var deepExtend = __webpack_require__(112),
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
/* 112 */
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(113).Buffer))

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(114)
	var ieee754 = __webpack_require__(115)
	var isArray = __webpack_require__(116)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(113).Buffer, (function() { return this; }())))

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 115 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 116 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var du = __webpack_require__(91),
	    utils = __webpack_require__(92),
	    store = __webpack_require__(118),
	    debug = __webpack_require__(5),
	    log,
	    qs = __webpack_require__(81),
	    bBar = __webpack_require__(120),
	    frLabels = __webpack_require__(121),
	    i18n = __webpack_require__(122),
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
/* 118 */
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(119)(module)))

/***/ },
/* 119 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var du = __webpack_require__(91),
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
/* 121 */
/***/ function(module, exports) {

	module.exports = {
		"You have now %count% events in your selection": "Vous avez %count% événements dans votre sélection",
		"clear": "supprimer",
		"export": "exporter"
	};

/***/ },
/* 122 */
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
/* 123 */
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
	        __webpack_require__(124),
	        __webpack_require__(126),
	        __webpack_require__(127)
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


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Outlayer v1.4.2
	 * the brains and guts of a layout library
	 * MIT license
	 */

	( function( window, factory ) {
	  'use strict';
	  // universal module definition

	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(125),
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"eventEmitter/EventEmitter\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	        __webpack_require__(126),
	        __webpack_require__(127),
	        __webpack_require__(130)
	      ], __WEBPACK_AMD_DEFINE_RESULT__ = function( eventie, EventEmitter, getSize, utils, Item ) {
	        return factory( window, eventie, EventEmitter, getSize, utils, Item);
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof exports == 'object' ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('eventie'),
	      require('wolfy87-eventemitter'),
	      require('get-size'),
	      require('fizzy-ui-utils'),
	      require('./item')
	    );
	  } else {
	    // browser global
	    window.Outlayer = factory(
	      window,
	      window.eventie,
	      window.EventEmitter,
	      window.getSize,
	      window.fizzyUIUtils,
	      window.Outlayer.Item
	    );
	  }

	}( window, function factory( window, eventie, EventEmitter, getSize, utils, Item ) {
	'use strict';

	// ----- vars ----- //

	var console = window.console;
	var jQuery = window.jQuery;
	var noop = function() {};

	// -------------------------- Outlayer -------------------------- //

	// globally unique identifiers
	var GUID = 0;
	// internal store of all Outlayer intances
	var instances = {};


	/**
	 * @param {Element, String} element
	 * @param {Object} options
	 * @constructor
	 */
	function Outlayer( element, options ) {
	  var queryElement = utils.getQueryElement( element );
	  if ( !queryElement ) {
	    if ( console ) {
	      console.error( 'Bad element for ' + this.constructor.namespace +
	        ': ' + ( queryElement || element ) );
	    }
	    return;
	  }
	  this.element = queryElement;
	  // add jQuery
	  if ( jQuery ) {
	    this.$element = jQuery( this.element );
	  }

	  // options
	  this.options = utils.extend( {}, this.constructor.defaults );
	  this.option( options );

	  // add id for Outlayer.getFromElement
	  var id = ++GUID;
	  this.element.outlayerGUID = id; // expando
	  instances[ id ] = this; // associate via id

	  // kick it off
	  this._create();

	  if ( this.options.isInitLayout ) {
	    this.layout();
	  }
	}

	// settings are for internal use only
	Outlayer.namespace = 'outlayer';
	Outlayer.Item = Item;

	// default options
	Outlayer.defaults = {
	  containerStyle: {
	    position: 'relative'
	  },
	  isInitLayout: true,
	  isOriginLeft: true,
	  isOriginTop: true,
	  isResizeBound: true,
	  isResizingContainer: true,
	  // item options
	  transitionDuration: '0.4s',
	  hiddenStyle: {
	    opacity: 0,
	    transform: 'scale(0.001)'
	  },
	  visibleStyle: {
	    opacity: 1,
	    transform: 'scale(1)'
	  }
	};

	// inherit EventEmitter
	utils.extend( Outlayer.prototype, EventEmitter.prototype );

	/**
	 * set options
	 * @param {Object} opts
	 */
	Outlayer.prototype.option = function( opts ) {
	  utils.extend( this.options, opts );
	};

	Outlayer.prototype._create = function() {
	  // get items from children
	  this.reloadItems();
	  // elements that affect layout, but are not laid out
	  this.stamps = [];
	  this.stamp( this.options.stamp );
	  // set container style
	  utils.extend( this.element.style, this.options.containerStyle );

	  // bind resize method
	  if ( this.options.isResizeBound ) {
	    this.bindResize();
	  }
	};

	// goes through all children again and gets bricks in proper order
	Outlayer.prototype.reloadItems = function() {
	  // collection of item elements
	  this.items = this._itemize( this.element.children );
	};


	/**
	 * turn elements into Outlayer.Items to be used in layout
	 * @param {Array or NodeList or HTMLElement} elems
	 * @returns {Array} items - collection of new Outlayer Items
	 */
	Outlayer.prototype._itemize = function( elems ) {

	  var itemElems = this._filterFindItemElements( elems );
	  var Item = this.constructor.Item;

	  // create new Outlayer Items for collection
	  var items = [];
	  for ( var i=0, len = itemElems.length; i < len; i++ ) {
	    var elem = itemElems[i];
	    var item = new Item( elem, this );
	    items.push( item );
	  }

	  return items;
	};

	/**
	 * get item elements to be used in layout
	 * @param {Array or NodeList or HTMLElement} elems
	 * @returns {Array} items - item elements
	 */
	Outlayer.prototype._filterFindItemElements = function( elems ) {
	  return utils.filterFindElements( elems, this.options.itemSelector );
	};

	/**
	 * getter method for getting item elements
	 * @returns {Array} elems - collection of item elements
	 */
	Outlayer.prototype.getItemElements = function() {
	  var elems = [];
	  for ( var i=0, len = this.items.length; i < len; i++ ) {
	    elems.push( this.items[i].element );
	  }
	  return elems;
	};

	// ----- init & layout ----- //

	/**
	 * lays out all items
	 */
	Outlayer.prototype.layout = function() {
	  this._resetLayout();
	  this._manageStamps();

	  // don't animate first layout
	  var isInstant = this.options.isLayoutInstant !== undefined ?
	    this.options.isLayoutInstant : !this._isLayoutInited;
	  this.layoutItems( this.items, isInstant );

	  // flag for initalized
	  this._isLayoutInited = true;
	};

	// _init is alias for layout
	Outlayer.prototype._init = Outlayer.prototype.layout;

	/**
	 * logic before any new layout
	 */
	Outlayer.prototype._resetLayout = function() {
	  this.getSize();
	};


	Outlayer.prototype.getSize = function() {
	  this.size = getSize( this.element );
	};

	/**
	 * get measurement from option, for columnWidth, rowHeight, gutter
	 * if option is String -> get element from selector string, & get size of element
	 * if option is Element -> get size of element
	 * else use option as a number
	 *
	 * @param {String} measurement
	 * @param {String} size - width or height
	 * @private
	 */
	Outlayer.prototype._getMeasurement = function( measurement, size ) {
	  var option = this.options[ measurement ];
	  var elem;
	  if ( !option ) {
	    // default to 0
	    this[ measurement ] = 0;
	  } else {
	    // use option as an element
	    if ( typeof option === 'string' ) {
	      elem = this.element.querySelector( option );
	    } else if ( utils.isElement( option ) ) {
	      elem = option;
	    }
	    // use size of element, if element
	    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
	  }
	};

	/**
	 * layout a collection of item elements
	 * @api public
	 */
	Outlayer.prototype.layoutItems = function( items, isInstant ) {
	  items = this._getItemsForLayout( items );

	  this._layoutItems( items, isInstant );

	  this._postLayout();
	};

	/**
	 * get the items to be laid out
	 * you may want to skip over some items
	 * @param {Array} items
	 * @returns {Array} items
	 */
	Outlayer.prototype._getItemsForLayout = function( items ) {
	  var layoutItems = [];
	  for ( var i=0, len = items.length; i < len; i++ ) {
	    var item = items[i];
	    if ( !item.isIgnored ) {
	      layoutItems.push( item );
	    }
	  }
	  return layoutItems;
	};

	/**
	 * layout items
	 * @param {Array} items
	 * @param {Boolean} isInstant
	 */
	Outlayer.prototype._layoutItems = function( items, isInstant ) {
	  this._emitCompleteOnItems( 'layout', items );

	  if ( !items || !items.length ) {
	    // no items, emit event with empty array
	    return;
	  }

	  var queue = [];

	  for ( var i=0, len = items.length; i < len; i++ ) {
	    var item = items[i];
	    // get x/y object from method
	    var position = this._getItemLayoutPosition( item );
	    // enqueue
	    position.item = item;
	    position.isInstant = isInstant || item.isLayoutInstant;
	    queue.push( position );
	  }

	  this._processLayoutQueue( queue );
	};

	/**
	 * get item layout position
	 * @param {Outlayer.Item} item
	 * @returns {Object} x and y position
	 */
	Outlayer.prototype._getItemLayoutPosition = function( /* item */ ) {
	  return {
	    x: 0,
	    y: 0
	  };
	};

	/**
	 * iterate over array and position each item
	 * Reason being - separating this logic prevents 'layout invalidation'
	 * thx @paul_irish
	 * @param {Array} queue
	 */
	Outlayer.prototype._processLayoutQueue = function( queue ) {
	  for ( var i=0, len = queue.length; i < len; i++ ) {
	    var obj = queue[i];
	    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant );
	  }
	};

	/**
	 * Sets position of item in DOM
	 * @param {Outlayer.Item} item
	 * @param {Number} x - horizontal position
	 * @param {Number} y - vertical position
	 * @param {Boolean} isInstant - disables transitions
	 */
	Outlayer.prototype._positionItem = function( item, x, y, isInstant ) {
	  if ( isInstant ) {
	    // if not transition, just set CSS
	    item.goTo( x, y );
	  } else {
	    item.moveTo( x, y );
	  }
	};

	/**
	 * Any logic you want to do after each layout,
	 * i.e. size the container
	 */
	Outlayer.prototype._postLayout = function() {
	  this.resizeContainer();
	};

	Outlayer.prototype.resizeContainer = function() {
	  if ( !this.options.isResizingContainer ) {
	    return;
	  }
	  var size = this._getContainerSize();
	  if ( size ) {
	    this._setContainerMeasure( size.width, true );
	    this._setContainerMeasure( size.height, false );
	  }
	};

	/**
	 * Sets width or height of container if returned
	 * @returns {Object} size
	 *   @param {Number} width
	 *   @param {Number} height
	 */
	Outlayer.prototype._getContainerSize = noop;

	/**
	 * @param {Number} measure - size of width or height
	 * @param {Boolean} isWidth
	 */
	Outlayer.prototype._setContainerMeasure = function( measure, isWidth ) {
	  if ( measure === undefined ) {
	    return;
	  }

	  var elemSize = this.size;
	  // add padding and border width if border box
	  if ( elemSize.isBorderBox ) {
	    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
	      elemSize.borderLeftWidth + elemSize.borderRightWidth :
	      elemSize.paddingBottom + elemSize.paddingTop +
	      elemSize.borderTopWidth + elemSize.borderBottomWidth;
	  }

	  measure = Math.max( measure, 0 );
	  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
	};

	/**
	 * emit eventComplete on a collection of items events
	 * @param {String} eventName
	 * @param {Array} items - Outlayer.Items
	 */
	Outlayer.prototype._emitCompleteOnItems = function( eventName, items ) {
	  var _this = this;
	  function onComplete() {
	    _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
	  }

	  var count = items.length;
	  if ( !items || !count ) {
	    onComplete();
	    return;
	  }

	  var doneCount = 0;
	  function tick() {
	    doneCount++;
	    if ( doneCount === count ) {
	      onComplete();
	    }
	  }

	  // bind callback
	  for ( var i=0, len = items.length; i < len; i++ ) {
	    var item = items[i];
	    item.once( eventName, tick );
	  }
	};

	/**
	 * emits events via eventEmitter and jQuery events
	 * @param {String} type - name of event
	 * @param {Event} event - original event
	 * @param {Array} args - extra arguments
	 */
	Outlayer.prototype.dispatchEvent = function( type, event, args ) {
	  // add original event to arguments
	  var emitArgs = event ? [ event ].concat( args ) : args;
	  this.emitEvent( type, emitArgs );

	  if ( jQuery ) {
	    // set this.$element
	    this.$element = this.$element || jQuery( this.element );
	    if ( event ) {
	      // create jQuery event
	      var $event = jQuery.Event( event );
	      $event.type = type;
	      this.$element.trigger( $event, args );
	    } else {
	      // just trigger with type if no event available
	      this.$element.trigger( type, args );
	    }
	  }
	};

	// -------------------------- ignore & stamps -------------------------- //


	/**
	 * keep item in collection, but do not lay it out
	 * ignored items do not get skipped in layout
	 * @param {Element} elem
	 */
	Outlayer.prototype.ignore = function( elem ) {
	  var item = this.getItem( elem );
	  if ( item ) {
	    item.isIgnored = true;
	  }
	};

	/**
	 * return item to layout collection
	 * @param {Element} elem
	 */
	Outlayer.prototype.unignore = function( elem ) {
	  var item = this.getItem( elem );
	  if ( item ) {
	    delete item.isIgnored;
	  }
	};

	/**
	 * adds elements to stamps
	 * @param {NodeList, Array, Element, or String} elems
	 */
	Outlayer.prototype.stamp = function( elems ) {
	  elems = this._find( elems );
	  if ( !elems ) {
	    return;
	  }

	  this.stamps = this.stamps.concat( elems );
	  // ignore
	  for ( var i=0, len = elems.length; i < len; i++ ) {
	    var elem = elems[i];
	    this.ignore( elem );
	  }
	};

	/**
	 * removes elements to stamps
	 * @param {NodeList, Array, or Element} elems
	 */
	Outlayer.prototype.unstamp = function( elems ) {
	  elems = this._find( elems );
	  if ( !elems ){
	    return;
	  }

	  for ( var i=0, len = elems.length; i < len; i++ ) {
	    var elem = elems[i];
	    // filter out removed stamp elements
	    utils.removeFrom( this.stamps, elem );
	    this.unignore( elem );
	  }

	};

	/**
	 * finds child elements
	 * @param {NodeList, Array, Element, or String} elems
	 * @returns {Array} elems
	 */
	Outlayer.prototype._find = function( elems ) {
	  if ( !elems ) {
	    return;
	  }
	  // if string, use argument as selector string
	  if ( typeof elems === 'string' ) {
	    elems = this.element.querySelectorAll( elems );
	  }
	  elems = utils.makeArray( elems );
	  return elems;
	};

	Outlayer.prototype._manageStamps = function() {
	  if ( !this.stamps || !this.stamps.length ) {
	    return;
	  }

	  this._getBoundingRect();

	  for ( var i=0, len = this.stamps.length; i < len; i++ ) {
	    var stamp = this.stamps[i];
	    this._manageStamp( stamp );
	  }
	};

	// update boundingLeft / Top
	Outlayer.prototype._getBoundingRect = function() {
	  // get bounding rect for container element
	  var boundingRect = this.element.getBoundingClientRect();
	  var size = this.size;
	  this._boundingRect = {
	    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
	    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
	    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
	    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
	  };
	};

	/**
	 * @param {Element} stamp
	**/
	Outlayer.prototype._manageStamp = noop;

	/**
	 * get x/y position of element relative to container element
	 * @param {Element} elem
	 * @returns {Object} offset - has left, top, right, bottom
	 */
	Outlayer.prototype._getElementOffset = function( elem ) {
	  var boundingRect = elem.getBoundingClientRect();
	  var thisRect = this._boundingRect;
	  var size = getSize( elem );
	  var offset = {
	    left: boundingRect.left - thisRect.left - size.marginLeft,
	    top: boundingRect.top - thisRect.top - size.marginTop,
	    right: thisRect.right - boundingRect.right - size.marginRight,
	    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
	  };
	  return offset;
	};

	// -------------------------- resize -------------------------- //

	// enable event handlers for listeners
	// i.e. resize -> onresize
	Outlayer.prototype.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	/**
	 * Bind layout to window resizing
	 */
	Outlayer.prototype.bindResize = function() {
	  // bind just one listener
	  if ( this.isResizeBound ) {
	    return;
	  }
	  eventie.bind( window, 'resize', this );
	  this.isResizeBound = true;
	};

	/**
	 * Unbind layout to window resizing
	 */
	Outlayer.prototype.unbindResize = function() {
	  if ( this.isResizeBound ) {
	    eventie.unbind( window, 'resize', this );
	  }
	  this.isResizeBound = false;
	};

	// original debounce by John Hann
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

	// this fires every resize
	Outlayer.prototype.onresize = function() {
	  if ( this.resizeTimeout ) {
	    clearTimeout( this.resizeTimeout );
	  }

	  var _this = this;
	  function delayed() {
	    _this.resize();
	    delete _this.resizeTimeout;
	  }

	  this.resizeTimeout = setTimeout( delayed, 100 );
	};

	// debounced, layout on resize
	Outlayer.prototype.resize = function() {
	  // don't trigger if size did not change
	  // or if resize was unbound. See #9
	  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
	    return;
	  }

	  this.layout();
	};

	/**
	 * check if layout is needed post layout
	 * @returns Boolean
	 */
	Outlayer.prototype.needsResizeLayout = function() {
	  var size = getSize( this.element );
	  // check that this.size and size are there
	  // IE8 triggers resize on body size change, so they might not be
	  var hasSizes = this.size && size;
	  return hasSizes && size.innerWidth !== this.size.innerWidth;
	};

	// -------------------------- methods -------------------------- //

	/**
	 * add items to Outlayer instance
	 * @param {Array or NodeList or Element} elems
	 * @returns {Array} items - Outlayer.Items
	**/
	Outlayer.prototype.addItems = function( elems ) {
	  var items = this._itemize( elems );
	  // add items to collection
	  if ( items.length ) {
	    this.items = this.items.concat( items );
	  }
	  return items;
	};

	/**
	 * Layout newly-appended item elements
	 * @param {Array or NodeList or Element} elems
	 */
	Outlayer.prototype.appended = function( elems ) {
	  var items = this.addItems( elems );
	  if ( !items.length ) {
	    return;
	  }
	  // layout and reveal just the new items
	  this.layoutItems( items, true );
	  this.reveal( items );
	};

	/**
	 * Layout prepended elements
	 * @param {Array or NodeList or Element} elems
	 */
	Outlayer.prototype.prepended = function( elems ) {
	  var items = this._itemize( elems );
	  if ( !items.length ) {
	    return;
	  }
	  // add items to beginning of collection
	  var previousItems = this.items.slice(0);
	  this.items = items.concat( previousItems );
	  // start new layout
	  this._resetLayout();
	  this._manageStamps();
	  // layout new stuff without transition
	  this.layoutItems( items, true );
	  this.reveal( items );
	  // layout previous items
	  this.layoutItems( previousItems );
	};

	/**
	 * reveal a collection of items
	 * @param {Array of Outlayer.Items} items
	 */
	Outlayer.prototype.reveal = function( items ) {
	  this._emitCompleteOnItems( 'reveal', items );

	  var len = items && items.length;
	  for ( var i=0; len && i < len; i++ ) {
	    var item = items[i];
	    item.reveal();
	  }
	};

	/**
	 * hide a collection of items
	 * @param {Array of Outlayer.Items} items
	 */
	Outlayer.prototype.hide = function( items ) {
	  this._emitCompleteOnItems( 'hide', items );

	  var len = items && items.length;
	  for ( var i=0; len && i < len; i++ ) {
	    var item = items[i];
	    item.hide();
	  }
	};

	/**
	 * reveal item elements
	 * @param {Array}, {Element}, {NodeList} items
	 */
	Outlayer.prototype.revealItemElements = function( elems ) {
	  var items = this.getItems( elems );
	  this.reveal( items );
	};

	/**
	 * hide item elements
	 * @param {Array}, {Element}, {NodeList} items
	 */
	Outlayer.prototype.hideItemElements = function( elems ) {
	  var items = this.getItems( elems );
	  this.hide( items );
	};

	/**
	 * get Outlayer.Item, given an Element
	 * @param {Element} elem
	 * @param {Function} callback
	 * @returns {Outlayer.Item} item
	 */
	Outlayer.prototype.getItem = function( elem ) {
	  // loop through items to get the one that matches
	  for ( var i=0, len = this.items.length; i < len; i++ ) {
	    var item = this.items[i];
	    if ( item.element === elem ) {
	      // return item
	      return item;
	    }
	  }
	};

	/**
	 * get collection of Outlayer.Items, given Elements
	 * @param {Array} elems
	 * @returns {Array} items - Outlayer.Items
	 */
	Outlayer.prototype.getItems = function( elems ) {
	  elems = utils.makeArray( elems );
	  var items = [];
	  for ( var i=0, len = elems.length; i < len; i++ ) {
	    var elem = elems[i];
	    var item = this.getItem( elem );
	    if ( item ) {
	      items.push( item );
	    }
	  }

	  return items;
	};

	/**
	 * remove element(s) from instance and DOM
	 * @param {Array or NodeList or Element} elems
	 */
	Outlayer.prototype.remove = function( elems ) {
	  var removeItems = this.getItems( elems );

	  this._emitCompleteOnItems( 'remove', removeItems );

	  // bail if no items to remove
	  if ( !removeItems || !removeItems.length ) {
	    return;
	  }

	  for ( var i=0, len = removeItems.length; i < len; i++ ) {
	    var item = removeItems[i];
	    item.remove();
	    // remove item from collection
	    utils.removeFrom( this.items, item );
	  }
	};

	// ----- destroy ----- //

	// remove and disable Outlayer instance
	Outlayer.prototype.destroy = function() {
	  // clean up dynamic styles
	  var style = this.element.style;
	  style.height = '';
	  style.position = '';
	  style.width = '';
	  // destroy items
	  for ( var i=0, len = this.items.length; i < len; i++ ) {
	    var item = this.items[i];
	    item.destroy();
	  }

	  this.unbindResize();

	  var id = this.element.outlayerGUID;
	  delete instances[ id ]; // remove reference to instance by id
	  delete this.element.outlayerGUID;
	  // remove data for jQuery
	  if ( jQuery ) {
	    jQuery.removeData( this.element, this.constructor.namespace );
	  }

	};

	// -------------------------- data -------------------------- //

	/**
	 * get Outlayer instance from element
	 * @param {Element} elem
	 * @returns {Outlayer}
	 */
	Outlayer.data = function( elem ) {
	  elem = utils.getQueryElement( elem );
	  var id = elem && elem.outlayerGUID;
	  return id && instances[ id ];
	};


	// -------------------------- create Outlayer class -------------------------- //

	/**
	 * create a layout class
	 * @param {String} namespace
	 */
	Outlayer.create = function( namespace, options ) {
	  // sub-class Outlayer
	  function Layout() {
	    Outlayer.apply( this, arguments );
	  }
	  // inherit Outlayer prototype, use Object.create if there
	  if ( Object.create ) {
	    Layout.prototype = Object.create( Outlayer.prototype );
	  } else {
	    utils.extend( Layout.prototype, Outlayer.prototype );
	  }
	  // set contructor, used for namespace and Item
	  Layout.prototype.constructor = Layout;

	  Layout.defaults = utils.extend( {}, Outlayer.defaults );
	  // apply new options
	  utils.extend( Layout.defaults, options );
	  // keep prototype.settings for backwards compatibility (Packery v1.2.0)
	  Layout.prototype.settings = {};

	  Layout.namespace = namespace;

	  Layout.data = Outlayer.data;

	  // sub-class Item
	  Layout.Item = function LayoutItem() {
	    Item.apply( this, arguments );
	  };

	  Layout.Item.prototype = new Item();

	  // -------------------------- declarative -------------------------- //

	  utils.htmlInit( Layout, namespace );

	  // -------------------------- jQuery bridge -------------------------- //

	  // make into jQuery plugin
	  if ( jQuery && jQuery.bridget ) {
	    jQuery.bridget( namespace, Layout );
	  }

	  return Layout;
	};

	// ----- fin ----- //

	// back in global
	Outlayer.Item = Item;

	return Outlayer;

	}));



/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * eventie v1.0.6
	 * event binding helper
	 *   eventie.bind( elem, 'click', myFn )
	 *   eventie.unbind( elem, 'click', myFn )
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true */
	/*global define: false, module: false */

	( function( window ) {

	'use strict';

	var docElem = document.documentElement;

	var bind = function() {};

	function getIEEvent( obj ) {
	  var event = window.event;
	  // add event.target
	  event.target = event.target || event.srcElement || obj;
	  return event;
	}

	if ( docElem.addEventListener ) {
	  bind = function( obj, type, fn ) {
	    obj.addEventListener( type, fn, false );
	  };
	} else if ( docElem.attachEvent ) {
	  bind = function( obj, type, fn ) {
	    obj[ type + fn ] = fn.handleEvent ?
	      function() {
	        var event = getIEEvent( obj );
	        fn.handleEvent.call( fn, event );
	      } :
	      function() {
	        var event = getIEEvent( obj );
	        fn.call( obj, event );
	      };
	    obj.attachEvent( "on" + type, obj[ type + fn ] );
	  };
	}

	var unbind = function() {};

	if ( docElem.removeEventListener ) {
	  unbind = function( obj, type, fn ) {
	    obj.removeEventListener( type, fn, false );
	  };
	} else if ( docElem.detachEvent ) {
	  unbind = function( obj, type, fn ) {
	    obj.detachEvent( "on" + type, obj[ type + fn ] );
	    try {
	      delete obj[ type + fn ];
	    } catch ( err ) {
	      // can't delete window object properties
	      obj[ type + fn ] = undefined;
	    }
	  };
	}

	var eventie = {
	  bind: bind,
	  unbind: unbind
	};

	// ----- module definition ----- //

	if ( true ) {
	  // AMD
	  !(__WEBPACK_AMD_DEFINE_FACTORY__ = (eventie), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  // CommonJS
	  module.exports = eventie;
	} else {
	  // browser global
	  window.eventie = eventie;
	}

	})( window );


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * getSize v1.2.2
	 * measure size of elements
	 * MIT license
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true */
	/*global define: false, exports: false, require: false, module: false, console: false */

	( function( window, undefined ) {

	'use strict';

	// -------------------------- helpers -------------------------- //

	// get a number from a string, not a percentage
	function getStyleSize( value ) {
	  var num = parseFloat( value );
	  // not a percent like '100%', and a number
	  var isValid = value.indexOf('%') === -1 && !isNaN( num );
	  return isValid && num;
	}

	function noop() {}

	var logError = typeof console === 'undefined' ? noop :
	  function( message ) {
	    console.error( message );
	  };

	// -------------------------- measurements -------------------------- //

	var measurements = [
	  'paddingLeft',
	  'paddingRight',
	  'paddingTop',
	  'paddingBottom',
	  'marginLeft',
	  'marginRight',
	  'marginTop',
	  'marginBottom',
	  'borderLeftWidth',
	  'borderRightWidth',
	  'borderTopWidth',
	  'borderBottomWidth'
	];

	function getZeroSize() {
	  var size = {
	    width: 0,
	    height: 0,
	    innerWidth: 0,
	    innerHeight: 0,
	    outerWidth: 0,
	    outerHeight: 0
	  };
	  for ( var i=0, len = measurements.length; i < len; i++ ) {
	    var measurement = measurements[i];
	    size[ measurement ] = 0;
	  }
	  return size;
	}



	function defineGetSize( getStyleProperty ) {

	// -------------------------- setup -------------------------- //

	var isSetup = false;

	var getStyle, boxSizingProp, isBoxSizeOuter;

	/**
	 * setup vars and functions
	 * do it on initial getSize(), rather than on script load
	 * For Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=548397
	 */
	function setup() {
	  // setup once
	  if ( isSetup ) {
	    return;
	  }
	  isSetup = true;

	  var getComputedStyle = window.getComputedStyle;
	  getStyle = ( function() {
	    var getStyleFn = getComputedStyle ?
	      function( elem ) {
	        return getComputedStyle( elem, null );
	      } :
	      function( elem ) {
	        return elem.currentStyle;
	      };

	      return function getStyle( elem ) {
	        var style = getStyleFn( elem );
	        if ( !style ) {
	          logError( 'Style returned ' + style +
	            '. Are you running this code in a hidden iframe on Firefox? ' +
	            'See http://bit.ly/getsizebug1' );
	        }
	        return style;
	      };
	  })();

	  // -------------------------- box sizing -------------------------- //

	  boxSizingProp = getStyleProperty('boxSizing');

	  /**
	   * WebKit measures the outer-width on style.width on border-box elems
	   * IE & Firefox measures the inner-width
	   */
	  if ( boxSizingProp ) {
	    var div = document.createElement('div');
	    div.style.width = '200px';
	    div.style.padding = '1px 2px 3px 4px';
	    div.style.borderStyle = 'solid';
	    div.style.borderWidth = '1px 2px 3px 4px';
	    div.style[ boxSizingProp ] = 'border-box';

	    var body = document.body || document.documentElement;
	    body.appendChild( div );
	    var style = getStyle( div );

	    isBoxSizeOuter = getStyleSize( style.width ) === 200;
	    body.removeChild( div );
	  }

	}

	// -------------------------- getSize -------------------------- //

	function getSize( elem ) {
	  setup();

	  // use querySeletor if elem is string
	  if ( typeof elem === 'string' ) {
	    elem = document.querySelector( elem );
	  }

	  // do not proceed on non-objects
	  if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
	    return;
	  }

	  var style = getStyle( elem );

	  // if hidden, everything is 0
	  if ( style.display === 'none' ) {
	    return getZeroSize();
	  }

	  var size = {};
	  size.width = elem.offsetWidth;
	  size.height = elem.offsetHeight;

	  var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
	    style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

	  // get all measurements
	  for ( var i=0, len = measurements.length; i < len; i++ ) {
	    var measurement = measurements[i];
	    var value = style[ measurement ];
	    value = mungeNonPixel( elem, value );
	    var num = parseFloat( value );
	    // any 'auto', 'medium' value will be 0
	    size[ measurement ] = !isNaN( num ) ? num : 0;
	  }

	  var paddingWidth = size.paddingLeft + size.paddingRight;
	  var paddingHeight = size.paddingTop + size.paddingBottom;
	  var marginWidth = size.marginLeft + size.marginRight;
	  var marginHeight = size.marginTop + size.marginBottom;
	  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
	  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

	  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

	  // overwrite width and height if we can get it from style
	  var styleWidth = getStyleSize( style.width );
	  if ( styleWidth !== false ) {
	    size.width = styleWidth +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
	  }

	  var styleHeight = getStyleSize( style.height );
	  if ( styleHeight !== false ) {
	    size.height = styleHeight +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
	  }

	  size.innerWidth = size.width - ( paddingWidth + borderWidth );
	  size.innerHeight = size.height - ( paddingHeight + borderHeight );

	  size.outerWidth = size.width + marginWidth;
	  size.outerHeight = size.height + marginHeight;

	  return size;
	}

	// IE8 returns percent values, not pixels
	// taken from jQuery's curCSS
	function mungeNonPixel( elem, value ) {
	  // IE8 and has percent value
	  if ( window.getComputedStyle || value.indexOf('%') === -1 ) {
	    return value;
	  }
	  var style = elem.style;
	  // Remember the original values
	  var left = style.left;
	  var rs = elem.runtimeStyle;
	  var rsLeft = rs && rs.left;

	  // Put in the new values to get a computed value out
	  if ( rsLeft ) {
	    rs.left = elem.currentStyle.left;
	  }
	  style.left = value;
	  value = style.pixelLeft;

	  // Revert the changed values
	  style.left = left;
	  if ( rsLeft ) {
	    rs.left = rsLeft;
	  }

	  return value;
	}

	return getSize;

	}

	// transport
	if ( true ) {
	  // AMD for RequireJS
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [ !(function webpackMissingModule() { var e = new Error("Cannot find module \"get-style-property/get-style-property\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) ], __WEBPACK_AMD_DEFINE_FACTORY__ = (defineGetSize), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  // CommonJS for Component
	  module.exports = defineGetSize( require('desandro-get-style-property') );
	} else {
	  // browser global
	  window.getSize = defineGetSize( window.getStyleProperty );
	}

	})( window );


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Fizzy UI utils v1.0.1
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true, strict: true */

	( function( window, factory ) {
	  /*global define: false, module: false, require: false */
	  'use strict';
	  // universal module definition

	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	      __webpack_require__(128),
	      !(function webpackMissingModule() { var e = new Error("Cannot find module \"matches-selector/matches-selector\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function( docReady, matchesSelector ) {
	      return factory( window, docReady, matchesSelector );
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ( typeof exports == 'object' ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('doc-ready'),
	      require('desandro-matches-selector')
	    );
	  } else {
	    // browser global
	    window.fizzyUIUtils = factory(
	      window,
	      window.docReady,
	      window.matchesSelector
	    );
	  }

	}( window, function factory( window, docReady, matchesSelector ) {

	'use strict';

	var utils = {};

	// ----- extend ----- //

	// extends objects
	utils.extend = function( a, b ) {
	  for ( var prop in b ) {
	    a[ prop ] = b[ prop ];
	  }
	  return a;
	};

	// ----- modulo ----- //

	utils.modulo = function( num, div ) {
	  return ( ( num % div ) + div ) % div;
	};

	// ----- isArray ----- //
	  
	var objToString = Object.prototype.toString;
	utils.isArray = function( obj ) {
	  return objToString.call( obj ) == '[object Array]';
	};

	// ----- makeArray ----- //

	// turn element or nodeList into an array
	utils.makeArray = function( obj ) {
	  var ary = [];
	  if ( utils.isArray( obj ) ) {
	    // use object if already an array
	    ary = obj;
	  } else if ( obj && typeof obj.length == 'number' ) {
	    // convert nodeList to array
	    for ( var i=0, len = obj.length; i < len; i++ ) {
	      ary.push( obj[i] );
	    }
	  } else {
	    // array of single index
	    ary.push( obj );
	  }
	  return ary;
	};

	// ----- indexOf ----- //

	// index of helper cause IE8
	utils.indexOf = Array.prototype.indexOf ? function( ary, obj ) {
	    return ary.indexOf( obj );
	  } : function( ary, obj ) {
	    for ( var i=0, len = ary.length; i < len; i++ ) {
	      if ( ary[i] === obj ) {
	        return i;
	      }
	    }
	    return -1;
	  };

	// ----- removeFrom ----- //

	utils.removeFrom = function( ary, obj ) {
	  var index = utils.indexOf( ary, obj );
	  if ( index != -1 ) {
	    ary.splice( index, 1 );
	  }
	};

	// ----- isElement ----- //

	// http://stackoverflow.com/a/384380/182183
	utils.isElement = ( typeof HTMLElement == 'function' || typeof HTMLElement == 'object' ) ?
	  function isElementDOM2( obj ) {
	    return obj instanceof HTMLElement;
	  } :
	  function isElementQuirky( obj ) {
	    return obj && typeof obj == 'object' &&
	      obj.nodeType == 1 && typeof obj.nodeName == 'string';
	  };

	// ----- setText ----- //

	utils.setText = ( function() {
	  var setTextProperty;
	  function setText( elem, text ) {
	    // only check setTextProperty once
	    setTextProperty = setTextProperty || ( document.documentElement.textContent !== undefined ? 'textContent' : 'innerText' );
	    elem[ setTextProperty ] = text;
	  }
	  return setText;
	})();

	// ----- getParent ----- //

	utils.getParent = function( elem, selector ) {
	  while ( elem != document.body ) {
	    elem = elem.parentNode;
	    if ( matchesSelector( elem, selector ) ) {
	      return elem;
	    }
	  }
	};

	// ----- getQueryElement ----- //

	// use element as selector string
	utils.getQueryElement = function( elem ) {
	  if ( typeof elem == 'string' ) {
	    return document.querySelector( elem );
	  }
	  return elem;
	};

	// ----- handleEvent ----- //

	// enable .ontype to trigger from .addEventListener( elem, 'type' )
	utils.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	// ----- filterFindElements ----- //

	utils.filterFindElements = function( elems, selector ) {
	  // make array of elems
	  elems = utils.makeArray( elems );
	  var ffElems = [];

	  for ( var i=0, len = elems.length; i < len; i++ ) {
	    var elem = elems[i];
	    // check that elem is an actual element
	    if ( !utils.isElement( elem ) ) {
	      continue;
	    }
	    // filter & find items if we have a selector
	    if ( selector ) {
	      // filter siblings
	      if ( matchesSelector( elem, selector ) ) {
	        ffElems.push( elem );
	      }
	      // find children
	      var childElems = elem.querySelectorAll( selector );
	      // concat childElems to filterFound array
	      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
	        ffElems.push( childElems[j] );
	      }
	    } else {
	      ffElems.push( elem );
	    }
	  }

	  return ffElems;
	};

	// ----- debounceMethod ----- //

	utils.debounceMethod = function( _class, methodName, threshold ) {
	  // original method
	  var method = _class.prototype[ methodName ];
	  var timeoutName = methodName + 'Timeout';

	  _class.prototype[ methodName ] = function() {
	    var timeout = this[ timeoutName ];
	    if ( timeout ) {
	      clearTimeout( timeout );
	    }
	    var args = arguments;

	    var _this = this;
	    this[ timeoutName ] = setTimeout( function() {
	      method.apply( _this, args );
	      delete _this[ timeoutName ];
	    }, threshold || 100 );
	  };
	};

	// ----- htmlInit ----- //

	// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
	utils.toDashed = function( str ) {
	  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
	    return $1 + '-' + $2;
	  }).toLowerCase();
	};

	var console = window.console;
	/**
	 * allow user to initialize classes via .js-namespace class
	 * htmlInit( Widget, 'widgetName' )
	 * options are parsed from data-namespace-option attribute
	 */
	utils.htmlInit = function( WidgetClass, namespace ) {
	  docReady( function() {
	    var dashedNamespace = utils.toDashed( namespace );
	    var elems = document.querySelectorAll( '.js-' + dashedNamespace );
	    var dataAttr = 'data-' + dashedNamespace + '-options';

	    for ( var i=0, len = elems.length; i < len; i++ ) {
	      var elem = elems[i];
	      var attr = elem.getAttribute( dataAttr );
	      var options;
	      try {
	        options = attr && JSON.parse( attr );
	      } catch ( error ) {
	        // log error, do not initialize
	        if ( console ) {
	          console.error( 'Error parsing ' + dataAttr + ' on ' +
	            elem.nodeName.toLowerCase() + ( elem.id ? '#' + elem.id : '' ) + ': ' +
	            error );
	        }
	        continue;
	      }
	      // initialize
	      var instance = new WidgetClass( elem, options );
	      // make available via $().data('layoutname')
	      var jQuery = window.jQuery;
	      if ( jQuery ) {
	        jQuery.data( elem, namespace, instance );
	      }
	    }
	  });
	};

	// -----  ----- //

	return utils;

	}));


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * docReady v1.0.3
	 * Cross browser DOMContentLoaded event emitter
	 * MIT license
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true*/
	/*global define: false, require: false, module: false */

	( function( window ) {

	'use strict';

	var document = window.document;
	// collection of functions to be triggered on ready
	var queue = [];

	function docReady( fn ) {
	  // throw out non-functions
	  if ( typeof fn !== 'function' ) {
	    return;
	  }

	  if ( docReady.isReady ) {
	    // ready now, hit it
	    fn();
	  } else {
	    // queue function when ready
	    queue.push( fn );
	  }
	}

	docReady.isReady = false;

	// triggered on various doc ready events
	function init( event ) {
	  // bail if IE8 document is not ready just yet
	  var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
	  if ( docReady.isReady || isIE8NotReady ) {
	    return;
	  }
	  docReady.isReady = true;

	  // process queue
	  for ( var i=0, len = queue.length; i < len; i++ ) {
	    var fn = queue[i];
	    fn();
	  }
	}

	function defineDocReady( eventie ) {
	  eventie.bind( document, 'DOMContentLoaded', init );
	  eventie.bind( document, 'readystatechange', init );
	  eventie.bind( window, 'load', init );

	  return docReady;
	}

	// transport
	if ( true ) {
	  // AMD
	  // if RequireJS, then doc is already ready
	  docReady.isReady = typeof requirejs === 'function';
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(129) ], __WEBPACK_AMD_DEFINE_FACTORY__ = (defineDocReady), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  module.exports = defineDocReady( require('eventie') );
	} else {
	  // browser global
	  window.docReady = defineDocReady( window.eventie );
	}

	})( window );


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * eventie v1.0.6
	 * event binding helper
	 *   eventie.bind( elem, 'click', myFn )
	 *   eventie.unbind( elem, 'click', myFn )
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true */
	/*global define: false, module: false */

	( function( window ) {

	'use strict';

	var docElem = document.documentElement;

	var bind = function() {};

	function getIEEvent( obj ) {
	  var event = window.event;
	  // add event.target
	  event.target = event.target || event.srcElement || obj;
	  return event;
	}

	if ( docElem.addEventListener ) {
	  bind = function( obj, type, fn ) {
	    obj.addEventListener( type, fn, false );
	  };
	} else if ( docElem.attachEvent ) {
	  bind = function( obj, type, fn ) {
	    obj[ type + fn ] = fn.handleEvent ?
	      function() {
	        var event = getIEEvent( obj );
	        fn.handleEvent.call( fn, event );
	      } :
	      function() {
	        var event = getIEEvent( obj );
	        fn.call( obj, event );
	      };
	    obj.attachEvent( "on" + type, obj[ type + fn ] );
	  };
	}

	var unbind = function() {};

	if ( docElem.removeEventListener ) {
	  unbind = function( obj, type, fn ) {
	    obj.removeEventListener( type, fn, false );
	  };
	} else if ( docElem.detachEvent ) {
	  unbind = function( obj, type, fn ) {
	    obj.detachEvent( "on" + type, obj[ type + fn ] );
	    try {
	      delete obj[ type + fn ];
	    } catch ( err ) {
	      // can't delete window object properties
	      obj[ type + fn ] = undefined;
	    }
	  };
	}

	var eventie = {
	  bind: bind,
	  unbind: unbind
	};

	// ----- module definition ----- //

	if ( true ) {
	  // AMD
	  !(__WEBPACK_AMD_DEFINE_FACTORY__ = (eventie), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ( typeof exports === 'object' ) {
	  // CommonJS
	  module.exports = eventie;
	} else {
	  // browser global
	  window.eventie = eventie;
	}

	})( window );


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Outlayer Item
	 */

	( function( window, factory ) {
	  'use strict';
	  // universal module definition
	  if ( true ) {
	    // AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"eventEmitter/EventEmitter\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	        __webpack_require__(126),
	        !(function webpackMissingModule() { var e = new Error("Cannot find module \"get-style-property/get-style-property\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()),
	        __webpack_require__(127)
	      ], __WEBPACK_AMD_DEFINE_RESULT__ = function( EventEmitter, getSize, getStyleProperty, utils ) {
	        return factory( window, EventEmitter, getSize, getStyleProperty, utils );
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    // CommonJS
	    module.exports = factory(
	      window,
	      require('wolfy87-eventemitter'),
	      require('get-size'),
	      require('desandro-get-style-property'),
	      require('fizzy-ui-utils')
	    );
	  } else {
	    // browser global
	    window.Outlayer = {};
	    window.Outlayer.Item = factory(
	      window,
	      window.EventEmitter,
	      window.getSize,
	      window.getStyleProperty,
	      window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, EventEmitter, getSize, getStyleProperty, utils ) {
	'use strict';

	// ----- helpers ----- //

	var getComputedStyle = window.getComputedStyle;
	var getStyle = getComputedStyle ?
	  function( elem ) {
	    return getComputedStyle( elem, null );
	  } :
	  function( elem ) {
	    return elem.currentStyle;
	  };


	function isEmptyObj( obj ) {
	  for ( var prop in obj ) {
	    return false;
	  }
	  prop = null;
	  return true;
	}

	// -------------------------- CSS3 support -------------------------- //

	var transitionProperty = getStyleProperty('transition');
	var transformProperty = getStyleProperty('transform');
	var supportsCSS3 = transitionProperty && transformProperty;
	var is3d = !!getStyleProperty('perspective');

	var transitionEndEvent = {
	  WebkitTransition: 'webkitTransitionEnd',
	  MozTransition: 'transitionend',
	  OTransition: 'otransitionend',
	  transition: 'transitionend'
	}[ transitionProperty ];

	// properties that could have vendor prefix
	var prefixableProperties = [
	  'transform',
	  'transition',
	  'transitionDuration',
	  'transitionProperty'
	];

	// cache all vendor properties
	var vendorProperties = ( function() {
	  var cache = {};
	  for ( var i=0, len = prefixableProperties.length; i < len; i++ ) {
	    var prop = prefixableProperties[i];
	    var supportedProp = getStyleProperty( prop );
	    if ( supportedProp && supportedProp !== prop ) {
	      cache[ prop ] = supportedProp;
	    }
	  }
	  return cache;
	})();

	// -------------------------- Item -------------------------- //

	function Item( element, layout ) {
	  if ( !element ) {
	    return;
	  }

	  this.element = element;
	  // parent layout class, i.e. Masonry, Isotope, or Packery
	  this.layout = layout;
	  this.position = {
	    x: 0,
	    y: 0
	  };

	  this._create();
	}

	// inherit EventEmitter
	utils.extend( Item.prototype, EventEmitter.prototype );

	Item.prototype._create = function() {
	  // transition objects
	  this._transn = {
	    ingProperties: {},
	    clean: {},
	    onEnd: {}
	  };

	  this.css({
	    position: 'absolute'
	  });
	};

	// trigger specified handler for event type
	Item.prototype.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	Item.prototype.getSize = function() {
	  this.size = getSize( this.element );
	};

	/**
	 * apply CSS styles to element
	 * @param {Object} style
	 */
	Item.prototype.css = function( style ) {
	  var elemStyle = this.element.style;

	  for ( var prop in style ) {
	    // use vendor property if available
	    var supportedProp = vendorProperties[ prop ] || prop;
	    elemStyle[ supportedProp ] = style[ prop ];
	  }
	};

	 // measure position, and sets it
	Item.prototype.getPosition = function() {
	  var style = getStyle( this.element );
	  var layoutOptions = this.layout.options;
	  var isOriginLeft = layoutOptions.isOriginLeft;
	  var isOriginTop = layoutOptions.isOriginTop;
	  var xValue = style[ isOriginLeft ? 'left' : 'right' ];
	  var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
	  // convert percent to pixels
	  var layoutSize = this.layout.size;
	  var x = xValue.indexOf('%') != -1 ?
	    ( parseFloat( xValue ) / 100 ) * layoutSize.width : parseInt( xValue, 10 );
	  var y = yValue.indexOf('%') != -1 ?
	    ( parseFloat( yValue ) / 100 ) * layoutSize.height : parseInt( yValue, 10 );

	  // clean up 'auto' or other non-integer values
	  x = isNaN( x ) ? 0 : x;
	  y = isNaN( y ) ? 0 : y;
	  // remove padding from measurement
	  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
	  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

	  this.position.x = x;
	  this.position.y = y;
	};

	// set settled position, apply padding
	Item.prototype.layoutPosition = function() {
	  var layoutSize = this.layout.size;
	  var layoutOptions = this.layout.options;
	  var style = {};

	  // x
	  var xPadding = layoutOptions.isOriginLeft ? 'paddingLeft' : 'paddingRight';
	  var xProperty = layoutOptions.isOriginLeft ? 'left' : 'right';
	  var xResetProperty = layoutOptions.isOriginLeft ? 'right' : 'left';

	  var x = this.position.x + layoutSize[ xPadding ];
	  // set in percentage or pixels
	  style[ xProperty ] = this.getXValue( x );
	  // reset other property
	  style[ xResetProperty ] = '';

	  // y
	  var yPadding = layoutOptions.isOriginTop ? 'paddingTop' : 'paddingBottom';
	  var yProperty = layoutOptions.isOriginTop ? 'top' : 'bottom';
	  var yResetProperty = layoutOptions.isOriginTop ? 'bottom' : 'top';

	  var y = this.position.y + layoutSize[ yPadding ];
	  // set in percentage or pixels
	  style[ yProperty ] = this.getYValue( y );
	  // reset other property
	  style[ yResetProperty ] = '';

	  this.css( style );
	  this.emitEvent( 'layout', [ this ] );
	};

	Item.prototype.getXValue = function( x ) {
	  var layoutOptions = this.layout.options;
	  return layoutOptions.percentPosition && !layoutOptions.isHorizontal ?
	    ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
	};

	Item.prototype.getYValue = function( y ) {
	  var layoutOptions = this.layout.options;
	  return layoutOptions.percentPosition && layoutOptions.isHorizontal ?
	    ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
	};


	Item.prototype._transitionTo = function( x, y ) {
	  this.getPosition();
	  // get current x & y from top/left
	  var curX = this.position.x;
	  var curY = this.position.y;

	  var compareX = parseInt( x, 10 );
	  var compareY = parseInt( y, 10 );
	  var didNotMove = compareX === this.position.x && compareY === this.position.y;

	  // save end position
	  this.setPosition( x, y );

	  // if did not move and not transitioning, just go to layout
	  if ( didNotMove && !this.isTransitioning ) {
	    this.layoutPosition();
	    return;
	  }

	  var transX = x - curX;
	  var transY = y - curY;
	  var transitionStyle = {};
	  transitionStyle.transform = this.getTranslate( transX, transY );

	  this.transition({
	    to: transitionStyle,
	    onTransitionEnd: {
	      transform: this.layoutPosition
	    },
	    isCleaning: true
	  });
	};

	Item.prototype.getTranslate = function( x, y ) {
	  // flip cooridinates if origin on right or bottom
	  var layoutOptions = this.layout.options;
	  x = layoutOptions.isOriginLeft ? x : -x;
	  y = layoutOptions.isOriginTop ? y : -y;

	  if ( is3d ) {
	    return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
	  }

	  return 'translate(' + x + 'px, ' + y + 'px)';
	};

	// non transition + transform support
	Item.prototype.goTo = function( x, y ) {
	  this.setPosition( x, y );
	  this.layoutPosition();
	};

	// use transition and transforms if supported
	Item.prototype.moveTo = supportsCSS3 ?
	  Item.prototype._transitionTo : Item.prototype.goTo;

	Item.prototype.setPosition = function( x, y ) {
	  this.position.x = parseInt( x, 10 );
	  this.position.y = parseInt( y, 10 );
	};

	// ----- transition ----- //

	/**
	 * @param {Object} style - CSS
	 * @param {Function} onTransitionEnd
	 */

	// non transition, just trigger callback
	Item.prototype._nonTransition = function( args ) {
	  this.css( args.to );
	  if ( args.isCleaning ) {
	    this._removeStyles( args.to );
	  }
	  for ( var prop in args.onTransitionEnd ) {
	    args.onTransitionEnd[ prop ].call( this );
	  }
	};

	/**
	 * proper transition
	 * @param {Object} args - arguments
	 *   @param {Object} to - style to transition to
	 *   @param {Object} from - style to start transition from
	 *   @param {Boolean} isCleaning - removes transition styles after transition
	 *   @param {Function} onTransitionEnd - callback
	 */
	Item.prototype._transition = function( args ) {
	  // redirect to nonTransition if no transition duration
	  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
	    this._nonTransition( args );
	    return;
	  }

	  var _transition = this._transn;
	  // keep track of onTransitionEnd callback by css property
	  for ( var prop in args.onTransitionEnd ) {
	    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
	  }
	  // keep track of properties that are transitioning
	  for ( prop in args.to ) {
	    _transition.ingProperties[ prop ] = true;
	    // keep track of properties to clean up when transition is done
	    if ( args.isCleaning ) {
	      _transition.clean[ prop ] = true;
	    }
	  }

	  // set from styles
	  if ( args.from ) {
	    this.css( args.from );
	    // force redraw. http://blog.alexmaccaw.com/css-transitions
	    var h = this.element.offsetHeight;
	    // hack for JSHint to hush about unused var
	    h = null;
	  }
	  // enable transition
	  this.enableTransition( args.to );
	  // set styles that are transitioning
	  this.css( args.to );

	  this.isTransitioning = true;

	};

	// dash before all cap letters, including first for
	// WebkitTransform => -webkit-transform
	function toDashedAll( str ) {
	  return str.replace( /([A-Z])/g, function( $1 ) {
	    return '-' + $1.toLowerCase();
	  });
	}

	var transitionProps = 'opacity,' +
	  toDashedAll( vendorProperties.transform || 'transform' );

	Item.prototype.enableTransition = function(/* style */) {
	  // HACK changing transitionProperty during a transition
	  // will cause transition to jump
	  if ( this.isTransitioning ) {
	    return;
	  }

	  // make `transition: foo, bar, baz` from style object
	  // HACK un-comment this when enableTransition can work
	  // while a transition is happening
	  // var transitionValues = [];
	  // for ( var prop in style ) {
	  //   // dash-ify camelCased properties like WebkitTransition
	  //   prop = vendorProperties[ prop ] || prop;
	  //   transitionValues.push( toDashedAll( prop ) );
	  // }
	  // enable transition styles
	  this.css({
	    transitionProperty: transitionProps,
	    transitionDuration: this.layout.options.transitionDuration
	  });
	  // listen for transition end event
	  this.element.addEventListener( transitionEndEvent, this, false );
	};

	Item.prototype.transition = Item.prototype[ transitionProperty ? '_transition' : '_nonTransition' ];

	// ----- events ----- //

	Item.prototype.onwebkitTransitionEnd = function( event ) {
	  this.ontransitionend( event );
	};

	Item.prototype.onotransitionend = function( event ) {
	  this.ontransitionend( event );
	};

	// properties that I munge to make my life easier
	var dashedVendorProperties = {
	  '-webkit-transform': 'transform',
	  '-moz-transform': 'transform',
	  '-o-transform': 'transform'
	};

	Item.prototype.ontransitionend = function( event ) {
	  // disregard bubbled events from children
	  if ( event.target !== this.element ) {
	    return;
	  }
	  var _transition = this._transn;
	  // get property name of transitioned property, convert to prefix-free
	  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

	  // remove property that has completed transitioning
	  delete _transition.ingProperties[ propertyName ];
	  // check if any properties are still transitioning
	  if ( isEmptyObj( _transition.ingProperties ) ) {
	    // all properties have completed transitioning
	    this.disableTransition();
	  }
	  // clean style
	  if ( propertyName in _transition.clean ) {
	    // clean up style
	    this.element.style[ event.propertyName ] = '';
	    delete _transition.clean[ propertyName ];
	  }
	  // trigger onTransitionEnd callback
	  if ( propertyName in _transition.onEnd ) {
	    var onTransitionEnd = _transition.onEnd[ propertyName ];
	    onTransitionEnd.call( this );
	    delete _transition.onEnd[ propertyName ];
	  }

	  this.emitEvent( 'transitionEnd', [ this ] );
	};

	Item.prototype.disableTransition = function() {
	  this.removeTransitionStyles();
	  this.element.removeEventListener( transitionEndEvent, this, false );
	  this.isTransitioning = false;
	};

	/**
	 * removes style property from element
	 * @param {Object} style
	**/
	Item.prototype._removeStyles = function( style ) {
	  // clean up transition styles
	  var cleanStyle = {};
	  for ( var prop in style ) {
	    cleanStyle[ prop ] = '';
	  }
	  this.css( cleanStyle );
	};

	var cleanTransitionStyle = {
	  transitionProperty: '',
	  transitionDuration: ''
	};

	Item.prototype.removeTransitionStyles = function() {
	  // remove transition
	  this.css( cleanTransitionStyle );
	};

	// ----- show/hide/remove ----- //

	// remove element from DOM
	Item.prototype.removeElem = function() {
	  this.element.parentNode.removeChild( this.element );
	  // remove display: none
	  this.css({ display: '' });
	  this.emitEvent( 'remove', [ this ] );
	};

	Item.prototype.remove = function() {
	  // just remove element if no transition support or no transition
	  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
	    this.removeElem();
	    return;
	  }

	  // start transition
	  var _this = this;
	  this.once( 'transitionEnd', function() {
	    _this.removeElem();
	  });
	  this.hide();
	};

	Item.prototype.reveal = function() {
	  delete this.isHidden;
	  // remove display: none
	  this.css({ display: '' });

	  var options = this.layout.options;

	  var onTransitionEnd = {};
	  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
	  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

	  this.transition({
	    from: options.hiddenStyle,
	    to: options.visibleStyle,
	    isCleaning: true,
	    onTransitionEnd: onTransitionEnd
	  });
	};

	Item.prototype.onRevealTransitionEnd = function() {
	  // check if still visible
	  // during transition, item may have been hidden
	  if ( !this.isHidden ) {
	    this.emitEvent('reveal');
	  }
	};

	/**
	 * get style property use for hide/reveal transition end
	 * @param {String} styleProperty - hiddenStyle/visibleStyle
	 * @returns {String}
	 */
	Item.prototype.getHideRevealTransitionEndProperty = function( styleProperty ) {
	  var optionStyle = this.layout.options[ styleProperty ];
	  // use opacity
	  if ( optionStyle.opacity ) {
	    return 'opacity';
	  }
	  // get first property
	  for ( var prop in optionStyle ) {
	    return prop;
	  }
	};

	Item.prototype.hide = function() {
	  // set flag
	  this.isHidden = true;
	  // remove display: none
	  this.css({ display: '' });

	  var options = this.layout.options;

	  var onTransitionEnd = {};
	  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
	  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

	  this.transition({
	    from: options.visibleStyle,
	    to: options.hiddenStyle,
	    // keep hidden stuff hidden
	    isCleaning: true,
	    onTransitionEnd: onTransitionEnd
	  });
	};

	Item.prototype.onHideTransitionEnd = function() {
	  // check if still hidden
	  // during transition, item may have been un-hidden
	  if ( this.isHidden ) {
	    this.css({ display: 'none' });
	    this.emitEvent('hide');
	  }
	};

	Item.prototype.destroy = function() {
	  this.css({
	    position: '',
	    left: '',
	    right: '',
	    top: '',
	    bottom: '',
	    transition: '',
	    transform: ''
	  });
	};

	return Item;

	}));


/***/ }
/******/ ]);