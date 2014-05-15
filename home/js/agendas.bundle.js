(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

handleListPage = require('../../program small list page/js/handleListPage.mod.js'),

ejs = require('ejs'),

debug = require('debug'),

log = debug('main'),

sessionData = false, pageReady = false,

params = {
  url: '/home/agenda',
  template: false, // see at the bottom
  selectors: {
    prev: '.js_nav_previous',
    next: '.js_nav_next',
    list: '.js_list_content'
  }
};

window.run = function(options) {

  if (options.debug) debug.enable('*');

  cn.extend(params, options);

  params.eh.trigger('getsessiondata', function(data) {
    log('session data fetched');
    sessionData = data;

    handlePage();
  });

  cn.addEvent(window, 'load', function() {
    log('window loaded');
    pageReady = true;

    handlePage();
  });

};

var handlePage = function() {

  if (!pageReady || !sessionData) return;

  log('all is set to load up page content');

  handleListPage({
    eh: params.eh,
    url: params.url,
    debug: params.debug,
    elems: {
      listCanvas: cn.el(params.selectors.list),
      navNext: cn.el(params.selectors.next),
      navPrevious: cn.el(params.selectors.prev)
    },
    itemFilter: function(item) {

      item.main = item.uid==sessionData.uid;

      item.owned = item.oUid==sessionData.uid;

      item.admin = cn.contains(sessionData.reviews.admUids, item.uid) || item.owned;

      /*item.creds = {
        editor: availableEditorCred,
        community: availableCommunityCred
      };*/

      item.creds = false;

    },
    templates: {
      program: params.template
    }
  });

};

// this takes up space, it is better at the bottom
params.template = [
  '<li class="mli">',
    '<div class="rwa-item">',
      '<div class="desc">',
        '<a class="url" href="<%= \'/frontend_dev.php/slug/fr\'.replace(\'slug\', slug) %>">',
          '<%= title %>',
        '</a>',
        '<div class="sub">',
          '<span class="indication">',
            '<% if (main) { %>agenda principal<% } else if (owned) { %>propriétaire<% } else if (admin) { %>administrateur<% } else { %>éditeur<% } %>',
          '</span>',
        '</div>',
      '</div>',
      '<div class="act">',
        '<% if (creds && (creds.editor || creds.community)) { %>',
        '<a class="button small"><i class="icon-certificate"></i></a>',
        '<% } %>',
        '<% if (admin) { %>',
        '<a class="button small" href="<%= \'/frontend_dev.php/slug/admin\'.replace(\'slug\', slug) %>">',
          '<i class="icon-cog"></i><span>gérer</span>',
        '</a>',
        '<% } %>',
        '<a href="<%= \'/frontend_dev.php/slug/addevent\'.replace(\'slug\', slug) %>" class="button small">publiez un événement</a>',
      '</div>',
    '</div>',
  '</li>'
].join('');
},{"../../js/lib/common/common.mod.js":15,"../../program small list page/js/handleListPage.mod.js":19,"debug":2,"ejs":3}],2:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],3:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , path = require('path')
  , dirname = path.dirname
  , extname = path.extname
  , join = path.join
  , fs = require('fs')
  , read = fs.readFileSync;

/**
 * Filters.
 *
 * @type Object
 */

var filters = exports.filters = require('./filters');

/**
 * Intermediate js cache.
 *
 * @type Object
 */

var cache = {};

/**
 * Clear intermediate js cache.
 *
 * @api public
 */

exports.clearCache = function(){
  cache = {};
};

