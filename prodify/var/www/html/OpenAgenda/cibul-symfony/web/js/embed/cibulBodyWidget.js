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

	var UID = 0,
	    cn = __webpack_require__(2),
	    wLib = __webpack_require__(4),
	    frameLink = __webpack_require__(9).parent,
	    bottomHit = __webpack_require__(10),
	    debug = __webpack_require__(8),
	    qs = __webpack_require__(6),
	    style = __webpack_require__(11),
	    styler = __webpack_require__(12),
	    config = {
	  all: {
	    heightOffset: 40,
	    res: {
	      agenda: '//openagenda.com/agendas/:uid/embed/events',
	      customAgenda: '//openagenda.com/agendas/:uid/embeds/:embedUid/events',
	      event: '//openagenda.com/agendas/:uid/embed/events/:eventUid',
	      customEvent: '//openagenda.com/agendas/:uid/embeds/:embedUid/events/:eventUid'
	    }
	  },
	  dev: {
	    res: {
	      agenda: '//d.openagenda.com/agendas/:uid/embed/events',
	      customAgenda: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events',
	      event: '//d.openagenda.com/agendas/:uid/embed/events/:eventUid',
	      customEvent: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events/:eventUid'
	    }
	  },
	  preview: {
	    res: {
	      agenda: '/agendas/:uid/embed/events',
	      customAgenda: '/agendas/:uid/previewEmbeds/:embedUid/events',
	      event: '/agendas/:uid/embed/previewEmbeds/:eventUid',
	      customEvent: '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid'
	    }
	  },
	  tpl: {
	    res: {
	      agenda: 'http://localhost:3000/agenda/embedShow',
	      customAgenda: 'http://localhost:3000/agenda/embedShow',
	      event: 'http://localhost:3000/event/embedShow',
	      customEvent: 'http://localhost:3000/event/embedShow'
	    }
	  }
	};

	/**
	 * register the widget
	 */

	__webpack_require__(13)({
	  selector: '.cbpgbdy',
	  backup: { // drupal removes classes
	    selector: '[data-oabdy]',
	    classNames: 'cibulFrame'
	  },
	  widget: widget
	});

	/**
	 * define widget
	 */

	function widget(elem, options) {

	  var env = elem.hasAttribute('data-preview') ? 'preview' : window.env;

	  if (['tpl', 'dev', 'preview'].indexOf(env) !== -1) {

	    debug.enable('*');

	    config = cn.extend(config.all, config[env]);
	  } else {

	    config = config.all;
	  }

	  var log = debug('body'),
	      controller,
	      agendaRes,
	      eventRes,
	      lang;

	  (function () {

	    log('initing');

	    var uid = _loadRes(options.anchorConfig);

	    controller = options.register(wLib.interface('body', uid, {
	      change: change
	    }));

	    styler(style);

	    controller.requestModal('body');

	    controller.getControlData(function (data) {

	      _initSrc(controller.getCurrentQuery());

	      _frameLink(function (href, sendFunc) {

	        controller.releaseModal();

	        _update(href);

	        bottomHit.enable(elem, function () {

	          sendFunc({ bottom: true });
	        });
	      }, function (frameMessage) {

	        if (frameMessage.height) _adjustFrameHeight(frameMessage.height);

	        if (frameMessage.update) {

	          log('received update from frame: %s', (0, _stringify2.default)(frameMessage.update));

	          controller.update('body', frameMessage.update);

	          change(controller.getCurrentQuery());
	        }
	      });
	    });
	  })();

	  function change(reqParams) {

	    log('change notification received with %s', (0, _stringify2.default)(reqParams));

	    var res;

	    if (reqParams.uid) {

	      res = _getEventRes(reqParams.uid);
	    } else {

	      res = _getAgendaRes(reqParams);
	    }

	    _setSrc(res);
	  }

	  function _update(href) {

	    if (typeof href === 'undefined') {

	      log('cannot update frame with undefined href');

	      return;
	    }

	    var hrefQuery = _readQueryPart(href, 'oaq', {});

	    if (_isEventLink(href)) {

	      // extract actual uid here
	      hrefQuery.uid = _getEventUid(href);
	    }

	    log('updating request params "%s"', (0, _stringify2.default)(hrefQuery));

	    controller.update('body', hrefQuery);
	  }

	  function _frameLink(onReady, onMessage) {

	    frameLink(elem, onReady, function (message) {

	      log('received message from frame: %s', message);

	      if (message.load) {

	        log('message is a load request: %s', message.load);

	        if (_isEventLink(message.load)) {

	          log('message is an event link');

	          _setSrc(_clean(message.load));

	          _goToFrameTop();
	        } else if (_isAgendaLink(message.load)) {

	          log('message is an agenda list link');

	          var currentQuery = controller.getCurrentQuery(),
	              newSrc,
	              queryChangeRequest;

	          if (message.load.indexOf('?') === -1) {

	            // agenda link has no associated filter

	            delete currentQuery.uid;

	            newSrc = _clean(message.load + '?' + qs.stringify({ oaq: currentQuery }));
	          } else {

	            // frame is requesting a change in filter

	            queryChangeRequest = (qs.parse(message.load.substr(message.load.indexOf('?') + 1)) || {}).oaq;

	            if (typeof queryChangeRequest == 'undefined') {

	              queryChangeRequest = {};
	            }

	            if (currentQuery.passed) queryChangeRequest.passed = 1;

	            newSrc = _clean(message.load.substr(0, message.load.indexOf('?') + 1) + qs.stringify({ oaq: queryChangeRequest }));
	          }

	          _setSrc(newSrc);
	        } else {

	          log('message is an external link');

	          if (typeof message.target !== 'undefined' && message.target == '_blank') {

	            window.open(message.load, '_blank');
	          } else {

	            window.location.href = message.load;
	          }
	        }
	      } else {

	        onMessage(message);
	      }
	    }, agendaRes);
	  }

	  function _getEventRes(uid) {

	    if (window.env == 'tpl') {

	      return eventRes + '#uid=' + uid;
	    }

	    return eventRes.replace(':eventUid', uid);
	  }

	  function _getEventUid(href) {

	    var uids;

	    if (window.env == 'tpl') {

	      return 88888888;
	    }

	    uids = href.replace(eventRes.replace(':eventUid', ''), '').match(/[0-9]+/g);

	    if (!uids || !uids.length) {

	      log('could not retrieve event uid');

	      return;
	    }

	    return uids[0];
	  }

	  function _setSrc(href) {

	    var parts = href.split('?'),
	        path = parts[0],
	        query = qs.parse(parts.length > 1 ? parts[1] : {}),
	        src;

	    // insert language
	    if (lang) query.lang = lang;

	    src = path + '?' + qs.stringify(query);

	    log('setting frame source to %s', src);

	    elem.setAttribute('src', src);

	    controller.requestModal('body');
	  }

	  function _isEventLink(href) {

	    var stripped;

	    if (window.env == 'tpl') {

	      return !!href.match(/#agendaEventShow|\/event\/embedShow/g);
	    }

	    stripped = href.replace(/http(s|):/, '').split(/\?|#/)[0];

	    return stripped.match(eventRes.replace(':eventUid', '[0-9]+').split('?')[0]);
	  }

	  function _getAgendaRes(reqParams) {

	    var query = qs.stringify({ oaq: reqParams });

	    if (window.env == 'tpl') {

	      return agendaRes + '#query=' + query;
	    }

	    return agendaRes + (agendaRes.indexOf('?') == -1 ? '?' : '&') + query;
	  }

	  function _isAgendaLink(href) {

	    var stripped;

	    if (window.env == 'tpl') {

	      return !!href.match(/#embedShow|\/agenda\/embedShow($|^#)/g);
	    }

	    stripped = href.replace(/http(s|):/, '').split(/\?|#/)[0];

	    return stripped.match(agendaRes.split('?')[0]);
	  }

	  function _clean(href) {

	    if (window.env !== 'tpl') return href;

	    if (href.split('#')[1].match('agendaEventShow')) {

	      return eventRes;
	    } else if (href.split('#')[1].match('embedShow')) {

	      return agendaRes;
	    }

	    return href;
	  }

	  function _initSrc(query) {

	    if (cn.size(query)) {

	      change(query);
	    }
	  }

	  function _loadRes(src) {

	    var uids = [];

	    if (elem.hasAttribute('data-lang')) {

	      lang = elem.getAttribute('data-lang');
	    } else {

	      lang = _readQueryPart(elem.getAttribute('src'), 'lang', false);
	    }

	    uids = window.env == 'tpl' ? [123456] : src.match(/\/[0-9]+\//g).map(function (uid) {

	      return uid.substr(1, uid.length - 2);
	    });

	    if (uids && uids.length >= 1) {

	      agendaRes = config.res[uids.length == 2 ? 'customAgenda' : 'agenda'].replace(':uid', uids[0]);

	      eventRes = config.res[uids.length == 2 ? 'customEvent' : 'event'].replace(':uid', uids[0]);

	      if (uids.length == 2) {

	        agendaRes = agendaRes.replace(':embedUid', uids[1]);

	        eventRes = eventRes.replace(':embedUid', uids[1]);
	      }
	    } else {

	      if (window.env !== 'tpl') throw 'Could not read embed identifiers';

	      agendaRes = config.res.agenda;

	      eventRes = config.res.event;
	    }

	    return uids.join('/');
	  }

	  function _adjustFrameHeight(newHeight) {

	    log('adjusting frame height to %s', newHeight);

	    elem.setAttribute('height', newHeight + config.heightOffset);
	  }

	  function _goToFrameTop() {

	    window.scrollTo(0, _findPos(elem).top - 40);
	  }
	}

	function _findPos(obj) {

	  var o = { left: 0, top: 0 };

	  if (obj.offsetParent) {

	    do {
	      o.left += obj.offsetLeft;
	      o.top += obj.offsetTop;
	    } while (obj = obj.offsetParent);
	  }

	  return o;
	}

	function _readQueryPart(res, key, defaultValue) {

	  return (res.indexOf('?') === -1 ? {} : qs.parse(res.substr(res.indexOf('?') + 1)))[key] || defaultValue;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"core-js/library/fn/json/stringify\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(3);

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
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var du = __webpack_require__(5),
	    utils = __webpack_require__(7),
	    log = __webpack_require__(8)('widgetLib');

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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(3);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(6),
	    utils = __webpack_require__(7);

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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _stringify = __webpack_require__(1);

	var _stringify2 = _interopRequireDefault(_stringify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var debug = __webpack_require__(8),
	    cn = __webpack_require__(2);

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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var cn = __webpack_require__(2),
	    debug = __webpack_require__(8),
	    log,
	    enabled = false,
	    onBottomHit = false,
	    monitoredElem = false;

	module.exports = {
	  enable: enable,
	  disable: disable
	};

	function enable(elem, cb) {

	  if (enabled) disable();

	  log = debug('bottomHit');

	  monitoredElem = elem;

	  cn.addEvent(document, 'scroll', _monitor);

	  enabled = true;

	  onBottomHit = cb;
	}

	function disable() {

	  cn.removeEvent(document, 'scroll', _monitor);

	  enabled = false;

	  onBottomHit = false;
	}

	function _monitor() {

	  var pos;

	  if (!enabled) {

	    return log('not enabled');
	  }

	  if (!monitoredElem) {

	    return log('no element to monitor');
	  }

	  if (!onBottomHit) {

	    return log('no callback set');
	  }

	  if (monitoredElem.offsetTop + monitoredElem.offsetHeight <= cn.getScrollOffsets().y + cn.windowInnerHeight()) {

	    onBottomHit();
	  }
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = ".cbpgbdy { overflow-y: hidden; }"

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var du = __webpack_require__(5),
	    utils = __webpack_require__(7),
	    defaults = {
	  styles: {
	    disabledColor: '#ccc',
	    defaultColor: '#333',
	    activeColor: '#333',
	    selectedColor: 'blue',
	    preselectedColor: '#f0f0f0'
	  }
	},
	    sheet,
	    style = '',
	    styler = function styler(styleToAppend, styleVars, w, d) {

	  if (!w) w = window;

	  if (!d) d = document;

	  if (!sheet) _createSheet(w, d);

	  styles = utils.extend({}, defaults.styles, styleVars ? styleVars : {});

	  style += _format(styleToAppend, styles);

	  if (sheet.styleSheet) {

	    sheet.styleSheet.cssText = style;
	  } else {

	    sheet.innerHTML += style;
	  }
	},
	    _createSheet = function _createSheet(w, d) {

	  sheet = d.createElement('style');

	  sheet.type = 'text/css';

	  sheet.media = 'all';

	  du.asapReady(function () {

	    _stickSheet(d);
	  });
	},
	    _stickSheet = function _stickSheet(d) {

	  d.body.appendChild(sheet);
	},
	    _format = function _format(tpl, ctx) {

	  return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function (m, g) {

	    return ctx[g.replace(/^\s+|\s+$/g, '')] || '';
	  });
	};

	module.exports = styler;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var loadJs = __webpack_require__(14),
	    utils = __webpack_require__(7),
	    wLib = __webpack_require__(4),
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
	    params = utils.extend(defaults.all, defaults[env] ? defaults[env] : {});

	module.exports = function (options) {

	  var loadOptions = utils.extend({
	    widget: false, // required
	    selector: false, // base selector
	    backup: { // backup selector for drupal
	      selector: false,
	      classNames: false // class to set on element for drupal
	    }
	  }, options);

	  getRegister(function (register) {

	    wLib.forEachAnchor(loadOptions.selector, {
	      register: register,
	      backup: loadOptions.backup
	    }, loadOptions.widget);
	  });
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
/* 14 */
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