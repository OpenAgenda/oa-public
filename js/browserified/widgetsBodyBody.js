(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


exports.toCamelCase = function toCamelCase( input ) {

  if ( typeof input == 'object' ) {

    var camelCased = {};

    for (var key in input) {

      if ( !contains(['parse', '_typeCast'], key)) {

        camelCased[toCamelCase(key)] = input[key];
        
      }

    }

    return camelCased;

  }

  return input.replace(/[-_](.)/g, function(match, group1) {

    return group1.toUpperCase();

  });

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

var getElementsByClassName = exports.getElementsByClassName = function( node, classname ) {
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



var els = exports.els = function( node, selector ) {

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

exports.el = function( node, selector ) {

  var results = els(node, selector);

  return results.length?results[0]:null;

};


/* previousObject, nextObject, childObject, getChildIndex v0.1 */
var previousObject = function( elem ) {
  
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

exports.arrDiff = function( a, b ) {

  var diff = [];

  for( var i = 0; i < a.length; i++ ) {

    if ( b.indexOf( a[ i ] ) == -1 ) {

      diff.push( a[ i ] );

    }

  }

  for( i = 0; i < b.length; i++ ) {

    if ( a.indexOf( b[ i ] ) == -1 ) {

      diff.push( b[ i ] );

    }

  }

  return diff;

}


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

exports.windowInnerHeight = function( w, d ) {

  if ( !w ) {
    w = window;
    d = document;
  }

  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName('body')[0].clientHeight;

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

},{}],2:[function(require,module,exports){
module.exports = function( src, callback ){

  if (typeof src == 'string') {

    var script = document.createElement('script');

    if (script.readyState) { // IE

      script.onreadystatechange=function(){

        if (script.readyState=="loaded" || script.readyState=="complete") {

          script.onreadystatechange = null;

          if (typeof callback == "function") callback();
          
          callback=null;

        }
      };
    }
    else {

      script.onload=function(){

        if(typeof callback=="function") callback(); callback=null;

      };

    }

    script.charset = "utf-8";

    script.src = src;

    script.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(script);

  } else {

    var loadedScriptCount=0;

    for (var i=0; i<src.length; i++) {

      loadJs(src[i], function(){

        loadedScriptCount++;

        if(loadedScriptCount==src.length) {

          callback();
          callback = null;

        }
      });

    }

  }

};

},{}],3:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
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

},{"./debug":4}],4:[function(require,module,exports){

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
exports.humanize = require('ms');

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

},{"ms":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":7}],7:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":8,"./stringify":9}],8:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


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

},{"./utils":10}],9:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


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

},{"./utils":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
"use strict";

var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

frameLink = require( '../lib/frameLink' ).parent,

bottomHit = require( '../lib/bottomHit' ),

debug = require( 'debug' ),

qs = require( 'qs' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

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
  tpl: {
    res: {  
      agenda: 'http://localhost:3000/agenda/embedShow',
      customAgenda: 'http://localhost:3000/agenda/embedShow',
      event: 'http://localhost:3000/event/embedShow',
      customEvent: 'http://localhost:3000/event/embedShow'
    }
  }
};

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

  config = cn.extend( config.all, config[ window.env ] );

} else {

  config = config.all;

}


/**
 * register the widget
 */

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgbdy', { register: register }, widget );

});


/**
 * define widget
 */