/**
 * Translate filtered code into function calls.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function filtered(js) {
  return js.substr(1).split('|').reduce(function(js, filter){
    var parts = filter.split(':')
      , name = parts.shift()
      , args = parts.join(':') || '';
    if (args) args = ', ' + args;
    return 'filters.' + name + '(' + js + args + ')';
  });
};

/**
 * Re-throw the given `err` in context to the
 * `str` of ejs, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

/**
 * Parse the given `str` of ejs, returning the function body.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var parse = exports.parse = function(str, options){
  var options = options || {}
    , open = options.open || exports.open || '<%'
    , close = options.close || exports.close || '%>'
    , filename = options.filename
    , compileDebug = options.compileDebug !== false
    , buf = "";

  buf += 'var buf = [];';
  if (false !== options._with) buf += '\nwith (locals || {}) { (function(){ ';
  buf += '\n buf.push(\'';

  var lineno = 1;

  var consumeEOL = false;
  for (var i = 0, len = str.length; i < len; ++i) {
    var stri = str[i];
    if (str.slice(i, open.length + i) == open) {
      i += open.length

      var prefix, postfix, line = (compileDebug ? '__stack.lineno=' : '') + lineno;
      switch (str[i]) {
        case '=':
          prefix = "', escape((" + line + ', ';
          postfix = ")), '";
          ++i;
          break;
        case '-':
          prefix = "', (" + line + ', ';
          postfix = "), '";
          ++i;
          break;
        default:
          prefix = "');" + line + ';';
          postfix = "; buf.push('";
      }

      var end = str.indexOf(close, i);

      if (end < 0){
        throw new Error('Could not find matching close tag "' + close + '".');
      }

      var js = str.substring(i, end)
        , start = i
        , include = null
        , n = 0;

      if ('-' == js[js.length-1]){
        js = js.substring(0, js.length - 2);
        consumeEOL = true;
      }

      if (0 == js.trim().indexOf('include')) {
        var name = js.trim().slice(7).trim();
        if (!filename) throw new Error('filename option is required for includes');
        var path = resolveInclude(name, filename);
        include = read(path, 'utf8');
        include = exports.parse(include, { filename: path, _with: false, open: open, close: close, compileDebug: compileDebug });
        buf += "' + (function(){" + include + "})() + '";
        js = '';
      }

      while (~(n = js.indexOf("\n", n))) n++, lineno++;
      if (js.substr(0, 1) == ':') js = filtered(js);
      if (js) {
        if (js.lastIndexOf('//') > js.lastIndexOf('\n')) js += '\n';
        buf += prefix;
        buf += js;
        buf += postfix;
      }
      i += end - start + close.length - 1;

    } else if (stri == "\\") {
      buf += "\\\\";
    } else if (stri == "'") {
      buf += "\\'";
    } else if (stri == "\r") {
      // ignore
    } else if (stri == "\n") {
      if (consumeEOL) {
        consumeEOL = false;
      } else {
        buf += "\\n";
        lineno++;
      }
    } else {
      buf += stri;
    }
  }

  if (false !== options._with) buf += "'); })();\n} \nreturn buf.join('');";
  else buf += "');\nreturn buf.join('');";
  return buf;
};

/**
 * Compile the given `str` of ejs into a `Function`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var compile = exports.compile = function(str, options){
  options = options || {};
  var escape = options.escape || utils.escape;

  var input = JSON.stringify(str)
    , compileDebug = options.compileDebug !== false
    , client = options.client
    , filename = options.filename
        ? JSON.stringify(options.filename)
        : 'undefined';

  if (compileDebug) {
    // Adds the fancy stack trace meta info
    str = [
      'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
      rethrow.toString(),
      'try {',
      exports.parse(str, options),
      '} catch (err) {',
      '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
      '}'
    ].join("\n");
  } else {
    str = exports.parse(str, options);
  }

  if (options.debug) console.log(str);
  if (client) str = 'escape = escape || ' + escape.toString() + ';\n' + str;

  try {
    var fn = new Function('locals, filters, escape, rethrow', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += options.filename
        ? ' in ' + filename
        : ' while compiling ejs';
    }
    throw err;
  }

  if (client) return fn;

  return function(locals){
    return fn.call(this, locals, filters, escape, rethrow);
  }
};

/**
 * Render the given `str` of ejs.
 *
 * Options:
 *
 *   - `locals`          Local variables object
 *   - `cache`           Compiled functions are cached, requires `filename`
 *   - `filename`        Used by `cache` to key caches
 *   - `scope`           Function execution context
 *   - `debug`           Output generated function body
 *   - `open`            Open tag, defaulting to "<%"
 *   - `close`           Closing tag, defaulting to "%>"
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
  var fn
    , options = options || {};

  if (options.cache) {
    if (options.filename) {
      fn = cache[options.filename] || (cache[options.filename] = compile(str, options));
    } else {
      throw new Error('"cache" option requires "filename".');
    }
  } else {
    fn = compile(str, options);
  }

  options.__proto__ = options.locals;
  return fn.call(options.scope, options);
};

/**
 * Render an EJS file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  options.filename = path;

  var str;
  try {
    str = options.cache
      ? cache[key] || (cache[key] = read(path, 'utf8'))
      : read(path, 'utf8');
  } catch (err) {
    fn(err);
    return;
  }
  fn(null, exports.render(str, options));
};

/**
 * Resolve include `name` relative to `filename`.
 *
 * @param {String} name
 * @param {String} filename
 * @return {String}
 * @api private
 */

function resolveInclude(name, filename) {
  var path = join(dirname(filename), name);
  var ext = extname(name);
  if (!ext) path += '.ejs';
  return path;
}

// express support

exports.__express = exports.renderFile;

/**
 * Expose to require().
 */

