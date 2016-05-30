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

	var cn = __webpack_require__(1),
	    selectForm = __webpack_require__(3),
	    tagOptions = __webpack_require__(4),
	    codeLang = __webpack_require__(7),
	    debug = __webpack_require__(9),
	    log = debug('embedMenu'),
	    deepExtend = __webpack_require__(10),
	    params = {
	  selectForm: {
	    selectors: {
	      title: '.js_title',
	      subtitle: '.js_subtitle',
	      detail: '.js_detail',
	      canvas: '.js_customize',
	      submit: '.js_submit',
	      wrapper: 'div',
	      wrapperClass: 'select-menu'
	    }
	  },
	  codeLang: {
	    selectors: {
	      select: '.js_code_lang',
	      code: '.js_code',
	      langInput: '.js_embed_lang',
	      preview: '.js_preview'
	    },
	    attribute: false
	  },
	  tagOptions: false, // run when on tag embed page
	  formOptions: false, // run when on formOptions embed page
	  mapOptions: false
	};

	window.run = function (options) {

	  deepExtend(params, options);

	  cn.addEvent(window, 'load', function () {

	    if (params.selectForm) _runSelectForm(params.selectForm);

	    if (params.tagOptions) tagOptions(params.tagOptions);

	    if (params.formOptions) _runFormOptions(params.formOptions);

	    if (params.mapOptions) _runMapOptions(params.mapOptions);

	    if (params.codeLang) codeLang(params.codeLang);
	  });
	};

	var _runSelectForm = function _runSelectForm(params) {

	  selectForm(params.selectors.title, params.selectors.subtitle, params.selectors.detail, {
	    canvas: cn.el(params.selectors.canvas),
	    submit: cn.els(params.selectors.submit),
	    wrapper: params.selectors.wrapper,
	    wrapperClass: params.selectors.wrapperClass
	  });
	},
	    _runFormOptions = function _runFormOptions(options) {

	  var params = cn.extend({
	    selectors: {
	      sandbox: '.js_sandbox_frame'
	    }
	  }, options);

	  window.adjustFrameHeight = function (newHeight) {

	    if (newHeight === false) {

	      cn.el(params.selectors.sandbox).removeAttribute('height');
	    } else {

	      cn.el(params.selectors.sandbox).setAttribute('height', newHeight + 40);
	    }
	  };
	},
	    _runMapOptions = function _runMapOptions(options) {

	  var params = cn.extend({
	    selectors: {
	      cornersInput: '.js_map_corners'
	    }
	  }, options);

	  window.onBoundsChange = function (newBounds) {

	    cn.el(params.selectors.cornersInput).value = [newBounds.neLat, newBounds.neLng, newBounds.swLat, newBounds.swLng].join('|');
	  };
	};

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

	var cn = __webpack_require__(1);

	module.exports = function (headSelector, sectionHeadSelector, sectionContent, options) {

	  var params = cn.extend({
	    canvas: false,
	    submit: false,
	    wrapper: false,
	    wrapperClass: false
	  }, options),
	      select,
	      // our select control

	  run = function run() {

	    if (!params.canvas) params.canvas = cn.el('body');

	    if (!params.submit) params.submit = params.canvas.getElementsByTagName('input[type="submit"]')[0];

	    _createSelect();

	    if (params.submit) _moveSubmits();

	    cn.addEvent(select, 'change', _toggleDisplay);

	    _toggleDisplay();
	  },
	      _createSelect = function _createSelect() {

	    select = document.createElement('select');

	    var i = -1,
	        elemToInsert = select;

	    if (params.wrapper) {
	      elemToInsert = document.createElement(params.wrapper);

	      if (params.wrapperClass) elemToInsert.className = params.wrapperClass;

	      elemToInsert.appendChild(select);
	    }

	    cn.el(params.canvas, headSelector).insertAdjacentElement('beforebegin', elemToInsert);

	    // insert title as first select option

	    select.options[select.options.length] = new Option(_popText(cn.el(params.canvas, headSelector)), i++);

	    // insert section titles in select
	    while (cn.els(params.canvas, sectionHeadSelector).length) {

	      select.options[select.options.length] = new Option(_popText(cn.el(params.canvas, sectionHeadSelector)), i++);
	    }
	  },
	      _moveSubmits = function _moveSubmits() {

	    var submitElems = typeof params.submit.length == 'undefined' ? [params.submit] : params.submit;

	    forEach(submitElems, function (elem) {
	      select.insertAdjacentElement('afterend', elem);
	    });
	  },
	      _toggleDisplay = function _toggleDisplay() {

	    var selectedIndex = select.options[select.selectedIndex].value,
	        sectionElems = cn.els(params.canvas, sectionContent);

	    for (var i = sectionElems.length - 1; i >= 0; i--) {

	      if (i == selectedIndex) {
	        cn.removeProperty(sectionElems[i].style, 'display');
	      } else {
	        sectionElems[i].style.display = 'none';
	      }
	    }
	  },
	      _popText = function _popText(elem) {

	    var nestedItem = elem,
	        text;

	    // find most nested and pick text
	    while (cn.childObject(nestedItem, 0)) {
	      nestedItem = cn.childObject(nestedItem, 0);
	    }text = nestedItem.innerHTML;

	    elem.parentNode.removeChild(elem);

	    return text;
	  };

	  run();
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cn = __webpack_require__(1),
	    controlDataFetch = __webpack_require__(5),
	    total,
	    selectedSlugs = [],
	    UID = 0,
	    TAGS = 1,
	    canvas,
	    config,
	    params = {
	  selectors: {
	    elem: '.js_tags_selection_canvas',
	    codeElem: '.js_code',
	    frame: 'iframe'
	  },
	  elem: false, // where to put dom stuff
	  codeElem: false,
	  uid: false,
	  embedUid: false,
	  attributes: {
	    slug: 'data-slug',
	    config: 'data-cbctl'
	  },
	  classes: {
	    canvas: 'line'
	  },
	  templates: {
	    canvas: '<ul></ul>',
	    option: '<li class="line" data-slug="<%= s %>"><input checked="checked" type="checkbox"/><label><%= t %></label></li>'
	  },
	  onSelectionChange: false
	};

	module.exports = function (options) {

	  cn.extend(params, options);

	  controlDataFetch({
	    uid: params.uid,
	    embedUid: params.embedUid
	  }, function (err, ctl) {

	    if (err) return console.error('could not fetch control data');

	    var tags = ctl.t;

	    total = tags.length;

	    if (params.onSelectionChange) _onSelectionChange = params.onSelectionChange;

	    if (!total) return;

	    _createCanvas();

	    cn.forEach(tags, function (tag) {

	      selectedSlugs.push(tag.s);

	      _createOption(tag);
	    });
	  });
	}, _onSelectionChange = function _onSelectionChange(newConfig) {

	  var src = cn.el(params.selectors.frame).src;

	  cn.el(params.selectors.frame).src = (src.indexOf('?') !== -1 ? src.substr(0, src.indexOf('?')) : src) + '?config=' + newConfig;
	};

	_removeTag = function _removeTag(tag) {

	  selectedSlugs.splice(selectedSlugs.indexOf(tag.s), 1);

	  if (params.onSelectionChange) params.onSelectionChange(config);

	  _updateCode();
	}, _addTag = function _addTag(tag) {

	  selectedSlugs.push(tag.s);

	  _onSelectionChange(config);

	  _updateCode();
	},

	// pick the code from the field, shove it in an element, use dom to update config attribute

	_updateCode = function _updateCode() {

	  var code = cn.el(params.selectors.codeElem).value;

	  var div = document.createElement('div');

	  div.innerHTML = code;

	  config = cn.el(div, 'div').getAttribute(params.attributes.config).split('|');

	  if (selectedSlugs.length == total) {

	    if (config.length == 2) config.pop();
	  } else {

	    var newSlugList = selectedSlugs.join(',');

	    if (config.length < 2) {
	      config.push(newSlugList);
	    } else {
	      config[TAGS] = newSlugList;
	    }
	  }

	  cn.el(div, 'div').setAttribute(params.attributes.config, config.join('|'));

	  cn.el(params.selectors.codeElem).value = div.innerHTML;
	}, _createCanvas = function _createCanvas() {

	  cn.el(params.selectors.elem).innerHTML = params.templates.canvas;

	  canvas = childObject(cn.el(params.selectors.elem), 0);

	  if (params.classes.canvas) canvas.className = params.classes.canvas;
	}, _createOption = function _createOption(tag) {

	  var ul = document.createElement('ul');

	  ul.innerHTML = new EJS({ text: params.templates.option }).render(tag);

	  var li = cn.el(ul, 'li');

	  cn.addEvent(li, 'click', function (e) {

	    if (!cn.contains(selectedSlugs, tag.s)) {

	      _addTag(tag);

	      cn.el(li, 'input').checked = true;
	    } else {

	      _removeTag(tag);

	      cn.el(li, 'input').checked = false;
	    }
	  });

	  canvas.appendChild(cn.el(ul, 'li'));
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var cn = __webpack_require__(1),
	    remote = __webpack_require__(6),
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(2);

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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cn = __webpack_require__(1),
	    urlStr = __webpack_require__(8),
	    params = {
	  selectors: {
	    select: '.js_code_lang', // the select lang widget
	    code: '.js_code', // the widget code
	    langInput: '.js_embed_lang', // embed config input field
	    preview: '.js_preview'
	  },
	  attributeName: 'data-lang'
	};

	module.exports = function (options) {

	  cn.extend(params, options);

	  var codeField = cn.el(params.selectors.code),
	      langField = cn.el(params.selectors.select),
	      previewElem = cn.el(params.selectors.preview),
	      iframeMode = codeField.value.indexOf('iframe') !== -1;

	  _onSelectChange(langField, function (lang) {

	    if (iframeMode) {

	      _updateFrameSrc(codeField, lang);
	    } else {

	      _updateAttribute(codeField, lang);
	    }

	    _updatePreview(previewElem, lang);

	    cn.el(params.selectors.langInput).value = lang;
	  });
	};

	var _updateFrameSrc = function _updateFrameSrc(codeElem, lang) {

	  var src = _extractCodeAttribute(codeElem, 'iframe', 'src'),
	      newSrc = urlStr.addUrlParameters(src, { lang: lang });

	  _insertCodeAttribute(codeElem, 'iframe', 'src', newSrc);
	},
	    _updateAttribute = function _updateAttribute(codeElem, lang) {

	  _insertCodeAttribute(codeElem, 'div', params.attributeName, lang);
	},
	    _updatePreview = function _updatePreview(previewElem, lang) {

	  var src = previewElem.getAttribute('src'),
	      newSrc = urlStr.addUrlParameters(src, { lang: lang });

	  previewElem.setAttribute('src', newSrc);
	},
	    _onSelectChange = function _onSelectChange(selectElem, cb) {

	  cn.addEvent(selectElem, 'change', function () {

	    cb(selectElem.value);
	  });
	},
	    _extractCodeAttribute = function _extractCodeAttribute(elem, mainCodeElemTagName, attribute) {

	  var code = elem.value,
	      div = document.createElement('div');

	  div.innerHTML = code;

	  return cn.el(div, mainCodeElemTagName).getAttribute(attribute);
	},
	    _insertCodeAttribute = function _insertCodeAttribute(elem, mainCodeElemTagName, attribute, value) {

	  var code = elem.value,
	      div = document.createElement('div');

	  div.innerHTML = code;

	  cn.el(div, mainCodeElemTagName).setAttribute(attribute, '[ATTR]');

	  elem.value = div.innerHTML.replace('[ATTR]', value);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cn = __webpack_require__(1),
	    getUrlParameters = exports.getUrlParameters = function (str) {

	  var map = {},
	      parts = str.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function (m, key, value) {
	    map[key] = decodeURIComponent(value);
	  });

	  return map;
	},
	    addUrlParameters = exports.addUrlParameters = function (str, parameters) {

	  var newParameters = cn.extend(getUrlParameters(str), parameters);

	  var newString = '';

	  for (var index in newParameters) {

	    newString = addUrlParameter(newString, index, newParameters[index]);
	  }

	  if (str.indexOf('?') !== -1) {

	    return str.substr(0, str.indexOf('?')) + '?' + newString.substr(1);
	  }

	  return str + '?' + newString.substr(1);
	},
	    addUrlParameter = exports.addUrlParameter = function (str, name, value) {

	  if (typeof value == 'undefined') value = '';

	  var string = name + '=' + encodeURIComponent(value);

	  var result = str;

	  if (result.indexOf('?') != -1) result = result + '&' + string;else result = result + '?' + string;

	  return result;
	};

/***/ },
/* 9 */
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
/* 10 */
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