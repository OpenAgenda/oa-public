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
"use strict";

var cn = require( '../common/common.mod.js' ),

remote = require( '../remote/remote.mod.js' ),

res = {
  prod: {
    agenda : '//openagenda.com/agendas/{uid}/controldata',
    embed : '//openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  dev: {
    agenda : '//d.openagenda.com/agendas/{uid}/controldata',
    embed : '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  test: {
    agenda : '//d.openagenda.com/agendas/{uid}/controldata',
    embed : '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  tpl: {
    agenda : '/server/testdata/controldata-pepite.json',
    embed : '/server/testdata/' + ( window.testControlData ? window.testControlData : 'embedcontroldata-pepite.json' )
  }
},

defaults = {
  uid: false, // required. the uid of the agenda
  embedUid: false, // optional. the uid of the embed
  jsonp: false,
}

module.exports = fetch;

function fetch( options, cb ) {

  var params = cn.extend( {}, defaults, options ),

  fetchRes = res[ window.env || 'prod' ][ params.embedUid ? 'embed' : 'agenda' ]

  .replace( '{uid}', params.uid );

  if ( params.embedUid ) {

    fetchRes = fetchRes.replace( '{embedUid}', params.embedUid );

  }

  if ( params.jsonp ) {

    fetchRes += '?callback=cb' + params.uid + ( params.embedUid || '' );

  }

  remote.get( fetchRes, { timeout: 20000 }, function( responseType, data ) {

    console.log( data );

    if ( responseType !== 'success' ) {

      return cb( responseType );

    }

    cb( null, data.data );

  }, !params.jsonp );

}

},{"../common/common.mod.js":1,"../remote/remote.mod.js":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){

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

},{"./debug":5}],5:[function(require,module,exports){

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

},{"ms":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":8}],8:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":9,"./stringify":10}],9:[function(require,module,exports){
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

},{"./utils":11}],10:[function(require,module,exports){
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

},{"./utils":11}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

geoLib = require( './geolocate' ),

controlDataFetch = require( '../../js/lib/controlDataFetch/controlDataFetch' ),

qs = require( 'qs' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    search : '//openagenda.com/widgets/{uid}/search'
  },
  dev: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  test: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  tpl: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  }
},

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );

