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

	exports.setOnReady = setOnReady;

	var UID = 0,
	    LANG = 1,
	    SANDBOX = 2,
	    cn = __webpack_require__(1),
	    wLib = __webpack_require__(3),
	    debug = __webpack_require__(7),
	    tunnelLib = __webpack_require__(8),
	    config = __webpack_require__(9),
	    buttonTemplate = __webpack_require__(10),
	    EJS = __webpack_require__(11),
	    onReady;

	if (window.env == 'tpl') debug.enable('*');

	var widget = function widget(elem, options) {

	  var log,
	      lang,
	      standalone,
	      listFrame,
	      buttonElem,
	      running,
	      enabled,
	      sandbox,
	      controller,
	      uid,
	      init = function init() {

	    uid = options.anchorConfig[UID];

	    lang = options.anchorConfig[LANG];

	    sandbox = typeof options.anchorConfig[SANDBOX] == 'undefined' ? false : options.anchorConfig[SANDBOX];

	    log = debug('form widget ' + uid);

	    log('initing');

	    controller = options.register(wLib.interface('form', uid, {
	      enable: enable,
	      disable: disable
	    }));

	    if (sandbox) {

	      return _initSandbox(sandbox);
	    }

	    standalone = !cn.els(config.selectors.listFrame).length;

	    if (standalone) {

	      _initStandalone();
	    } else {

	      _initIntegrated();
	    }

	    if (onReady) onReady();
	  },
	      enable = function enable(reqParams) {

	    enabled = true;
	  },
	      disable = function disable() {

	    enabled = false;
	  },
	      _initSandbox = function _initSandbox(sandbox) {

	    if (!cn.contains(['form', 'signin', 'signup', 'complete'], sandbox)) {

	      log('unknown sandbox content type requested %s', sandbox);

	      return;
	    }

	    var frameElem = _initFrame(config.resources.sandbox + '?template=' + sandbox);

	    elem.appendChild(frameElem);
	  },


	  /**
	   * standalone form is in its own page,
	   * and is displayed as soon as the page loads
	   * no add button is required
	   */

	  _initStandalone = function _initStandalone() {

	    log('standalone mode');

	    var frameElem = _initFrame();

	    elem.appendChild(frameElem);
	  },


	  /**
	   * integrated mode displays a button 'add an event'
	   * when pressed, the form replaces the event list and calls
	   * for controller to disable all widgets until procedure is through
	   */

	  _initIntegrated = function _initIntegrated() {

	    log('integrated mode');

	    _create();

	    listFrame = cn.el(config.selectors.listFrame);

	    buttonElem = cn.el(elem, 'button');

	    // form appears when button is clicked, button the switches to
	    // cancel form mode and makes form disappear
	    cn.addEvent(buttonElem, 'click', function (e) {

	      if (!enabled) return;

	      if (!running) {

	        _swapFrameTo();

	        buttonElem.innerHTML = config.labels[lang].cancel;
	      } else {

	        _swapFrameBack();
	      }
	    });
	  },


	  /**
	   * create button elem
	   */

	  _create = function _create() {

	    var wrapper = document.createElement('div');

	    wrapper.innerHTML = new EJS({ text: buttonTemplate }).render({ labels: config.labels[lang] });

	    elem.appendChild(cn.el(wrapper, 'button'));
	  },


	  /**
	   * use the existing frame to display the form
	   */

	  _swapFrameTo = function _swapFrameTo() {

	    controller.requestModal('form', function () {

	      _initFrame();

	      listFrame.insertAdjacentElement('beforebegin', frameElem);

	      listFrame.parentNode.removeChild(listFrame);

	      running = true;
	    });
	  },


	  /**
	   * remove the form frame until it is needed again
	   */

	  _swapFrameBack = function _swapFrameBack() {

	    frameElem.insertAdjacentElement('beforebegin', listFrame);

	    frameElem.parentNode.removeChild(frameElem);

	    frameElem = undefined;

	    controller.releaseModal();

	    running = false;

	    buttonElem.innerHTML = config.labels[lang].add;
	  },
	      _initFrame = function _initFrame(resource) {

	    if (!resource) resource = config.resources.form;

	    frameElem = document.createElement('iframe');

	    frameElem.className = config.classes.form;

	    frameElem.setAttribute('frameborder', 0);

	    frameElem.setAttribute('width', '100%');

	    frameElem.setAttribute('allowtransparency', 'allowtransparency');

	    frameElem.src = resource.replace('{uid}', uid);

	    cn.addEvent(frameElem, 'load', function () {

	      tunnelLib.iTunnel({
	        target: frameElem,
	        onReceive: _handleFormMessage
	      });
	    });

	    return frameElem;
	  },
	      _handleFormMessage = function _handleFormMessage(data) {

	    var iframePos;

	    if (data.height) {

	      frameElem.style.height = data.height + 'px';
	    }

	    if (data.complete && !standalone) {

	      _swapFrameBack();
	    } else if (data.next) {

	      // not used?

	    } else if (data.clear) {

	        iframePos = _findPos(frameElem)[1];

	        if (_scrollPosition() > iframePos) {

	          _scrollPosition(iframePos - scrollOffset);
	        }
	      }
	  },
	      _scrollPosition = function _scrollPosition(value) {

	    if (typeof value !== 'undefined') scrollTo(0, value);

	    return cn.getScrollOffsets().y;
	  },
	      _findPos = function _findPos(element) {

	    var curleft = 0,
	        curtop = 0;

	    if (element.offsetParent) {

	      do {
	        curleft += element.offsetLeft;
	        curtop += element.offsetTop;
	      } while (element = element.offsetParent);
	    }

	    return [curleft, curtop];
	  };

	  init();
	};

	function setOnReady(cb) {

	  onReady = cb;
	}

	__webpack_require__(12)(function (register) {

	  wLib.forEachAnchor('.cbpgbtn', { register: register }, widget);
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(2);

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

	'use strict';

	var du = __webpack_require__(4),
	    utils = __webpack_require__(6),
	    log = __webpack_require__(7)('widgetLib');

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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(2);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(5),
	    utils = __webpack_require__(6);

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

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 6 */
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
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {

	  var mTypes = { // messages received are any of these types
	    ADDRESSED: 'a',
	    OTHER: 'o',
	    BROADCAST: 'b'
	  },
	      hashCache,
	      // used in fallback mode (hash)

	  iTunnel = function iTunnel(params) {

	    var fallbackMode = false // true when running on fallback (hash) mode
	    ,
	        id // id is assigned by parent
	    ,
	        isParent = false // is parent tunnel
	    ,
	        handshaken = false;

	    params = extend({
	      target: false, // target frame if tunnel is parent
	      onReady: false, // called when tunnel is ready to send and receive
	      onReceive: false, // called when message addressed to tunnel is received
	      idName: 'id', // name of id parameter in message. When empty and is received in parent, message is broadcast
	      hashName: 't', // used in fallback mode. name of hash parameter
	      hashCache: 'v', // used in fallback mode. name of cache parameter
	      forceFallback: false, // if set, forces hash method
	      tunnelNextIdName: 'iTunnelNextId' // window variable for storing next id value
	    }, typeof params == 'undefined' ? {} : params), _init = function _init() {

	      if (params.target) isParent = true;

	      if (isParent) id = window[params.tunnelNextIdName] == undefined ? (window[params.tunnelNextIdName] = 1) - 1 : window[params.tunnelNextIdName]++;

	      if (!window['postMessage'] || params.forceFallback) {
	        fallbackMode = true;
	        _monitorHash(params.hashName, params.hashCache, _onReceive, params.target);
	      } else {
	        _monitorMessage(_onReceive);
	      }

	      // parent send id in init message, child sends empty message
	      send();
	    }, send = function send(data) {

	      if (typeof data == 'undefined') data = {};

	      if (typeof id != 'undefined') data[params.idName] = id;

	      if (fallbackMode) {
	        var newHref = _writeHash(isParent ? params.target.src : document.referrer, params.hashName, params.hashCache, data);
	        if (isParent) params.target.src = newHref;else parent.location.href = newHref;
	      } else {
	        _postMessage(isParent ? params.target.contentWindow : parent, isParent ? params.target.src : document.referrer, data);
	      }
	    }, setOnReceive = function setOnReceive(onReceive) {

	      params.onReceive = onReceive;
	    }, _onReceive = function _onReceive(data) {

	      if (isParent) switch (_messageType(params.idName, id, data)) {
	        case mTypes.BROADCAST:

	          // child is desperately calling for parent, call it back
	          send();

	        case mTypes.OTHER:

	          return;

	        case mTypes.ADDRESSED:

	          // at this point handshake is completed for parent
	          if (!handshaken) {
	            handshaken = true;
	            if (params.onReady) params.onReady();
	          }

	      } else {

	        // if child still doesn't know who the parent is and sees an id, it takes it and sends it back

	        if (typeof data[params.idName] != 'undefined' && !handshaken) {
	          handshaken = true;
	          id = data[params.idName];
	          send();
	          if (params.onReady) params.onReady();
	        }
	      }

	      // remove id value

	      if (typeof data[params.idName] != 'undefined') delete data[params.idName];

	      if (params.onReceive && size(data)) params.onReceive(data);
	    };

	    _init();

	    return {
	      send: send,
	      setOnReceive: setOnReceive
	    };
	  },
	      _messageType = function _messageType(idName, idValue, data) {

	    // if tunnel is parent and message does not contain id, its a broadcast.
	    if (typeof data[idName] == 'undefined') return mTypes.BROADCAST;else if (data[idName] == idValue) return mTypes.ADDRESSED;else return mTypes.OTHER;
	  },
	      _postMessage = function _postMessage(frame, targetUrl, data) {

	    var message = Base64.encode(''.addUrlParameters(data));

	    frame['postMessage'](message, targetUrl.replace(/#.*$/, ''));
	  },
	      _monitorMessage = function _monitorMessage(callback) {

	    addEvent(window, 'message', function (message) {

	      var data = Base64.decode(message.data).getUrlParameters();

	      callback(data);
	    });
	  },
	      _monitorHash = function _monitorHash(hashParamName, hashCacheName, callback, target) {

	    if (!hashCache) hashCache = Math.ceil(Math.random(0, 100000) * 1000);

	    addEvent(window, 'hashchange', function () {

	      var data = Base64.decode(hash.getParam(hashParamName, '', document.location.href.substr(document.location.href.replace(/#.*$/, '').length))).getUrlParameters();

	      // remove hash cache value

	      if (typeof data[hashCacheName] != 'undefined') delete data[hashCacheName];

	      callback(data);
	    });
	  },
	      _writeHash = function _writeHash(target, hashParamName, hashCacheName, data) {

	    data[hashCacheName] = hashCache++;

	    var hashValue = Base64.encode(''.addUrlParameters(data)),
	        targetUrl = target.replace(/#.*$/, ''),
	        targetHash = target.substr(targetUrl.length).replace('#', '');

	    return targetUrl + '#' + hash.setParam(hashParamName, hashValue, targetHash);
	  },
	      extend = function extend() {
	    for (var i = 1; i < arguments.length; i++) {
	      for (var key in arguments[i]) {
	        if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
	      }
	    }return arguments[0];
	  },
	      addEvent = function addEvent(elem, types, eventHandle) {
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
	  },
	      forEach = function forEach(array, action) {
	    for (var i = 0; i < array.length; i++) {
	      action(array[i]);
	    }
	  },
	      Base64 = {
	    // private property
	    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	    // public method for encoding
	    encode: function encode(input) {
	      var output = "";
	      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	      var i = 0;

	      input = Base64._utf8_encode(input);

	      while (i < input.length) {

	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
	        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	          enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	          enc4 = 64;
	        }

	        output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
	      }

	      return output;
	    },

	    // public method for decoding
	    decode: function decode(input) {
	      var output = "";
	      var chr1, chr2, chr3;
	      var enc1, enc2, enc3, enc4;
	      var i = 0;

	      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	      while (i < input.length) {

	        enc1 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc2 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc3 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc4 = Base64._keyStr.indexOf(input.charAt(i++));

	        chr1 = enc1 << 2 | enc2 >> 4;
	        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
	        chr3 = (enc3 & 3) << 6 | enc4;

	        output = output + String.fromCharCode(chr1);

	        if (enc3 != 64) {
	          output = output + String.fromCharCode(chr2);
	        }
	        if (enc4 != 64) {
	          output = output + String.fromCharCode(chr3);
	        }
	      }

	      output = Base64._utf8_decode(output);

	      return output;
	    },

	    // private method for UTF-8 encoding
	    _utf8_encode: function _utf8_encode(string) {
	      string = string.replace(/\r\n/g, "\n");
	      var utftext = "";

	      for (var n = 0; n < string.length; n++) {

	        var c = string.charCodeAt(n);

	        if (c < 128) {
	          utftext += String.fromCharCode(c);
	        } else if (c > 127 && c < 2048) {
	          utftext += String.fromCharCode(c >> 6 | 192);
	          utftext += String.fromCharCode(c & 63 | 128);
	        } else {
	          utftext += String.fromCharCode(c >> 12 | 224);
	          utftext += String.fromCharCode(c >> 6 & 63 | 128);
	          utftext += String.fromCharCode(c & 63 | 128);
	        }
	      }

	      return utftext;
	    },

	    // private method for UTF-8 decoding
	    _utf8_decode: function _utf8_decode(utftext) {
	      var string = "";
	      var i = 0;
	      var c = c1 = c2 = 0;

	      while (i < utftext.length) {

	        c = utftext.charCodeAt(i);

	        if (c < 128) {
	          string += String.fromCharCode(c);
	          i++;
	        } else if (c > 191 && c < 224) {
	          c2 = utftext.charCodeAt(i + 1);
	          string += String.fromCharCode((c & 31) << 6 | c2 & 63);
	          i += 2;
	        } else {
	          c2 = utftext.charCodeAt(i + 1);
	          c3 = utftext.charCodeAt(i + 2);
	          string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
	          i += 3;
	        }
	      }
	      return string;
	    }
	  },
	      size = function size(obj) {
	    var size = 0,
	        key;
	    for (key in obj) {
	      if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	  };

	  if (!String.prototype.getUrlParameters) String.prototype.getUrlParameters = function () {
	    var map = {};
	    var parts = this.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function (m, key, value) {
	      map[key] = decodeURIComponent(value);
	    });
	    return map;
	  };

	  if (!String.prototype.addUrlParameters) String.prototype.addUrlParameters = function (parameters) {

	    var newParameters = extend(this.getUrlParameters(), parameters);

	    var newString = '';

	    for (var index in newParameters) {
	      newString = newString.addUrlParameter(index, newParameters[index]);
	    }

	    if (this.indexOf('?') != -1) return this.substr(0, this.indexOf('?')) + '?' + newString.substr(1);

	    return this + '?' + newString.substr(1);
	  };

	  if (!String.prototype.addUrlParameter) String.prototype.addUrlParameter = function (name, value) {

	    if (typeof value == 'undefined') value = '';

	    var string = name + '=' + encodeURIComponent(value);

	    var result = this;

	    if (result.indexOf('?') != -1) result = result + '&' + string;else result = result + '?' + string;

	    return result;
	  };

	  if (true) exports.iTunnel = iTunnel;else window.iTunnel = iTunnel;
	})();

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cn = __webpack_require__(1),
	    env = window.env ? window.env : 'prod',
	    config = {
	  all: {
	    lang: 'en',
	    langAttribute: 'data-lang',
	    requireCtl: false,
	    standalone: true,
	    scrollOffset: 100,
	    resources: {
	      form: '//openagenda.com/embed/{uid}/form',
	      sandbox: '//openagenda.com/embed/{uid}/form/sandbox'
	    },
	    labels: {
	      fr: {
	        add: 'ajoutez un événement',
	        cancel: 'retour à la liste'
	      },
	      en: {
	        add: 'add an event',
	        cancel: 'back to list'
	      }
	    },
	    classes: {
	      form: 'cibulFrame'
	    },
	    selectors: {
	      listFrame: '.cbpglst'
	    }
	  },
	  prod: {},
	  dev: {
	    resources: {
	      form: '//d.openagenda.com/frontend_dev.php/embed/{uid}/form',
	      sandbox: '//d.openagenda.com/frontend_dev.php/embed/{uid}/form/sandbox'
	    }
	  },
	  tpl: {
	    resources: {
	      form: '//d.openagenda.com/frontend_dev.php/embed/{uid}/form',
	      sandbox: '//d.openagenda.com/frontend_dev.php/embed/{uid}/form/sandbox'
	    }
	  }
	};

	module.exports = cn.extend(config.all, config[env]);

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "<button><%= labels.add %></button>"

/***/ },
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var loadJs = __webpack_require__(13),
	    cn = __webpack_require__(1),
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
/* 13 */
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

/***/ }
/******/ ]);