if (require.extensions) {
  require.extensions['.ejs'] = function (module, filename) {
    filename = filename || module.filename;
    var options = { filename: filename, client: true }
      , template = fs.readFileSync(filename).toString()
      , fn = compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
} else if (require.registerExtension) {
  require.registerExtension('.ejs', function(src) {
    return compile(src, {});
  });
}

},{"./filters":4,"./utils":5,"fs":21,"path":23}],4:[function(require,module,exports){
/*!
 * EJS - Filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * First element of the target `obj`.
 */

exports.first = function(obj) {
  return obj[0];
};

/**
 * Last element of the target `obj`.
 */

exports.last = function(obj) {
  return obj[obj.length - 1];
};

/**
 * Capitalize the first letter of the target `str`.
 */

exports.capitalize = function(str){
  str = String(str);
  return str[0].toUpperCase() + str.substr(1, str.length);
};

/**
 * Downcase the target `str`.
 */

exports.downcase = function(str){
  return String(str).toLowerCase();
};

/**
 * Uppercase the target `str`.
 */

exports.upcase = function(str){
  return String(str).toUpperCase();
};

/**
 * Sort the target `obj`.
 */

exports.sort = function(obj){
  return Object.create(obj).sort();
};

/**
 * Sort the target `obj` by the given `prop` ascending.
 */

exports.sort_by = function(obj, prop){
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

/**
 * Size or length of the target `obj`.
 */

exports.size = exports.length = function(obj) {
  return obj.length;
};

/**
 * Add `a` and `b`.
 */

exports.plus = function(a, b){
  return Number(a) + Number(b);
};

/**
 * Subtract `b` from `a`.
 */

exports.minus = function(a, b){
  return Number(a) - Number(b);
};

/**
 * Multiply `a` by `b`.
 */

exports.times = function(a, b){
  return Number(a) * Number(b);
};

/**
 * Divide `a` by `b`.
 */

exports.divided_by = function(a, b){
  return Number(a) / Number(b);
};

/**
 * Join `obj` with the given `str`.
 */

exports.join = function(obj, str){
  return obj.join(str || ', ');
};

/**
 * Truncate `str` to `len`.
 */

exports.truncate = function(str, len, append){
  str = String(str);
  if (str.length > len) {
    str = str.slice(0, len);
    if (append) str += append;
  }
  return str;
};

/**
 * Truncate `str` to `n` words.
 */

exports.truncate_words = function(str, n){
  var str = String(str)
    , words = str.split(/ +/);
  return words.slice(0, n).join(' ');
};

/**
 * Replace `pattern` with `substitution` in `str`.
 */

exports.replace = function(str, pattern, substitution){
  return String(str).replace(pattern, substitution || '');
};

/**
 * Prepend `val` to `obj`.
 */

exports.prepend = function(obj, val){
  return Array.isArray(obj)
    ? [val].concat(obj)
    : val + obj;
};

/**
 * Append `val` to `obj`.
 */

exports.append = function(obj, val){
  return Array.isArray(obj)
    ? obj.concat(val)
    : obj + val;
};

/**
 * Map the given `prop`.
 */

exports.map = function(arr, prop){
  return arr.map(function(obj){
    return obj[prop];
  });
};

/**
 * Reverse the given `obj`.
 */

exports.reverse = function(obj){
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
};

/**
 * Get `prop` of the given `obj`.
 */

exports.get = function(obj, prop){
  return obj[prop];
};

/**
 * Packs the given `obj` into json string
 */
exports.json = function(obj){
  return JSON.stringify(obj);
};

},{}],5:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
 

},{}],6:[function(require,module,exports){
require('../../../lib/urlStrings/urlStrings.js');

var cn = require('../../../lib/common/common.mod.js'),

remote = require('../../../lib/remote/remote.mod.js'),

hash = require('../../../lib/hash/hash.mod.js'),

ejs = require('ejs'),

lockElt,
spinner,
parameters,
OVERWRITE = 0,
AFTER = 1,
BEFORE = -1,
pageRange = false,
sectionRange = false,
resource = false,
locked = false,
lockAnchor,
eventHandler,

params = {
  itemsPerPage: 10,
  url: false,
  params: {},
  anchor: false,
  ajax: true,
  ready: false,
  filter: false,
  itemFilter: false, // function passed to items as they are received
  listOffset: 150,
  triggerScroll: true,
},

triggerEvents = {
  load: 'load',
  loadPrevious: 'loadPrevious',
  loadNext: 'loadNext',
  getParams: 'getlistparams'
},

triggeredEvents = {
  loading: 'lhLoading',
  complete: 'lhComplete',
  success:'lhSuccess',
  fail: 'lhFail',
  lock: 'lock',
  unlock: 'unlock',
  itemReady: 'listItemReady'
},

debug = require('debug'),

log = debug('handleList'),

elem = false; // list canvas

module.exports = function(canvas, eh, options) {

  eventHandler = eh;

  cn.extend(params, options);

  elem = canvas;

  log('initializing handleList');

  params.triggerEvents = cn.extend(triggerEvents, options.triggerEvents?options.triggerEvents:{});

  params.triggeredEvents = cn.extend(triggeredEvents, options.triggeredEvents?options.triggeredEvents:{});

  resource = params.url.substr(0, params.url.indexOf('?')==-1?resource.length:params.url.indexOf('?'));

  parameters = params.url.getUrlParameters();

  if (parameters.page == '1') delete parameters.page;

  if (elem.innerHTML) pageRange = [parseInt(_getParameter('page',1),10), parseInt(_getParameter('page',1),10)];

  var aParameters = params.anchor?hash.getBase64Param(params.anchor,{}):{};
  if (aParameters.page == '1') delete aParameters.page;

  var initLoad = elem.innerHTML?false:true;

  if (Object.size(aParameters)) {

    if (!initLoad)
      if (Object.size(asymDiff(aParameters, parameters)) || Object.size(asymDiff(parameters, aParameters)))
        initLoad = true;
      
    parameters = aParameters;

  }

  if (initLoad) {

    log('initial load is required');

    _writePage(parameters);

  }

  // listen to load data event
  eventHandler.on(params.triggerEvents.load, _writePage);

  eventHandler.on(params.triggerEvents.loadNext, _writeNextPage);

  eventHandler.on(params.triggerEvents.loadPrevious, _writePreviousPage);

  if (params.triggerEvents.getParams) eventHandler.on(params.triggerEvents.getParams, function(callback) {
    callback(parameters);
  });

};

var _writePage = function(newParams) {

  if (!Object.size(newParams)) newParams = false;

  var pageSet = false;

  if (newParams) {

    if (params.filter) newParams = params.filter(newParams);

    for (var index in newParams) {

      if (index=='page') pageSet = true;

      if (newParams[index] === null) {
        _removeParameter(index);
      } else {
        _setParameter(index, newParams[index]);
      }
      
    }

  }

  if (!pageSet) _setParameter('page', 1);

  pageRange = false;
  
  _loadAndWriteContent(OVERWRITE);

},

_writeNextPage = function() {

  _setParameter('page', pageRange?pageRange[1] + 1:parseInt(_getParameter('page',1),10));

  _loadAndWriteContent(AFTER);

},

_writePreviousPage = function() {

  _setParameter('page', pageRange?pageRange[0] - 1:parseInt(_getParameter('page',1),10));

  _loadAndWriteContent(BEFORE);

},

_getParameter = function(name, defaultValue) {

  if (typeof parameters[name] == 'undefined') _setParameter(name, defaultValue);

  return parameters[name];

},

_setParameter = function(name, value) {

  parameters[name] = value;

},

_updatePageRange = function() {

  var page = parseInt(_getParameter('page',1), 10);
  
  if (pageRange) {
    pageRange = [Math.min(pageRange[0], page), Math.max(pageRange[1], page)];
  } else {
    pageRange = [page,page];
  }
},

_removeParameter = function(name) {

  if (typeof parameters[name] != 'undefined') delete parameters[name];

},

_loadAndWriteContent = function(position){

  log('initiating load and write at position %s', ['before', 'overwrite', 'after'][position+1]);

  eventHandler.trigger(params.triggeredEvents.loading);

  if (typeof position == 'undefined') position = OVERWRITE;

  _lockElem(position);

  remote.get(resource, { data: cn.extend({}, params.params, parameters), retries: 3, timeout: 5000 }, function(responseType, data) {

    _unlockElem();

    eventHandler.trigger(params.triggeredEvents.complete);

    // needs to handle error (responseType other than success)

    if (responseType != 'success') return eventHandler.trigger(params.triggeredEvents.fail);

    // got the data, update the page range
    _updatePageRange();

    // now shove it in templates and apply behavior

    var element;
    var receivedCount = 0;

    if (position==OVERWRITE) {
      while (cn.childObject(elem,0)) elem.removeChild(childObject(elem,0));
    }

    var processListItem = function(value) {

      if (typeof value.template == 'undefined') value.template = params.mainItem;

      if (params.itemFilter) params.itemFilter(value);

      if (value.template == params.mainItem) receivedCount++;

      element = document.createElement('div');
      
      element.innerHTML = ejs.render(params.templates[value.template], value);
      element = element.firstChild;

      if (params.scripts && params.scripts[value.template]) params.scripts[value.template](element, value);

      if (position!==BEFORE)
        elem.appendChild(element);
      else
        elem.insertAdjacentElement('afterbegin', element);

      eventHandler.trigger(params.triggeredEvents.itemReady, {element: element, data: value});

    };

    if (position!==BEFORE)
      for (var i = 0; i < data.data.length; i++)
        processListItem(data.data[i]);
    else
      for (i = data.data.length - 1; i >= 0; i--)
        processListItem(data.data[i]);

    if ((position==OVERWRITE) && params.triggerScroll) _scrollToTop();

    if (params.anchor) hash.setBase64Param(params.anchor, parameters);

    eventHandler.trigger(params.triggeredEvents.success, cn.extend({count: receivedCount, next: data.next, prev: data.prev, reset: position==OVERWRITE?true:false }, parameters, {data: data.data}));

  }, params.ajax);

},

_lockElem = function(position) {

  if (locked) return;

  locked = true;

  eventHandler.trigger(params.triggeredEvents.lock, {position: position==AFTER?'bottom':'top'});

},

_unlockElem = function() {

  if (!locked) return;
  locked = false;

  eventHandler.trigger(params.triggeredEvents.unlock);

},

_scrollToTop = function() {

  var timer = setInterval(function(){
    if (getScrollOffsets().y < params.listOffset) clearInterval(timer);
    else window.scrollBy(0, -20);
  }, 10);

};
},{"../../../lib/common/common.mod.js":15,"../../../lib/hash/hash.mod.js":16,"../../../lib/remote/remote.mod.js":17,"../../../lib/urlStrings/urlStrings.js":18,"debug":7,"ejs":8}],7:[function(require,module,exports){
module.exports=require(2)
},{}],8:[function(require,module,exports){
module.exports=require(3)
},{"./filters":9,"./utils":10,"fs":21,"path":23}],9:[function(require,module,exports){
module.exports=require(4)
},{}],10:[function(require,module,exports){
module.exports=require(5)
},{}],11:[function(require,module,exports){
var Spinner = require('spin.js'),

cn = require('../../../lib/common/common.mod.js'),

params = {
  events: {
    lock: 'lockevent',
    unlock: 'unlockevent'
  },
  fullLock: false,
  lockClass: 'lockPane',
  spinnerColor: '#aaa',
  spinnerWidth: 2
},

lockAnchor = false,

locked = false,

elem,

lockElt;

module.exports = function(el, eh, options) {

  elem = el;

  cn.extend(params, options);

  eh.on(params.events.lock, _lock);

  eh.on(params.events.unlock, _unlock);

};


var _lock = function(config) {

  config = cn.extend({
    position: 'top'
  }, config);

  if (locked) return;

  locked = true;

  if (!lockAnchor) {
    if (params.fullLock) {
      lockAnchor = cn.el('html');
    } else {
      lockAnchor = elem.parentNode;
      if (!lockAnchor.style.position.length) lockAnchor.style.position = 'relative';
    }
  }

  lockElt = document.createElement('div');
  lockElt.className = params.lockClass;
  lockElt.style.width = lockAnchor.offsetWidth + 'px';
  lockElt.style.height = lockAnchor.offsetHeight + 'px';
  lockElt.style.left = '-' + parseInt((window.getComputedStyle?window.getComputedStyle(elem):elem.currentStyle)['paddingLeft'], 10) + 'px';

     
  spinner = new Spinner({
    color: params.spinnerColor,
    width: params.spinnerWidth,
  }).spin();
  
  lockElt.appendChild(spinner.el);

  if (elem.offsetHeight>600) {
    spinner.el.style[config.position] = '100px';
    spinner.el.style.position = 'absolute';
  } else {
    spinner.el.style.top = '50%';
  }
  
  lockAnchor.appendChild(lockElt);

},

_unlock = function() {

  if (!locked) return;
  locked = false;

  spinner.stop();
  lockAnchor.removeChild(lockElt);

};
},{"../../../lib/common/common.mod.js":15,"spin.js":12}],12:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
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
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
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
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

},{}],13:[function(require,module,exports){
var cn = require('../../../lib/common/common.mod.js'),

hash = require('../../../lib/hash/hash.mod.js'),

params = {
  displayNoneClass: 'display-none',
  triggerEvents: { loading: 'loading', loadSuccess: 'success', loadFail: 'fail' },
  triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious', hasNextPage: false },
  itemToCount: 'article',
  itemsPerPage: 10,
  disabledClass: 'disabled',
  scrollElt: false,
  initDisplay: [false,false],
  relyOnCount: false,
  url: false
},

enabled = [false, false],

pageRange = [],

PREVIOUS = 0, NEXT = 1, FIRST = 0, LAST = 1,

previousPageElement, nextPageElement, eventHandler;

module.exports = function(previousElt, nextElt, eh, options) {

  previousPageElement = previousElt;

  nextPageElement = nextElt;

  eventHandler = eh;

  params.scrollElt = cn.el('body');

  extend(params, options);

  if (params.initDisplay[PREVIOUS]!==false) _toggle(PREVIOUS, true);
  if (params.initDisplay[NEXT]!==false) {
    _toggle(NEXT, true);
    if (params.triggeredEvents.hasNextPage) eventHandler.trigger(params.triggeredEvents.hasNextPage, true);
  }

  _initPageRange();

  eventHandler.on(params.triggerEvents.loading, function(){

    _disable(PREVIOUS);

    _disable(NEXT);
    
  });

  eventHandler.on(params.triggerEvents.loadFail, function(){
    _enable(PREVIOUS);
    _enable(NEXT);
  });

  // enable/disable nav buttons on reception of data
  eventHandler.on(params.triggerEvents.loadSuccess, function(eventData) {

    var newSet = true;

    if (pageRange.length) if (eventData.page > pageRange[LAST] || eventData.page < pageRange[FIRST]) newSet = false;

    var hasNext = eventData.next!==false && ( (eventData.count == params.itemsPerPage) || params.relyOnCount);

    if (params.triggeredEvents.hasNextPage) eventHandler.trigger(params.triggeredEvents.hasNextPage, hasNext);

    if (newSet) {
      // is inside range. init on both sides

      _toggle(PREVIOUS, eventData.prev!==false);

      _toggle(NEXT, hasNext);

      pageRange = [eventData.page, eventData.page];

    } else {
      // is outside range

      if (eventData.page > pageRange[LAST]) {

        _toggle(NEXT, hasNext);

        if (previousPageElement) if (!hasClass(previousPageElement, params.displayNoneClass)) _enable(PREVIOUS);

      } else {

        _toggle(PREVIOUS, eventData.prev!==false);

        if (!cn.hasClass(nextPageElement, params.displayNoneClass)) _enable(NEXT);

      }

      pageRange = [Math.min(eventData.page, pageRange[FIRST]), Math.max(eventData.page, pageRange[LAST])];
    }

  });

  if (previousPageElement) cn.addEvent(previousPageElement, 'click', function(e){

    preventDefault(e);

    if (enabled[0]) {
      eventHandler.trigger(params.triggeredEvents.getPreviousPage);
    }

  });

  cn.addEvent(nextPageElement, 'click', function(e){

    cn.preventDefault(e);

    _getNextPage();

  });

  cn.addEvent(document, 'scroll', function(){
    if (_scrollEndTrigger()) _getNextPage();
  });
  
};

var _getNextPage = function(){

  if (enabled[NEXT])
    eventHandler.trigger(params.triggeredEvents.getNextPage);

},

_reset = function() {

  pageRange = [];

},

_enable = function(navButtonIndex) {

  cn.removeClass(navButtonIndex?nextPageElement:previousPageElement, params.disabledClass);
  enabled[navButtonIndex] = true;

},

_disable = function(navButtonIndex) {

  cn.addClass(navButtonIndex?nextPageElement:previousPageElement, params.disabledClass);
  enabled[navButtonIndex] = false;

},

_toggle = function(navButtonIndex, activate) {

  if (activate) {

    cn.removeClass(navButtonIndex?nextPageElement:previousPageElement, params.displayNoneClass);
    _enable(navButtonIndex);

  } else {

    cn.addClass(navButtonIndex?nextPageElement:previousPageElement, params.displayNoneClass);
    _disable(navButtonIndex);

  }

},

_scrollEndTrigger = function() {

  if (enabled[NEXT]) {
    if (params.scrollElt.parentNode.clientHeight+params.scrollElt.scrollTop >= params.scrollElt.scrollHeight) {
      return true;
    }
  }

  return false;
},

_initPageRange = function() {

  var initParams = extend(params.url.getUrlParameters(), params.anchor?hash.getBase64Param(params.anchor,{}):{});
  
  var initPage = typeof initParams != 'undefined'?initParams.page:1;

  pageRange = [initPage, initPage];

};
},{"../../../lib/common/common.mod.js":15,"../../../lib/hash/hash.mod.js":16}],14:[function(require,module,exports){
module.exports = {
  
  // public method for encoding
  encode: function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = _utf8_encode(input);

    while (i < input.length) {

      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2))
        enc3 = enc4 = 64;
      else if (isNaN(chr3))
        enc4 = 64;
      

      output = output +
      _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
      _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

    }

    return output;
  },

  // public method for decoding
  decode: function (input) {

    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64)
        output = output + String.fromCharCode(chr2);
      
      if (enc4 != 64)
        output = output + String.fromCharCode(chr3);
    }

    output = _utf8_decode(output);

    return output;

  }
  
};


