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

	var embedded = __webpack_require__(1),
	    facebookEmbedded = __webpack_require__(9),
	    du = __webpack_require__(10),
	    utils = __webpack_require__(12);

	window.asap(function (options) {

	  if (options.facebook) {

	    facebookEmbedded(options);

	    _appendTargetBlanks();
	  } else {

	    embedded(options);
	  }
	});

	function _appendTargetBlanks() {

	  // for each link in the page, if it does not belong to oa.com, target blank it.
	  utils.forEach(du.els('a'), function (a) {

	    var pattern = /^\/|(|https|http)\/\/(d\.|)openagenda.com/;

	    if (!pattern.test(a.getAttribute('href'))) {

	      a.setAttribute('target', '_blank');
	    }
	  });
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var frameLink = __webpack_require__(2).frame,
	    debug = __webpack_require__(4),
	    log,
	    cn = __webpack_require__(5),
	    pageHeight = __webpack_require__(7),
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(3);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(4),
	    cn = __webpack_require__(5);

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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"core-js/library/fn/json/stringify\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())), __esModule: true };

/***/ },
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(6);

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
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var imagesLoaded = __webpack_require__(8);

	module.exports = {
	  check: check,
	  force: force,
	  setOnChange: setOnChange
	};

	var height,
	    cn = __webpack_require__(5),
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
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__(4),
	    log,
	    cn = __webpack_require__(5),
	    pageHeight = __webpack_require__(7),
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(6);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(11),
	    utils = __webpack_require__(12);

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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 12 */
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


/***/ }
/******/ ]);