function widget( elem, options ) {

  var log = debug( 'body' ),

  controller,

  agendaRes, eventRes, lang;

  ( function() {

    log( 'initing' );
    
    var uid = _loadRes( options.anchorConfig );

    controller = options.register( wLib.interface( 'body', uid, {
      change: change 
    } ));

    styler( style );

    controller.getControlData( function( data ) {

      _initSrc( controller.getCurrentQuery() );

      _frameLink( function( href, sendFunc ) {
        
        _update( href );

        bottomHit.enable( elem, function() {

          sendFunc( { bottom: true } );

        });

      }, function( frameMessage ) {

        if ( frameMessage.height ) _adjustFrameHeight( frameMessage.height );

        if ( frameMessage.update ) {

          log( 'received update from frame: %s', JSON.stringify( frameMessage.update ) );

          controller.update( 'body', frameMessage.update );

          change( controller.getCurrentQuery() );

        }

      } );
      
    });


  } )();


  function change( reqParams ) {

    log( 'change notification received with %s', JSON.stringify( reqParams ) );

    var res;

    if ( reqParams.uid ) {

      res = _getEventRes( reqParams.uid );

    } else {

      res = _getAgendaRes( reqParams );
      
    }

    _setSrc( res );

  }


  function _update( href ) {

    if ( typeof href === 'undefined' ) {

      log( 'cannot update frame with undefined href' );

      return;

    }

    var values = {},

    currentQueryValues = controller.getCurrentQuery(),

    hrefQuery = _readQueryPart( href, 'search', {} );

    if ( _isEventLink( href ) ) {

      // extract actual uid here
      values.uid = _getEventUid( href );

    } else if ( _isAgendaLink( href ) ) {

      // specific rules for updating navigation filter

      if ( currentQueryValues.uid ) {

        // we are coming from an event, the event sets
        // the new selection values

        for( var i in currentQueryValues ) {

          values[ i ] = null;

        }

        cn.extend( values, hrefQuery );

      }

    }

    if ( !cn.size( values ) ) return;

    log( 'updating request params "%s"', JSON.stringify( values ) );

    controller.update( 'body', values );

  }


  function _frameLink( onReady, onMessage ) {

    frameLink( elem, onReady, function( message ) {

      if ( message.load ) {

        if ( _isEventLink( message.load ) ) {

          _setSrc( _clean( message.load ) );

          _goToFrameTop();

        } else if ( _isAgendaLink( message.load ) ) {

          var currentQuery = controller.getCurrentQuery(),

          newSrc, queryChangeRequest;

          if ( message.load.indexOf( '?' ) === -1 ) {

            // agenda link has no associated filter

            delete currentQuery.uid;

            newSrc = _clean( message.load + '?' + qs.stringify( { search: currentQuery } ) );

          } else {

            // frame is requesting a change in filter

            queryChangeRequest = ( qs.parse( message.load.substr( message.load.indexOf( '?' ) + 1 ) ) || {} ).search;

            if ( currentQuery.passed ) queryChangeRequest.passed = 1;

            newSrc = _clean( message.load.substr( 0, message.load.indexOf( '?' ) + 1 ) + qs.stringify( { search: queryChangeRequest } ) );

          }

          _setSrc( newSrc );

        } else {

          if ( ( typeof message.target !== 'undefined' ) && ( message.target == '_blank' ) ) {

            window.open( message.load, '_blank' );

          } else {

            window.location.href = message.load;

          }

        }

      } else {

        onMessage( message );

      }

    }, agendaRes );

  }


  function _getEventRes( uid ) {

    if ( window.env == 'tpl' ) {

      return eventRes + '#uid=' + uid;

    }

    return eventRes.replace( ':eventUid', uid );

  }
  

  function _getEventUid( href ) {

    var uids;

    if ( window.env == 'tpl' ) {

      return 88888888;

    }

    uids = href.replace( eventRes.replace( ':eventUid', '' ), '' ).match( /[0-9]+/g );

    if ( !uids || !uids.length ) {

      log( 'could not retrieve event uid' );

      return;

    }

    return uids[ 0 ];

  }

  function _setSrc( href ) {

    var parts = href.split( '?' ),

    path = parts[ 0 ], 

    query = qs.parse( parts.length > 1 ? parts[ 1 ] : {} );

    // insert language
    if ( lang ) query.lang = lang;

    elem.setAttribute( 'src', path + '?' + qs.stringify( query ) );

  }


  function _isEventLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !! href.match(/#agendaEventShow|\/event\/embedShow/g);

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( eventRes.replace( ':eventUid', '[0-9]+').split( '?' )[ 0 ] );

  }


  function _getAgendaRes( reqParams ) {

    var query = qs.stringify( { search: reqParams } );

    if ( window.env == 'tpl' ) {

      return agendaRes + '#query=' + query;

    }

    return agendaRes + ( agendaRes.indexOf( '?' ) == -1 ? '?' : '&' ) + query;

  }


  function _isAgendaLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !!href.match( /#embedShow|\/agenda\/embedShow($|^#)/g );

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( agendaRes.split( '?' )[ 0 ] );

  }


  function _clean( href ) {

    if ( window.env !== 'tpl' ) return href;

    if ( href.split( '#' )[1].match( 'agendaEventShow' ) )  {

      return eventRes;

    } else if ( href.split( '#' )[1].match( 'embedShow' ) ) {

      return agendaRes;

    }

    return href;

  }


  function _initSrc( query ) {

    if ( cn.size( query ) ) {

      change( query );

    }

  }


  function _loadRes( src ) {

    var uids = [];

    if ( elem.hasAttribute( 'data-lang' ) ) {

      lang = elem.getAttribute( 'data-lang' );

    } else {

      lang = _readQueryPart( elem.getAttribute( 'src' ), 'lang', false );

    }

    uids = window.env=='tpl' ? [ 123456 ] : src.match( /\/[0-9]+\//g ).map( function( uid ) {

      return uid.substr( 1, uid.length - 2 );

    });

    if ( uids && uids.length >= 1 ) {

      agendaRes = config.res[ uids.length == 2 ? 'customAgenda' : 'agenda' ].replace( ':uid', uids[ 0 ] );

      eventRes = config.res[ uids.length == 2 ? 'customEvent' : 'event' ].replace( ':uid', uids[ 0 ] );

      if ( uids.length == 2 ) {

        agendaRes = agendaRes.replace( ':embedUid', uids[ 1 ] );

        eventRes = eventRes.replace( ':embedUid', uids[ 1 ] );

      }

    } else {

      if ( window.env !== 'tpl' ) throw 'Could not read embed identifiers';

      agendaRes = config.res.agenda;

      eventRes = config.res.event;

    }
    
    return uids.join('/');

  }


  function _adjustFrameHeight( newHeight ) {

    log( 'adjusting frame height to %s', newHeight );

    elem.setAttribute( 'height', newHeight + config.heightOffset );

  }

  function _goToFrameTop() {

    window.scrollTo( 0, elem.offsetTop );  

  }

}