var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

_utf8_decode = function (utftext) {
  var string = "";
  var i, c, c1, c2;
  i = c = c1 = c2 = 0;

  while ( i < utftext.length ) {

    c = utftext.charCodeAt(i);

    if (c < 128) {
        string += String.fromCharCode(c);
        i++;
    }
    else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    }
    else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }

  }
  return string;
},

_utf8_encode = function (string) {

  string = string.replace(/\r\n/g,"\n");

  var utftext = "";

  for (var n = 0; n < string.length; n++) {

    var c = string.charCodeAt(n);

    if (c < 128) {
        utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }

  }

  return utftext;
};
},{}],15:[function(require,module,exports){
exports.addZero = function(number) {
  return (parseInt(number, 10)<10?'0':'') + number;
};

/* Object.size */
exports.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/* extend */
exports.extend = function(){
  for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
          if(arguments[i].hasOwnProperty(key))
              arguments[0][key] = arguments[i][key];
  return arguments[0];
};

/*contains*/
exports.contains = function(a, obj) {
  var i = a.length;
  while (i--) {
     if (a[i] === obj) {
         return true;
     }
  }
  return false;
};

exports.isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

exports.removeValueFromArray = function(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

exports.unpack = function(encoded) {
  return JSON.parse(encoded);
};

var hasClass = function(element, cls) { return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1; };
var addClass = function(element, className) { if (!hasClass(element, className)) element.className = element.className + ' ' + className; };
var removeClass = function(element, cls) { if (hasClass(element, cls)) { var regex = new RegExp(cls, 'g'); element.className = element.className.replace(regex,''); } };

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;



exports.removeEvent = function(elem,types,eventHandle) {
  if (elem === null || elem === undefined) return;
  if (typeof types == 'string') types = [types];
  forEach(types, function(type) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, eventHandle,false);
    } else if (elem.detachEvent) {
      elem.detachEvent('on'+type, eventHandle);
    } else {
      elem["on"+type]=null;
    }
  });
};