module.exports = function( uid ) {

  var log = debug( 'controller ' + uid ),

  ctl = false,   // full agenda data in js form

  ready = false, // is server connection established

  widgets = [], // collection of interfaces to widgets handled by controller

  sendRequest = false,  // callback given by link widget to notify of request params updates

  ctlRequests = [], // stack of callbacks to call when control data is available

  currentRequestParams = {}, // current agenda request parameters

  whatUids = false, what,

  enabled = false,

  embedMode = ( ( uid + '' ).indexOf('/') !== -1 ), // embedMode is true if widget is for agenda embed

  proxy = false,

  syncHref = false,

  passedAutoLoad = true;

  return (function() {

    log( 'controller loaded in %s environment', env );

    log( 'controller is configured in %s mode', embedMode ? 'embed' : 'agenda' );

    controlDataFetch( {
      jsonp: !_isAjax(),
      uid: uid.split( '/' )[ 0 ],
      embedUid: embedMode ? uid.split( '/' )[ 1 ] : false
    }, function( err, data ) {

      if ( err || !data ) {

        log( 'problem while fetching data %s', err );

        if ( !data ) {

          log( 'not data could be retrieved' );

        }

        return;

      }

      log( 'successfully fetched control data' );

      ctl = _initControlData( data );

      syncHref = !!ctl.sh;

      if ( typeof _readHrefQuery().geolocate !== 'undefined' ) {

        geoLib( ctl, _readHrefQuery( 'geolocate' ), function( err, cornerParams ) {

          if ( err ) {

            _init();

          } else {

            _init( cornerParams );

          }

        } );

      } else {

        _init();

      }
      
    });

    return {
      register: register,
      getWidget: getWidget,
      requestModal: requestModal,
      releaseModal: releaseModal,
      update : update,
      sweep : sweep,
      getControlData: getControlData,
      getCurrentQuery: getCurrentQuery,
      isDifferent: isDifferent,
      setProxy: setProxy,
      disableSyncHref: disableSyncHref,
      disablePassedAutoLoad: disablePassedAutoLoad
    }

  })();


  function _init( initParams ) {

    _initCurrentRequestParams( initParams );

    _processWidgetCtlRequests( false );

    ready = true;

    // hack to allow some widgets to run getControlData callback once all
    // is declared ready, 
    _processWidgetCtlRequests( true );

    log( 'controller will sync with href ? %s', syncHref ? 'yes' : 'no' );

    if ( syncHref ) {

      _forEachWidget( 'change', currentRequestParams );

      cn.addEvent( window, 'popstate', _handlePop );

    }

    _fetchWhatUids( function() {

      sweep();

    });

  }

  function _handlePop() {

    if ( !syncHref ) return;

    update( _readHrefQuery( 'search' ) );

  }


  /**
   * register a widget - run by widget to establish link with controller
   */

  function register( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    log( 'registering widget %s', widgetParams.name );

    widgets.push( widgetParams );

    return {
      update: update,
      getControlData: getControlData,
      requestModal: requestModal,
      releaseModal: releaseModal,
      getCurrentQuery: getCurrentQuery,
      isDifferent: isDifferent
    };

  }


  function getWidget( name ) {

    var widgetParams = false;

    cn.forEach( widgets, function( widget ) {

      if ( widget.name == name ) {

        widgetParams = widget;

      }

    });

    return widgetParams;

  }


  /**
   * hand over control data when ready.
   */
  
  function getControlData( postReady, cb ) {

    if ( !cb ) {

      cb = postReady;

      postReady = false;

    }

    if ( ctl ) {

      log( 'control data available, handing over' );

      cb( ctl );

    } else {

      log( 'control data not yet available, stacking request' );

      ctlRequests.push( [ postReady, cb ] );

    }

  }


  function getCurrentQuery() {

    return cn.extend( {}, currentRequestParams );

  }


  function setProxy( p ) {

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
  
  function update( originWidget, updatedParams ) {

    if ( arguments.length == 1 ) {

      updatedParams = originWidget;

      originWidget = {};

    }

    log( 'updating with %s', JSON.stringify( updatedParams ) );

    var newParams = cn.extend( {}, currentRequestParams, { 
      uid: null
    }, updatedParams );

    if ( !isDifferent( newParams ) ) return;

    currentRequestParams = _clean( newParams );

    if ( !ready ) {

      log( 'control data not yet received' );

      return;

    }

    if ( proxy && proxy.update ) proxy.update( updatedParams );

    if ( syncHref ) {

      _updateHrefQuery( currentRequestParams );

    }

    _forEachWidget( 'change', currentRequestParams, originWidget );

    _forEachWidget( 'disable', originWidget );

    _fetchWhatUids( function() {

      sweep();

    });

  }


  function _fetchWhatUids( cb ) {

    if ( what === currentRequestParams.what ) return cb();

    whatUids = false;

    what = currentRequestParams.what;

    if ( !what ) return cb();

    remote.getJsonp( params.search.replace( '{uid}', uid ), { 
      data: { search: { what: what } }, 
      timeout: 10000 
    }, function( responseType, data ) {

      if ( responseType == 'success' ) {

        whatUids = data;

      }

      cb();

    } );

  }


  /**
   * disable all widgets except caller
   */
  
  function requestModal( name, cb ) {

    _forEachWidget( 'disable', name );

    enabled = false;

    if ( cb ) cb();

  }


  /**
   * re-enables all widgets
   */
  
  function releaseModal() {

    _forEachWidget( 'enable' );

    enabled = true;

  }


  function _initCurrentRequestParams( overridingParams ) {

    var today = new Date();

    if ( typeof overridingParams !== 'undefined' ) {

      currentRequestParams = overridingParams;

      if ( syncHref ) _updateHrefQuery( currentRequestParams );

      return;

    }


    if ( syncHref ) {

      currentRequestParams = _cleanSearch( _readHrefQuery( 'search' ) );

    }

    if ( ctl.lo ) {

      // bit of a transitional hack (2015-03-06) - remove ctl.p in other widgets before anything here
      ctl.p = today > new Date( ctl.lo.end );

    }

    if ( ctl.p && passedAutoLoad && typeof currentRequestParams.passed == 'undefined' ) {

      currentRequestParams.passed = 1;

      if ( syncHref ) _updateHrefQuery( currentRequestParams );

    }

  }



  function _hasControlData() {

    return !!ctl;

  }


  /**
   * run method of each widget at the optional exception of...
   */
  
  function _forEachWidget( methodName, methodParams, except ) {

    if ( ( arguments.length == 2 ) && ( typeof methodParams == 'string' ) ) {

      except = methodParams;

      methodParams = {}

    } else if ( arguments.length == 2 ) {

      except = false;

    } else if ( arguments.length == 1 ) {

      methodParams = {};

      except = false;

    }

    log( 'running %s for all widgets with %s except for %s', methodName, JSON.stringify( methodParams ), except ? except : 'no one' );

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[i].name !== except ) {

        if ( widgets[i][ methodName ] ) {

          widgets[i][ methodName ]( methodParams );

        } else {

          log( '%s not set for widget "%s"', methodName, widgets[i].name );

        }

      }
    
    }

  }


  function _processWidgetCtlRequests( postReady ) {

    var toProcess = ctlRequests.length;

    var stackedCallback, restacked = [];

    // send control data to whoever requested it during registration process
    while ( stackedCallback = ctlRequests.pop() ) {

      if ( stackedCallback[ 0 ] === postReady ) {

        stackedCallback[ 1 ]( ctl );

      } else {

        restacked.push( stackedCallback );

      }

    }

    ctlRequests = restacked;

  }


  function _initControlData( data ) {

    // distribute location data throughout events

    var locations = {},

    today = _stringifyDate();

    cn.forEach( data.l, function( l ) {

      locations[ l.u ] = { lt: l.lt, lg: l.lg };

    });

    data.geolocate = typeof _readHrefQuery().geolocate !== 'undefined';

    cn.forEach( data.ev, function( e ) {

      if ( e.l ) {

        if ( typeof locations[ e.l ] !== 'undefined' ) {

          e.lt = locations[ e.l ].lt;

          e.lg = locations[ e.l ].lg;

        } else {

          console.log( 'invalid location for event' );
          console.log( e );

        }

      }


      // append is passed info

      e.p = true;
      
      for (var i = e.d.length - 1; i >= 0; i--) {

        if ( e.d[ i ] >= today ) {

          e.p = false;

          break;

        }

      };

    });

    locations = undefined;

    return data;

  }


  function _isAjax() {

    if ( embedMode && ( window.env !== 'tpl' ) ) {

      return false;

    }

    return true;

  }


  /**
   * uses the control data ( agenda js data ) to determine which
   * events are included and which are not
   */
  
  function sweep() {

    var includedCount = 0;

    if ( typeof currentRequestParams == 'undefined' ) currentRequestParams = {};

    if ( !ready ) {

      log( 'controller not ready, sweep aborted' );

      return;

    }

    log( 'doing sweep with params %s', JSON.stringify( currentRequestParams ) );

    // clear all the widgets!
    _forEachWidget( 'clear' );

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.ev ) {

      if ( _applyFilters( ctl.ev[i], currentRequestParams ) ) {

        includedCount++;

        ctl.ev[i].passed = _isPassed( ctl.ev[i] );

        _include( ctl.ev[i], currentRequestParams );

      }
    
    }

    log( 'sweep result %d out of %d', includedCount, cn.size( ctl.a ) );

    // enable all the widgets!
    _forEachWidget( 'enable', currentRequestParams );

  }


  /**
   * have there been any changes in parameters?
   */
  
  function isDifferent( data ) {

    for ( var i in currentRequestParams ) {

      if ( typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    for ( i in data ) {

      if ( typeof currentRequestParams[i] == 'undefined' ) return true;

      if ( data[i] !== currentRequestParams[i] ) return true;

    }

    return false;

  }


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  function _include( item, p ) {

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[ i ].include ) {

        widgets[i].include( item, p );  

      }

    }

  }

  
  function _applyFilters( item, reqParams ) {

    for ( var i in filters ) {

      if ( !filters[i]( item, reqParams, whatUids ) ) return false;

    }

    return true;

  }


  function _clean( data ) {

    var cleanData = {};

    for ( var k in data ) {

      if ( data[ k ] !== null ) {

        cleanData[ k ] = data[ k ];

      }

    }

    return cleanData;

  }


  function _isPassed( eItem ) {

    var today = _stringifyDate( new Date() );

    for ( var i = eItem.d.length - 1; i >= 0; i-- ) {
      
      if ( eItem.d[ i ] >= today ) return false;

    };

    return true;

  }

  function _updateHrefQuery( updatedQuery ) {

    log( 'attempting to update href query' );

    var href = window.location.href, dashPart = false, query = false, queryPart;

    if ( href.split( '#' ).length > 1 ) {

      dashPart = href.split( '#' )[ 0 ];

    }

    href = href.split( '?' )[ 0 ];

    if ( ( typeof window.history == 'undefined' ) || ( typeof window.history.pushState == 'undefined' ) ) {

      log( 'window.history is not available' );

    } else {

      query = _readHrefQuery();
      
      if ( cn.size( updatedQuery ) ) {

        query.search = updatedQuery;

      } else {

        delete query.search;

      }

      if ( cn.size( query ) ) {

        href = href + '?' + qs.stringify( query );

      }

      if ( dashPart ) {

        href = href + '#' + dashPart;

      }

      if ( ( typeof window.history !== 'undefined' ) && ( typeof window.history.pushState !== 'undefined' ) ) {

        window.history.pushState( updatedQuery, null, href );
        
      }

      
    }

  }

  function _readHrefQuery( key ) {

    var query = {}, queryParts;

    try {

      queryParts = window.location.href.split('#')[0].split( '?' ).slice( 1 );

      if ( queryParts.length ) {

        query = qs.parse( queryParts[ 0 ] );

      }

      return key ? ( query[ key ] ? query[ key ] : {} ) : query;

    } catch( e ) {

      log( 'had some trouble reading href query: %s', e );

    }

    return {};

  }

  function _cleanSearch( search ) {

    var cleanTags = [];

    if ( !search ) return;

    cn.forEach( [ 'neLat', 'neLng', 'swLat', 'swLng' ], function( f ) {

      if ( search[ f ] ) search[ f ] = parseFloat( search[ f ] );

    });


    if ( ( typeof search.tags !== 'undefined' ) && cn.isArray( search.tags ) ) {

      cn.forEach( search.tags, function( tag ) {

        if ( tag.length ) cleanTags.push( tag );

      });

      if ( !cleanTags.length ) {

        delete search.tags;

      } else {

        search.tags = cleanTags;

      }

    }

    return search;

  }

  function _stringifyDate( d ) {

    if ( !d ) d = new Date();

    return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

  }

  function _fZ( str ) {

    if ( ( str + '' ).length == 1 ) {

      return '0' + str;

    }

    return str;

  }

}

},{"../../js/lib/common/common.mod.js":1,"../../js/lib/controlDataFetch/controlDataFetch":2,"../../js/lib/remote/remote.mod.js":3,"./filters":13,"./geolocate":14,"debug":4,"qs":7}],13:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod' );