function _readQueryPart( res, key, defaultValue ) {

   return ( res.indexOf( '?') === -1 ? {} : qs.parse( res.substr( res.indexOf( '?' ) + 1 ) ) )[ key ] || defaultValue;

}

},{"../../js/lib/common/common.mod.js":1,"../lib/bottomHit":13,"../lib/controllerLoader":14,"../lib/frameLink":15,"../lib/widgetLib":16,"../lib/widgetStyler":17,"./style.css":12,"debug":3,"qs":6}],12:[function(require,module,exports){
module.exports = ".cbpgbdy { overflow-y: hidden; }";

},{}],13:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

debug = require( 'debug' ), log,

enabled = false,

onBottomHit = false,

monitoredElem = false;

module.exports = {
  enable: enable,
  disable: disable
};

function enable( elem, cb ) {

  if ( enabled ) disable();

  log = debug( 'bottomHit' );

  monitoredElem = elem;

  cn.addEvent( document, 'scroll', _monitor );

  enabled = true;

  onBottomHit = cb;

}

function disable() {

  cn.removeEvent( document, 'scroll', _monitor );

  enabled = false;

  onBottomHit = false;

}


function _monitor() {

  var pos;

  if ( !enabled ) {

    return log( 'not enabled' );

  }

  if ( !monitoredElem ) {

    return log( 'no element to monitor' );

  }

  if ( !onBottomHit ) {

    return log( 'no callback set' );

  }

  if ( 
    monitoredElem.offsetTop + monitoredElem.offsetHeight 
    <= cn.getScrollOffsets().y + cn.windowInnerHeight()
  ) {

    onBottomHit();

  }

}

},{"../../js/lib/common/common.mod.js":1,"debug":3}],14:[function(require,module,exports){
var loadJs = require( '../../js/lib/loadJs/loadJs.mod.js' ),

cn = require( '../../js/lib/common/common.mod.js' ),

defaults = {
  all : {
    controllersPath : '//openagenda.com/js/embed/cibulControllers.js'
  },
  dev : {
    controllersPath : '//d.openagenda.com/js/embed/cibulControllers.js'
  },
  tpl : {
    controllersPath : '/js/browserified/widgetsControllerMain.js'
  }
},

env = window.env ? window.env : 'prod',

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );


module.exports = function( cb ) {

  getRegister( cb );

}


var getRegister = function( cb ) {

  if ( window.cibul ) {

    cb( window.cibul.registerWidget );

  } else {

    loadJs( params.controllersPath, function() {

      cb( window.cibul.registerWidget );

    } );

  }

}

},{"../../js/lib/common/common.mod.js":1,"../../js/lib/loadJs/loadJs.mod.js":2}],15:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' );

module.exports = {
  frame: parentLink, // link with parent window
  parent: frameLink  // link with frame window
}

function parentLink( onLinkEstablished, onParentMessage ) {

  var log = debug( 'parentLink ( frame script )' ),

  handShakeComplete = false;

  window.addEventListener( 'message', function _onParentMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'received hanshake request from parent' );

      window.parent.postMessage( { href: window.location.href }, e.origin );

      handShakeComplete = true;

      onLinkEstablished( function( message ) {

        log( 'sending message to parent: ', JSON.stringify( message ) );

        window.parent.postMessage( JSON.stringify( message ), e.origin );

      });

    } else {

      log( 'received message from parent' );

      onParentMessage( JSON.parse( e.data ) );

    }

  }, false );

}