exports.addEvent = function(elem, types, eventHandle) {
  if (elem == null || elem == undefined) return;
  if (typeof types == 'string') types = [types];
  forEach(types, function(type){
    if ( elem.addEventListener ) {
      elem.addEventListener( type, eventHandle, false);
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }  
  });
};

exports.preventDefault = function(event) {
  event.preventDefault ? event.preventDefault() : event.returnValue = false;
};

var getElementsByClassName = function(node, classname) {
  if (typeof node == 'string') {
    classname = node;
    node = document;
  }
  var a = [];
  var re = new RegExp('(^| )'+classname+'( |$)');
  var els = node.getElementsByTagName("*");
  for(var i=0,j=els.length; i<j; i++)
      if(re.test(els[i].className))a.push(els[i]);
  return a;
};

exports.getElementsByClassName = getElementsByClassName;


var els = function(node, selector) {

  if (typeof node == 'string') {
    selector = node;
    node = document;
  }

  var prefix = selector.substr(0,1);

  if ('.#,'.indexOf(prefix) !== -1) selector = selector.substr(1);

  if (prefix == '.')
    return getElementsByClassName(node, selector);
  else if (prefix == '#') {
    var result = node.getElementById(selector);
    if (result)
      return [result];
    else
      return [];
  }
  else
    return node.getElementsByTagName(selector);

};