module.exports = {
  what: what,
  //passed: passed,
  event: event,
  categories: categories,
  tags: tags,
  organizations: organizations,
  locations: locations,
  dates: dates
}


function what( item, reqParams, whatUids ) {

  if ( reqParams.what ) {

    if ( !whatUids || whatUids.indexOf( parseInt( item.u, 10 ) ) == -1 ) {

      return false;

    }

  }

  return true;

}


function passed( item, reqParams ) {

  var today = new Date();

  today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

  if ( !reqParams.passed && !reqParams.from ) {

    for ( var i in item.d ) {

      if ( item.d[ i ] >= today ) {

        return true;

      }

    }

    return false;

  }

  return true;

}


function event( item, reqParams ) {
  
  if ( reqParams.uid ) {

    return (item.u + '') == (reqParams.uid + '');

  };

  return true;

}


function categories( item, reqParams ) {

  if ( reqParams.category && ( item.c !== reqParams.category ) ) return false;

  return true;

}


function tags( item, reqParams ) {

  var reqTags;

  if ( !reqParams.tags ) return true;

  reqTags = typeof reqParams.tags == 'string' ? [ reqParams.tags ] : reqParams.tags;

  if ( !reqTags.length ) return true;

  if ( !item.t ) return false;

  for ( var i = reqTags.length - 1; i >= 0; i-- ) {

    if ( !cn.contains( item.t, reqTags[ i ] ) ) return false;

  }

  return true;

}


