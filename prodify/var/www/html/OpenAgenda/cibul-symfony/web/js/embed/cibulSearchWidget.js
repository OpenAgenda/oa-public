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

	exports.setOnReady = setOnReady;

	var UID = 0,
	    LANG = 1,
	    EJS = __webpack_require__(1),
	    cn = __webpack_require__(2),
	    wLib = __webpack_require__(4),
	    debug = __webpack_require__(8),
	    baseConfig = __webpack_require__(9),
	    template = __webpack_require__(10),
	    style = __webpack_require__(11),
	    styler = __webpack_require__(12),
	    today = new Date(),
	    onReady,
	    oneWidgetReady = false;

	if (cn.contains(['tpl', 'dev'], window.env)) debug.enable('*');

	var widget = function widget(elem, options) {

	  var enabled = false,
	      lang = 'fr',
	      config = cn.extend({}, baseConfig),
	      controller,
	      log,
	      what = null,
	      scope = null,
	      inputElem,
	      buttonElem,
	      waiting = false; // buffer input to limit server request frequency

	  (function () {

	    var uid = options.anchorConfig[UID];

	    if (options.anchorConfig[LANG]) {

	      lang = options.anchorConfig[LANG];
	    }

	    if (elem.hasAttribute('data-scope')) {

	      scope = elem.getAttribute('data-scope').split('|');
	    }

	    log = debug('search widget ' + uid);

	    log('initing');

	    _createElement();

	    controller = options.register(wLib.interface('search', uid, {
	      enable: enable,
	      disable: disable
	    }));

	    oneWidgetReady = true;

	    if (onReady) onReady();
	  })();

	  function enable(reqParams) {

	    enabled = true;

	    what = reqParams.what ? reqParams.what : '';

	    _refreshElement();
	  }

	  function disable() {

	    enabled = false;
	  }

	  function _update(value) {

	    what = value.length ? value : null;

	    log('updating with "%s"', what);

	    if (what) {

	      controller.update('search', { what: what, location: null, scope: scope });
	    } else {

	      controller.update('search', { what: null, scope: null });
	    }
	  }

	  function _createElement() {

	    styler(style);

	    if (!cn.el(elem, 'input')) {

	      elem.innerHTML += new EJS({ text: template }).render({ labels: config.labels[lang] });
	    }

	    buttonElem = cn.el(elem, 'button');

	    inputElem = cn.el(elem, 'input');
	  }

	  function _refreshElement() {

	    cn.removeEvent(inputElem, ['keyup', 'blur'], _onInput);

	    if (buttonElem) cn.removeEvent(buttonElem, 'click', _onClick);

	    inputElem.value = what;

	    if (buttonElem) {

	      cn.addEvent(buttonElem, 'click', _onClick);

	      cn.addEvent(inputElem, 'keyup', _onEnter);
	    } else {

	      cn.addEvent(inputElem, ['keyup', 'blur'], _onInput);
	    }
	  }

	  function _onClick(e) {

	    cn.preventDefault(e);

	    _processInput();
	  }

	  function _onEnter(e) {

	    if (e.keyCode == 13) {

	      _processInput();
	    }
	  }

	  function _onInput(e) {

	    if (waiting) {

	      clearTimeout(waiting);
	    }

	    if (e.keyCode == 13) {

	      _processInput();
	    } else {

	      waiting = setTimeout(_processInput, config.delay);
	    }
	  }

	  function _processInput() {

	    var newValue = inputElem.value;

	    if (what !== newValue) {

	      _update(newValue);
	    }

	    waiting = false;
	  };
	};

	function setOnReady(cb) {

	  if (oneWidgetReady) {

	    cb();
	  }

	  onReady = cb;
	}

	__webpack_require__(13)({
	  selector: '.cbpgsc',
	  widget: widget,
	  backup: {
	    selector: '[data-oasc]',
	    classNames: 'cibulSearch'
	  }
	});

/***/ },
/* 1 */
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
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  langAttribute: 'data-lang',
	  labels: {
	    fr: {
	      search: 'rechercher'
	    },
	    en: {
	      search: 'search'
	    },
	    ar: {
	      search: 'search'
	    },
	    de: {
	      search: 'suchen'
	    },
	    es: {
	      search: 'buscar'
	    }
	  },
	  delay: 2000
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "<label for=\"geosearch\"><%= labels.search %></label>\n<input type=\"text\" placeholder=\"<%= labels.search %>\" name=\"geosearch\">"

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = ".cibulSearch input {\n  border: 1px solid #ccc;\n  padding: 0em 0.4em;\n}\n\n.cibulSearch label {\n  display: none;\n}\n\n.cibulSearch .context-menu {\n  background: white;\n  border: 1px solid #eee;\n  padding: 0.2em 0.4em;\n  margin-top: 0.4em;\n  text-align: left;\n}\n\n.cibulSearch .context-menu > ul {\n  padding: 0;\n  margin: 0;\n}\n\n.cibulSearch .context-menu > ul li {\n  padding: 0.1em 0.2em;\n  list-style-type: none;\n  cursor: pointer;\n}"

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