exports.els = els;


exports.el = function(node, selector) {

  var results = els(node, selector);

  return results.length?results[0]:null;

};


/* previousObject, nextObject, childObject, getChildIndex v0.1 */
var previousObject = function(elem) {
  
  elem = elem.previousSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.previousSibling;

  return elem;

};

exports.previousObject = previousObject;

exports.nextObject = function(elem) {

  elem = elem.nextSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.nextSibling;

  return elem;
};

exports.childObject = function(elem, index) {

  var i = 0, realI = 0;

  while (elem.childNodes[i]) {

    if (elem.childNodes[i].nodeType == 1) {

      if (realI==index) return elem.childNodes[i];

      realI++;
    }

    i++;

  }

  return false;

};

exports.getChildIndex = function(child) {

  var i = 0;

  while ( (child = previousObject(child)) !== null ) i++;

  return i;

};

var forEach = function(array, action) {
  for (var i = 0; i < array.length; i++)
    action(array[i]);
};

exports.forEach = forEach;


exports.asymDiff = function(a, b) {

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
        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);
        else this.parentNode.appendChild(parsedNode);
        break;
    }
  };

  HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML);
  };

  HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
    var parsedText = document.createTextNode(txtStr);
    this.insertAdjacentElement(where, parsedText);
  };
}