function organizations( item, reqParams ) {

  if ( reqParams.org && ( ( !item.org ) || ( item.org.s !== reqParams.org ) ) ) return false;

  return true;

}


function dates( item, reqParams ) {

  if ( !reqParams.from ) {

    return true;

  }

  var period = [ reqParams.from, reqParams.to ? reqParams.to : reqParams.from ];

  for ( var i in item.d ) {

    if ( ( item.d[ i ] >= period[ 0 ] ) && ( item.d[ i ] <= period[ 1 ] ) ) {

      return true;

    }

  }

  return false;

}


function locations( item, reqParams ) {

  if ( reqParams.location ) {

    return parseInt( reqParams.location, 10 ) == item.l;

  }

  // is one of the locations within square... works most places
  
  if ( reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng ) {

    var ne = [ parseFloat(reqParams.neLat), parseFloat(reqParams.neLng) ], 

    sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)];

    if ( (item.lt <= ne[0] ) &&

    ( item.lg <= ne[1] ) &&

    ( item.lt >= sw[0] ) &&

    ( item.lg >= sw[1]) ) return true;

    return false;

  }

  return true;

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
};

},{"../../js/lib/common/common.mod":1}],14:[function(require,module,exports){
"use strict";

module.exports = function( ctlData, initValues, cb ) {

  var requestTimeout;

  if ( initValues.lat && initValues.lng ) return cb( null, [ initValues.lat, initValues.lng ] );

  if ( !_hasFeature() ) return cb( 'navigator cannot geolocate' );

  if ( !initValues.count ) initValues.count = 10;

  initValues.count = Math.min( initValues.count, 50 );

  requestTimeout = setTimeout( function() {
    cb( 'user did not respond to geolocate' );
  }, 5000 );

  _requestGeolocation( function( err, coords ) {

    clearTimeout( requestTimeout );

    if ( err ) return cb( err );

    // find distance from point encompassing the count locations
    
    var closest = _extractClosest( ctlData.l, coords, initValues.count ),

    boundParams = _determineBounds( closest );

    cb( null, boundParams );

  } );

}


function _determineBounds( locations ) {

  var neLat = false, neLng = false,

  swLat = false, swLng = false,

  lat, lng;

  for ( var l in locations ) {

    var lat = locations[ l ].lt,

    lng = locations[ l ].lg;

    if ( !neLat ) {
      
      neLat = swLat = lat;

      neLng = swLng = lng;

    } else {

      if ( lat > neLat ) neLat = lat;

      if ( lat < swLat ) swLat = lat;

      if ( lng > neLng ) neLng = lng;

      if ( lng < swLng ) swLng = lng;

    }

  }

  return {
    neLat: neLat,
    neLng: neLng,
    swLat: swLat,
    swLng: swLng
  }

}


/**
 * given a lat/lng pair and a list of locations, find the 'count' first locations
 */

function _extractClosest( locations, coords, count, cb ) {

  var currentLocation, currentDistance,

  furthestDistance = false, closestDistances = [], newFurthest = false,

  closestLocations = {},

  processed = {};

  for (var i = locations.length - 1; i >= 0; i--) {

    currentLocation = locations[ i ];

    if ( typeof processed[ currentLocation.u ] == 'undefined' ) {

      currentDistance = parseInt( _distance( currentLocation.lt, currentLocation.lg, coords[ 0 ], coords[ 1 ] ), 10 );

      if ( ( closestDistances.length >= count ) && ( currentDistance < furthestDistance ) ) {

        // one needs to go and be replaced

        newFurthest = currentDistance; // furthest is once again unknown


        for( var c in closestDistances ) {

          if ( closestDistances[ c ] == furthestDistance ) {

            // the furthest is out and replaced
            closestDistances[ c ] = currentDistance;
            closestLocations[ c ] = currentLocation;

          } else {

            if ( closestDistances[ c ] > newFurthest ) {

              // new furthest is found
              newFurthest = closestDistances[ c ];

            }

          }

        }

        furthestDistance = newFurthest;

      } else if ( closestDistances.length < count ) {
          
        closestDistances.push( currentDistance );

        closestLocations[ closestDistances.length - 1 ] = currentLocation;

        if ( !furthestDistance || ( currentDistance > furthestDistance ) ) {

          furthestDistance = currentDistance;

        }

      }

      processed[ currentLocation.u ] = true;

    }

  };

  return closestLocations;
  
}

function _distance( lat1, lon1, lat2, lon2 ) {
  
  var radlat1 = Math.PI * lat1 / 180,
  
  radlat2 = Math.PI * lat2 / 180,
  
  radlon1 = Math.PI * lon1 / 180,
  
  radlon2 = Math.PI * lon2 / 80,
  
  radtheta = Math.PI * (lon1-lon2)/180;
  
  return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

}


function _requestGeolocation( cb ) {

  navigator.geolocation.getCurrentPosition( function ( pos ) {

    cb( null, [ pos.coords.latitude, pos.coords.longitude ] );

  }, function( err ) {

    cb( err.message );

  } );

}


function _hasFeature() {

  return 'geolocation' in navigator;

}

},{}],15:[function(require,module,exports){
"user strict";

/**
 * handle widget registration to page controllers
 */

if ( !window.cibul ) {

  var debug = require( 'debug' ),

  cn = require( '../../js/lib/common/common.mod.js' ),

  controller = require( './controller' );

  if ( window.env == 'tpl' ) debug.enable( '*' );

  var log = debug( 'controllers' ),

  controllers = {},

  getCallbacks = {};

  window.cibul = {};

  /**
   * called by a widget to register itself to the right controller
   */

  window.cibul.registerWidget = function( options, cb ) {

    var widgetParams = cn.extend( {
      name: false,      // required. name of the widget
      uid: false        // required. the uid of the agenda/embed
    }, options );

    log( 'widget register request received from %s', widgetParams.name );

   // create controller if not existing

    if ( typeof controllers[ widgetParams.uid ] == 'undefined' ) {

      controllers[ widgetParams.uid ] = controller( widgetParams.uid );

    }

    if ( typeof getCallbacks[ widgetParams.name ] !== 'undefined' ) {

      log( 'calling getWidget callback' );

      getCallbacks[ widgetParams.name ]( widgetParams );

    }

    // register widget with right controller

    return controllers[ widgetParams.uid ].register( widgetParams );

  };


  /**
   * called for getting a handle on controller
   */

  window.cibul.getController = function( uid ) {

    if ( !uid ) {

      throw 'agenda uid is missing';

    }

    if ( !controllers[ uid ] ) {

      log( 'getController: controller not existing > creating: %s', uid );

      controllers[ uid ] = controller( uid );

    }

    return controllers[ uid ];

  }



  /**
   * for admin only. get widget to fetch config data
   */

  exports.getWidget = function( name, cb ) {

    log( 'attempting to get widget %s', name );

    if ( !cn.size( controllers ) ) {

      getCallbacks[ name ] = cb;

      return;

    }

    for( var c in controllers ) break;

    return controllers[c].getWidget( name );

  };

}

},{"../../js/lib/common/common.mod.js":1,"./controller":12,"debug":4}]},{},[15]);
