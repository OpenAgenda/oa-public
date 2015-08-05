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

    if (settings.form) 
      settings.data = this.serialize(settings.form);    

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

    if ( settings.retries ) retries = settings.retries;
    if ( !settings.timeout ) settings.timeout = 2000;
    if ( !settings.name ) settings.name = url;

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

          if ( settings.raw ) return onSuccess( response );
            
          onSuccess(JSON.parse(response));

        }

      };

      xhr.open(type, sentUrl, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Content-Type", type=="POST"?"application/x-www-form-urlencoded":"text/plain;charset=UTF-8");
      
      if (type=="GET") {

        xhr.send();

      } else {

        var body = settings.data;

        if (typeof body !== 'string')
          body = self.appendToUrl('', settings.data).substr(1);

        xhr.send(body);

      }

    };

    sendRequest(onSuccess, onTimeout);

  },

  getJsonp: function(url, settings, callback){

    var timer,
      timeout = settings.timeout?settings.timeout:2000,
      retries = settings.retries?settings.retries:0,
      sentUrl = this.appendToUrl(url, settings.data),
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

      var callbackName,

      callbackParam = {},

      script = document.createElement('script'),

      urlCbNameIndex = sentUrl.indexOf( callbackParamName + '=' );

      script.setAttribute( 'type','text/javascript' );

      if ( urlCbNameIndex !== -1 ) {

        callbackName = sentUrl.substr( urlCbNameIndex + callbackParamName.length + 1 );

        script.src = sentUrl;

      } else {

        callbackName = 'jsonpCb' + Math.ceil( Math.random()*100000 );

        callbackParam[ callbackParamName ] = callbackName;

        script.src = self.appendToUrl( sentUrl, callbackParam );

      }

      window[ callbackName ] = handleResponse;
        
      document.getElementsByTagName('head')[0].appendChild(script);

    };

    sendQuery();
    
  },

  appendToUrl: function(url, data) {

    var isArray;

    if (typeof data != 'undefined') {

      if (url.indexOf('?') == -1) {
        url = url + '?';
      } else {
        url = url + '&';
      }

      for (var name in data) {

        if (typeof data[name] == 'object') {

          isArray = Object.prototype.toString.call( data[name] ) === '[object Array]';

          for (var index in data[name]) {
            url = url + name + '[' + ( isArray ? '' : index ) + ']=' + encodeURIComponent(data[name][index]) + '&';
          }

        } else {

          url = url + name + '=' + encodeURIComponent(data[name]) + '&';

        }

      }

      if (url.substr(url.length-1, 1) == '&') url = url.substr(0, url.length-1);

    }

    return url;
  },

  collect: function(a, f) {
    var n = [];
    for (var i = 0; i < a.length; i++) {
        var v = f(a[i]);
        if (v != null) n.push(v);
    }
    return n;
  },

  serialize: function (f) {
    function g(n) {
        return f.getElementsByTagName(n);
    };
    var nv = function (e) {
        if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
    };
    var i = this.collect(g('input'), function (i) {
        if ((i.type != 'radio' && i.type != 'checkbox') || i.checked) return nv(i);
    });
    var s = this.collect(g('select'), nv);
    var t = this.collect(g('textarea'), nv);
    return i.concat(s).concat(t).join('&');
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
"use strict";

var debug = require( 'debug' ),

log = debug( 'parser' );

module.exports = parser;

function parser( struct ) {

  var log = debug( 'parser ' + struct.name );

  if ( !struct ) throw 'parser structure missing';

  var attributes = _validateAttributes( struct.attributes ),

  template,

  templateAttributes, // attributes which are in template

  templateAttributeBlocks; // attributes which are in template

  if ( struct.children ) {

    log( 'children' );

    struct.children = _createChildrenParsers( struct.children );

  }

  return {
    load: load,
    render: render
  };

  /**
   * load template (validate, while you are at it)
   */

  function load( tpl ) {

    // cut bits down to hand over to children
    if ( struct.children ) {

      struct.children.forEach( function( child ) {

        tpl = _childLoadAndSlice( child, tpl );

      });

    } 

    // spot blocks and variables. any unknown throws errors

    templateAttributes = _extractTemplateAttributes( attributes, tpl );

    templateAttributeBlocks = _extractTemplateAttributeBlocks( attributes, tpl );

    template = tpl;

  }


  function render( data ) {

    var clean = _mergeExpected( data, templateAttributes, struct.children );

    if ( !template ) throw 'template is undefined';

    var rendered = template;

    for( var i in clean ) {

      // process the children blocks
      
      if ( _isArray( clean[ i ] ) ) {

        // find child and process
        rendered = _renderChild( i, clean[ i ], struct.children, rendered );

      }
      
      // process the attribute blocks

      if ( templateAttributeBlocks[ i ] !== undefined ) {
      
        if ( !data[ i ] ) {

          rendered = _removeBlock( rendered, templateAttributeBlocks[ i ] );

        } 

      }

      // process the attributes
      
      if ( templateAttributes[ i ] !== undefined ) {

        rendered = rendered.replace( new RegExp( '{' + templateAttributes[ i ] + '}', 'g'), data[ i ] );

      }

    }

    rendered = _removeRemainingStatements( rendered );

    return rendered;

  }

}



function _validateAttributes( attributes ) {

  if ( !attributes ) attributes = [];

  attributes.forEach( function( attr ) {

    if ( attr.mapTo === undefined || attr.name === undefined ) {

      throw new Error( 'both mapTo and name must be defined in attribute' );

    }

  });

  return attributes;

}


/**
 * creates a parser for each
 * child of current parser
 */

function _createChildrenParsers( children ) {

  children.forEach( function( child ) {

    _defineDepth( child );

    child.parser = parser( child );

  });

  // deeper children must be processed first
  return children.sort( function( a, b ) {

    return a.depth < b.depth;

  } );

}

function _defineDepth( node ) {

  var maxDepth = 0;

  if ( node.depth !== undefined ) return node.depth;

  node.depth = 0;

  if ( node.children !== undefined ) {

    node.children.forEach( function( child ) {

      var childDepth = _defineDepth( child );

      if ( childDepth > maxDepth ) maxDepth = childDepth;

    });

    node.depth = maxDepth + 1;

  }

  return node.depth;

}

/**
 * from given template, extract bit relevent to
 * given child and return stripped template
 */

function _childLoadAndSlice( child, tpl ) {

  var indexes, childTemplate;

  try {

    indexes = _findBlockIndexes( tpl, child.name );

  } catch( e ) {

    log( 'child %s is undefined in template', child.name );

    return tpl;

  }

  childTemplate = tpl.substr( indexes[ 2 ], indexes[ 1 ] - indexes[ 2 ] );

  child.parser.load( childTemplate );

  return tpl.replace( childTemplate, '' );

}


function _renderChild( key, arr, children, rendered ) {

  var child = children.filter( function( child ) {

    return child.mapTo == key;
  
  } )[ 0 ],

  indexes, childRender = '';

  try {

     indexes = _findBlockIndexes( rendered, child.name );

  } catch( e ) {

    log( 'child %s is not used in template', child.name );

    return rendered;

  }

  arr.forEach( function( childData ) {

    childRender += child.parser.render( childData );

  } );

  return rendered.substr( 0, indexes[ 0 ] )

  + childRender

  + rendered.substr( indexes[ 3 ] );

}


/**
 * extract blocks corresponding to attributes
 */

function _extractTemplateAttributeBlocks( attributes, template ) {

  var filteredTpl = _removeBlocks( attributes, template ),

  attributeBlocks = {};

  attributes.forEach( function( attr ) {

    try {

      _findBlockIndexes( filteredTpl, attr.name );
          
      attributeBlocks[ attr.mapTo ] = attr.name;

    } catch( e ) {};

  });

  return attributeBlocks;

}


function _findBlockIndexes( tpl, blockName ) {

  var openingStatement = '{block:' + blockName + '}',

  closingStatement = '{/block:' + blockName + '}',

  opening, closing;

  opening = tpl.indexOf( openingStatement );

  if ( opening == -1 ) throw 'opening block statement not found';

  closing = tpl.indexOf( closingStatement );

  if ( closing == -1 ) throw 'closing block statement not found: ' + '{/block:' + blockName + '}';

  if ( closing < opening ) throw 'closing block statement should come after opening block statement: ' + '{block:' + attr.name + '}';

  return [ opening, closing, opening + openingStatement.length, closing + closingStatement.length ];

}



/**
 * extract attributes which are effectively present in template
 */

function _extractTemplateAttributes( attributes, template ) {

  // strip template of blocks which are not attribute blocks

  var filteredTpl = _removeBlocks( attributes, template ),

  templateAttributes = {};

  attributes.forEach( function( attr ) {

    var matches = filteredTpl.match( new RegExp( '{' + attr.name + '}', 'g' ) );

    templateAttributes[ attr.mapTo ] = attr.name;

  });

  return templateAttributes;

}


function _removeBlocks( attributes, template ) {

  var stripped = template,

  attributeNames = attributes.map( function( a ) {
    return a.name;
  }),

  opening = template.match(/{block:[a-z|A-Z]+}/g);

  if ( !opening ) return template;

  opening.forEach( function( o ) {

    var name = o.replace( /{block:|}/g, '' );

    if ( attributeNames.indexOf( name ) == -1 ) {

      // it is not an attribute block;
      // kill it with the edge of the sword.
      
      stripped = _removeBlock( stripped, name );

    }

  });

  return stripped;

}


/**
 * remove block from template
 */

function _removeBlock( tpl, name ) {

  var stripped = tpl, sub;

  while( sub = _extractBlock( stripped, name ) ) {

    stripped = stripped.replace( sub, '' );

  }

  return stripped;

}


/**
 * return first occurrence
 * of block content in given template
 */

function _extractBlock( tpl, name ) {

  var o = '{block:' + name + '}', 

  cl = o.replace(/^{/, '{/'), clIndex,

  sub, oIndex = tpl.indexOf( o );

  if ( oIndex == -1 ) {

    return false;

  }

  // start from where the opening block is
  sub = tpl.substr( oIndex );

  // find closing index
  clIndex = sub.indexOf( cl );

  if ( clIndex == -1 ) {

    throw 'closing statement of block not found: ' + cl;

  }

  // remove the bit after the closing index
  sub = sub.substr( 0, clIndex + cl.length );

  return sub;

}


function _removeBlockStatement( tpl, name ) {

  return tpl.replace( new RegExp( '{(|/)block:' + name + '}', 'g' ), '' );

}

function _mergeExpected( data, tplAttributes, children ) {

  var clean = {};

  for( var i in tplAttributes ) {

    clean[ i ] = null;

    if ( typeof data[ i ] !== 'undefined' ) {

      clean[ i ] = data[ i ];

    }

  }

  if ( children ) children.forEach( function( child ) {

    clean[ child.mapTo ] = [];

    if ( typeof data[ child.mapTo ] !== 'undefined' ) {

      clean[ child.mapTo ] = data[ child.mapTo ];

    }

  });


  return clean;

}

function _removeRemainingStatements( tpl ) {

  return tpl.replace( /{(|\/)(block:|)([a-z]|[A-Z])+}/g , '');

}

function _isArray( obj ) {

  return Object.prototype.toString.call(obj) === '[object Array]';

}
},{"debug":7}],7:[function(require,module,exports){
module.exports=require(3)
},{"./debug":8,"/home/kaore/Dev/www/cibul-templates/node_modules/debug/browser.js":3}],8:[function(require,module,exports){
module.exports=require(4)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/debug/debug.js":4,"ms":9}],9:[function(require,module,exports){
module.exports=require(5)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/debug/node_modules/ms/index.js":5}],10:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":1}],11:[function(require,module,exports){
module.exports = {
  attributes: {
    lang: 'data-lang',
    config: 'data-cbctl',
    count: 'data-count'
  },
  selector: '.cbpgpr',
  timeout: 5000,
  defaultLang: 'fr',
  count: 3,
  res: {
    all: {
      json: '//openagenda.com/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?search[uid]={uid}'
    },
    dev: {
      json: '//d.openagenda.com/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?search[uid]={uid}'
    },
    tpl: {
      json: '/server/testdata/previewwidgetres.json',
      page: '#page',
      eventPart: '#/events/{uid}',
      embedEventPart: '#?search[uid]={uid}'
    }
  }
}

},{}],12:[function(require,module,exports){
"use strict";

var parser = require( 'tumblrParser' ),

cn = require(  '../../js/lib/common/common.mod.js' ),

config = require( './config' ),

UID = 0,

env = window.env ? window.env : 'prod',

tpl = require( './preview.tblr' ),

tplMap = require( './template.map.json' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

defaults = {
  uid: false, // required
  link: false, // optional. link to agenda page
  eventPart: false, // required. bit to add to link to open event
  lang: 'fr',
  useStyle: true,
  count: config.count
};

if ( cn.contains( [ 'dev', 'tpl' ], env ) ) debug.enable( '*' );

cn.addEvent( window, 'load', _init );

function widget( elem, options ) {

  var params = cn.extend( {}, defaults, options ),

  log = debug( 'preview ' + params.uid );

  if ( !params.uid ) return log( 'preview widget uid not found' );

  log( 'fetching agenda data' );

  _fetch( params.uid, function( err, data ) {

    if ( err ) return log( 'could not retrieve agenda data %s', err );

    var wTpl = _extractTemplate( tpl, elem ),

    events = _clean( data.events, { 
      lang: params.lang,
      link: params.link,
      eventPart: params.eventPart,
      count: params.count
    } );

    if ( !events.length ) return log( 'there are no upcoming events' );

    styler( style );

    elem.innerHTML = '';

    elem.insertAdjacentElement( 'afterbegin', _render( wTpl, { events: events } ) );

  } );

}

function _render( template, data ) {

  var div = document.createElement( 'div' ),

  p = parser( tplMap );

  p.load( template );

  div.innerHTML = p.render( data );

  return div;

}

function _clean( events, options ) {

  var lang = options.lang;

  return events.slice( 0, options.count ).map( function( event ) {

    var e = cn.extend( {}, event );

    _flattenMultilinguals( event, e, lang );

    _defineEventLink( event, e, options );

    if ( e.thumbnail ) e.thumbnail = e.thumbnail.replace( 'cibuldev', 'cibul' );
    if ( e.image ) e.image = e.image.replace( 'cibuldev', 'cibul' );

    return e;

  });

}

function _extractTemplate( defaultTemplate, elem ) {

  // pick out commented section
  var startIndex = elem.innerHTML.indexOf( '<!--' ),

  endIndex = elem.innerHTML.indexOf( '-->' );

  if ( startIndex == -1 || endIndex == -1 ) {

    return defaultTemplate;

  }

  return elem.innerHTML.substr( 
    startIndex + '<!--'.length, 
    endIndex - startIndex - '<!--'.length
  );

}

function _defineEventLink( event, e, options ) {

  var link = options.link,

  eventPart = options.eventPart;

  e.link = link + eventPart.replace( '{uid}', event.uid );

}


function _flattenMultilinguals( event, e, lang ) {

  cn.forEach( [ 'title', 'description', 'longDescription', 'range' ], function( field ) {
      
    var l = false;

    for( l in event[ field ] ) break;

    if ( event[ field] && typeof event[ field ][ lang ] !== 'undefined' ) {

      l = lang;

    }

    if ( l ) e[ field ] = event[ field ][ l ];

  } );

}

function _fetch( uid, cb ) {

  remote.get(
    ( config.res[ env ]  ? config.res[ env ].json : config.res.all.json ).replace( '{uid}', uid ),
    { timeout: config.timeout },
    function( responseType, data ) {

      cb( responseType === 'success' ? null : responseType, data );

    },
    env === 'tpl'
  )

}

function _filterByAttr( obj, arr ) {

  var newObj = {};

  cn.forEach( arr, function( name ) {

    if ( obj[name] !== undefined ) newObj[name] = obj[name];

  });

  return newObj;

}

function _init() {

  var res = config.res[ env ] ? config.res[ env ] : config.res.all;

  cn.forEach( cn.els( config.selector ), function( elem ) {

    var arr = elem.getAttribute( config.attributes.config ).split( '|' ),

    lang = elem.hasAttribute( config.attributes.lang ) ? elem.getAttribute( config.attributes.lang ) : config.defaultLang,

    count = elem.hasAttribute( config.attributes.count ) ? parseInt( elem.getAttribute( config.attributes.count ), 10 ) : 3,

    link = cn.el( elem, 'a' ).getAttribute( 'href' );

    widget( elem, {
      uid: arr[ UID ],
      link: link,
      eventPart: link.indexOf( 'openagenda.com' ) !== -1 ? res.eventPart : res.embedEventPart,
      useStyle: !elem.hasAttribute( config.attributes.noDefaultStyle ),
      count: count
    } );

  } );

}

},{"../../js/lib/common/common.mod.js":1,"../../js/lib/remote/remote.mod.js":2,"../lib/widgetStyler":10,"./config":11,"./preview.tblr":13,"./style.css":14,"./template.map.json":15,"debug":3,"tumblrParser":6}],13:[function(require,module,exports){
module.exports = "<ul>\n  {block:Events}\n  <li>\n    <a href=\"{Link}\">\n      <span class=\"oa-title\">{Title}</span>\n      <span class=\"oa-desc\">{Description}</span>\n      <span class=\"oa-range\">{DateRange}</span>\n    </a>\n  </li>\n  {/block:Events}\n</ul>";

},{}],14:[function(require,module,exports){
module.exports = ".oa-preview ul {\n\n  list-style-type: none;\n  padding: 0;\n\n}\n\n.oa-preview li {\n\n  padding: 0 0 1em;\n\n}\n\n.oa-preview a {\n\n  text-decoration: inherit;\n\n}\n\n.oa-preview span {\n\n  display: block;\n\n}\n\n.oa-preview .oa-title {\n\n  font-weight: bold;\n\n}";

},{}],15:[function(require,module,exports){
module.exports={
  "children" : [ {
    "name" : "Events",
    "mapTo" : "events",
    "attributes" : [ 
      { 
        "name" : "Title", 
        "mapTo": "title" 
      },
      { 
        "name" : "Description", 
        "mapTo": "description" 
      },
      { 
        "name" : "Link", 
        "mapTo": "link" 
      },
      { 
        "name" : "ImageUrl", 
        "mapTo": "image" 
      },
      { 
        "name" : "ThumbnailUrl", 
        "mapTo" : "thumbnail" 
      },
      { 
        "name" : "LocationName", 
        "mapTo": "locationName" 
      },
      { 
        "name" : "City", 
        "mapTo" : "city" 
      },
      { 
        "name" : "DateRange", 
        "mapTo": "range"
      },
      { 
        "name" : "PricingInfo", 
        "mapTo" : "pricingInfo"
      },
      { 
        "name" : "TicketUrl",
        "mapTo" : "ticketLink" 
      } 
    ]
  } ]
}
},{}]},{},[12]);