exports.getScrollOffsets = function(w){

  // Use the specified window or the current window if no argument 
  w = w || window;

  // This works for all browsers except IE versions 8 and before
  if (typeof w.pageXOffset !== 'undefined') return {
    x: w.pageXOffset,
    y:w.pageYOffset
  };

  // For IE (or any browser) in Standards mode
  var d = w.document;
  if (document.compatMode == "CSS1Compat") {
    return {
      x:d.documentElement.scrollLeft,
      y:d.documentElement.scrollTop
    };
  }

  // For browsers in Quirks mode
  return {
    x: d.body.scrollLeft,
    y: d.body.scrollTop
  };
};

exports.windowInnerHeight = function() {

  return window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

};

exports.triggerEvent = function(elem, name) {

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

exports.isElement = function(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
};

// add trim function to IE8
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

exports.removeProperty = function(obj, name) {

  if (typeof obj.removeProperty !== 'undefined') return obj.removeProperty(name);

  return obj.removeAttribute(name);

};
},{}],16:[function(require,module,exports){
require('../urlStrings/urlStrings.js');

var Base64 = require('../Base64/Base64.mod.js');

module.exports = {
  getParam: function(name, defaultValue, hashValue) {

    var hashParams = (hashValue?hashValue:document.location.hash).getUrlParameters();

    return (typeof hashParams[name] != 'undefined')?hashParams[name]:defaultValue;

  },
  setParam: function(name, value, hashValue) {

    if (hashValue === undefined) hashValue = false;

    var hashParams = (hashValue?hashValue:document.location.hash).getUrlParameters();

    hashParams[name] = value;

    if (hashValue !== false) {
      return hashValue.addUrlParameters(hashParams);
    }
    else {
      document.location.hash = ''.addUrlParameters(hashParams);
    }
      

  },
  getBase64Param: function(name, defaultValue, hashValue) {

    var hashParam = this.getParam(name, false, hashValue);

    return hashParam?Base64.decode(hashParam).getUrlParameters():defaultValue;

  },
  setBase64Param: function(name, value, hashValue) {

    return this.setParam(name, Base64.encode(''.addUrlParameters(value)), hashValue);

  }
};
},{"../Base64/Base64.mod.js":14,"../urlStrings/urlStrings.js":18}],17:[function(require,module,exports){
// this guy does not include the getStack method
module.exports = {
  get: function(url, settings, callback, ajax) {
    if (ajax === undefined) ajax = false;

    if (ajax) {
      this.getXmlHttp(url, settings, callback);
    } else {
      this.getJsonp(url, settings, callback);
    }
  },
  postXmlHttp: function(url, settings, callback) {

    this.xmlHttp(url, settings, callback, "POST");

  },
  getXmlHttp: function(url, settings, callback) {

    this.xmlHttp(url, settings, callback, "GET");

  },

  xmlHttp: function(url, settings, callback, type) {

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

    var sentUrl = type=="GET"?this.appendToUrl(url, settings.data):url;

    var onSuccess = function(data){

      if (finished) return;

      finished = true;

      if (settings.logger) settings.logger.log('remote.getXmlHttp - response received for item ' + settings.name);

      callback('success', data);

    };

    var onTimeout = function() {

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
    var sendRequest = function(){

      var timer = setTimeout(function(){

        onTimeout();

      }, settings.timeout);

      var xhr = new XMLHttpRequest(),

      response;

      xhr.onreadystatechange = function(){

        if (xhr.readyState==4) if (xhr.status==200) {

          clearTimeout(timer);

          if (xhr.responseText.substring(0,1)=='(') {
            response = xhr.responseText.substring(1).substring(0,xhr.responseText.length-2);
          } else {
            response = xhr.responseText;
          }
            
          onSuccess(JSON.parse(response));

        }

      };

      xhr.open(type, sentUrl, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Content-Type", type=="POST"?"application/x-www-form-urlencoded":"text/plain;charset=UTF-8");
      
      if (type=="GET") {

        xhr.send();

      } else {

        xhr.send(self.appendToUrl('', settings.data).substr(1));

      }

    };

    sendRequest(onSuccess, onTimeout);

  },

  getJsonp: function(url, settings, callback){

    var timer,
      timeout = settings.timeout?settings.timeout:2000,
      retries = settings.retries?settings.retries:0,
      sentUrl = this.appendToUrl(url, settings.data),
      callbackParam = {},
      self = this,
      callbackParamName = settings.callbackParamName?settings.callbackParamName:'callback';

    var handleResponse = function(data){
      clearTimeout(timer);
      callback('success', data);
    };

    var handleTimeout = function() {
      if ((!window[settings.data.callback]) || !retries) return callback('timeout');
      sendQuery();
      retries--;
    };

    var sendQuery = function() {
      var callbackName = 'jsonpCb' + Math.ceil(Math.random()*100000);

      window[callbackName] = handleResponse;
      var script = document.createElement('script');
      if (sentUrl.indexOf(callbackParamName + '=') != -1) { // callback param is already in string
        script.src = sentUrl.substring(0, sentUrl.indexOf(callbackParamName + '=') + 9) + callbackName + sentUrl.substring(sentUrl.indexOf(callbackParamName + '=') + 9);
      } else {
        callbackParam[callbackParamName] = callbackName;
        script.src = self.appendToUrl(sentUrl, callbackParam);
      }
        
      document.getElementsByTagName('head')[0].appendChild(script);
    };

    sendQuery();
    
  },
  appendToUrl: function(url, data) {

    if (typeof data != 'undefined') {

      if (url.indexOf('?') == -1) {
        url = url + '?';
      } else {
        url = url + '&';
      }

      for (var name in data) {

        if (typeof data[name] == 'object') {
          for (var index in data[name]) {
            url = url + name + '[]=' + encodeURIComponent(data[name][index]) + '&';
          }
        } else {

          url = url + name + '=' + encodeURIComponent(data[name]) + '&';

        }

      }

      if (url.substr(url.length-1, 1) == '&') url = url.substr(0, url.length-1);

    }

    return url;
  }
};
},{}],18:[function(require,module,exports){
if (!String.prototype.getUrlParameters) String.prototype.getUrlParameters = function(){
  var map = {};
  var parts = this.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
    map[key] = decodeURIComponent(value);
  });
  return map;
};

if (!String.prototype.addUrlParameters) String.prototype.addUrlParameters = function(parameters) {

  var newParameters = extend(this.getUrlParameters(), parameters);

  var newString = '';

  for (var index in newParameters) {
    newString = newString.addUrlParameter(index, newParameters[index]);
  }

  if (this.indexOf('?') != -1) return this.substr(0,this.indexOf('?')) + '?' + newString.substr(1);
  
  return this + '?' + newString.substr(1);

};

if (!String.prototype.addUrlParameter) String.prototype.addUrlParameter = function(name, value){

  if (typeof value == 'undefined') value = '';
  
  var string = name + '=' + encodeURIComponent(value);

  var result = this;

  if (result.indexOf('?') != -1) result = result + '&' + string;
  else result = result + '?' + string;

  return result;
};
},{}],19:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