function frameLink( elem, onLinkEstablished, onReceive ) {

  var log = debug( 'frameLink ( parent script )' ),

  frameSrc, handShakeComplete = false;

  cn.addEvent( elem, 'load', function() {
    
    _stop();

    _start();

  });

  _start();

  return;
  

  function _start() {

    frameSrc = _appendProtocol( elem.getAttribute( 'src' ) );

    log( 'establishing link on frame with %s', frameSrc );

    handShakeComplete = false;

    window.addEventListener( 'message', _onFrameMessageReceived, frameSrc );

    elem.contentWindow.postMessage( true, frameSrc );

  }


  function _stop() {

    window.removeEventListener( 'message', _onFrameMessageReceived );

  }


  function _onFrameMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'link with frame established' );
      
      onLinkEstablished( e.data.href, function( message ) {

        elem.contentWindow.postMessage( JSON.stringify( message ), frameSrc );

      } );

      handShakeComplete = true;

    } else {

      log( 'receiving message from frame: %s', e.data );

      onReceive( typeof e.data == 'string' ? JSON.parse( e.data ) : e.data );

    }

  }

  function _appendProtocol( href ) {

    if ( href.substr( 0, 2 ) == '//' ) {

      return window.location.href.split('//')[0] + href;

    }

    return href;

  }

}

},{"../../js/lib/common/common.mod.js":1,"debug":3}],16:[function(require,module,exports){
var cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'widgetLib' );


/**
 * for each element corresponding to selector, load config in attribute
 * and handover the element and the config to the callback
 * callback should be the widget
 */

exports.forEachAnchor = function( selector, options, cb ) {

  domReady( function() {

    cn.forEach( cn.els( selector ), function( elem ) {
      
      cb( elem, cn.extend( {
        anchorConfig: readAnchorConfig( elem )
      }, options ) );

    } );

  });

};

/**
 * bootstrap widget with default controller interface functions
 */

exports.interface = function( name, uid, cbs ) {

  return cn.extend({
    name: name,
    uid: uid,
    clear: isNotDefined( 'clear', name ),
    include: isNotDefined( 'include', name ),
    enable: isNotDefined( 'enable', name ),
    disable: isNotDefined( 'disable', name ),
    change: isNotDefined( 'change', name )
  }, cbs );

}

exports.flagged = function( elem ) {

  if ( elem.hasAttribute( 'data-flag' ) ) {

    return true;

  }

  elem.setAttribute( 'data-flag', '1' );

  return false;

}

var isNotDefined = function( type, name ) {

  return function() {}

},

readAnchorConfig = function( elem ) {

  if ( elem.hasAttribute( 'data-cbctl' ) ) {

    return elem.getAttribute('data-cbctl').split('|');

  } else if ( elem.hasAttribute( 'src') ) {

    return elem.getAttribute( 'src' );

  }

},

domReady = function( cb ) {

  if (document.readyState === "complete") {

    cb();

  } else {

    cn.addEvent( window, 'load', cb );

  }

}

},{"../../js/lib/common/common.mod.js":1,"debug":3}],17:[function(require,module,exports){
var cn = require( '../../js/lib/common/common.mod.js' ),

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

styler = function( styleToAppend, styleVars, w, d ) {

  if ( !w ) w = window;

  if ( !d ) d = document;

  if ( !sheet ) _createSheet( w, d );

  styles = cn.extend( {}, defaults.styles, styleVars ? styleVars : {} );

  style += _format( styleToAppend, styles );

  if (sheet.styleSheet) {

    sheet.styleSheet.cssText = style;

  } else {

    sheet.innerHTML += style;

  }

},

_createSheet = function( w, d ) {

  sheet = d.createElement( 'style' );

  sheet.type = 'text/css';

  sheet.media = 'all';

  if ( d.readyState === "complete" ) {

    _stickSheet( d );

  } else {

    cn.addEvent( w, 'load', function() {

      _stickSheet( d );

    } );
  }

},

_stickSheet = function( d ) {

  d.body.appendChild( sheet );

},

_format = function( tpl, ctx ) {

  return tpl.replace( /\{\{([a-zA-Z ]*)\}\}/g, function( m, g ) {

      return ctx[ g.replace(/^\s+|\s+$/g, '') ] || '';

  });

};

module.exports = styler;

},{"../../js/lib/common/common.mod.js":1}]},{},[11]);