handleNav = require('../../js/cibul/handleNav/src/handleNav.mod.js'),

handleList =  require('../../js/cibul/handleList/src/handleList.mod.js'),

handleLock = require('../../js/cibul/handleLock/src/handleLock.mod.js'),

debug = require('debug'),

log = debug('handleListPage'),

params = {
  eh: false, // required. event handler
  url: false,
  elems: { listCanvas: false, navNext: false, navPrevious: false, lockCanvas: false },
  initNav: [false, false],
  debug: false,
  anchor: 'list',
  itemFilter: false,       // callback used on each received values of list
  mainItem: false          // takes the first template as main by default
};

module.exports = function(options) {

  params = cn.extend(params, options);
  
  handleList(params.elems.listCanvas, params.eh, {
    url: params.url,
    params: params.debug?{format: 'jsonp'}:{},
    ajax: !params.debug,
    itemFilter: params.itemFilter,
    mainItem: _getMainItem(),
    templates: params.templates,
    triggerEvents: { load: 'load', loadPrevious: 'loadPrevious', loadNext: 'loadNext' },
    triggeredEvents: { loading: 'loading', complete: 'loadComplete', success:'loadSuccess', fail: 'loadFail', lock: 'locklist', unlock: 'unlocklist' },
    anchor: params.anchor
  });

  handleNav(params.elems.navPrevious, params.elems.navNext, params.eh, {
    triggerEvents: { loading: 'loading', loadSuccess: 'loadSuccess', loadFail: 'loadFail'},
    triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious' },
    url: params.url,
    initDisplay: params.initNav,
    anchor: params.anchor,
    relyOnCount: true
  });

  handleLock(params.elems.listCanvas, params.eh, {events: {lock: 'locklist', unlock: 'unlocklist' }});

};

var _getMainItem = function() {

  if (params.mainItem) return params.mainItem;

  for (var index in params.templates)
    return index;

};
},{"../../js/cibul/handleList/src/handleList.mod.js":6,"../../js/cibul/handleLock/src/handleLock.mod.js":11,"../../js/cibul/handleNav/src/handleNav.mod.js":13,"../../js/lib/common/common.mod.js":15,"debug":20}],20:[function(require,module,exports){
module.exports=require(2)
},{}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],23:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22}]},{},[1])