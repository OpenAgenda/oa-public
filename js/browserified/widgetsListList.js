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
(function(){

  var mTypes = {     // messages received are any of these types
    ADDRESSED: 'a', 
    OTHER: 'o', 
    BROADCAST: 'b'
  },       
  hashCache,         // used in fallback mode (hash)

  iTunnel = function(params) {

    var fallbackMode = false  // true when running on fallback (hash) mode
      , id                    // id is assigned by parent
      , isParent = false      // is parent tunnel
      , handshaken = false

    params = extend({
      target: false,          // target frame if tunnel is parent
      onReady: false,         // called when tunnel is ready to send and receive
      onReceive: false,       // called when message addressed to tunnel is received
      idName: 'id',           // name of id parameter in message. When empty and is received in parent, message is broadcast
      hashName: 't',          // used in fallback mode. name of hash parameter
      hashCache: 'v',         // used in fallback mode. name of cache parameter
      forceFallback: false,   // if set, forces hash method
      tunnelNextIdName: 'iTunnelNextId' // window variable for storing next id value
    }, typeof params == 'undefined'?{}:params),

    _init = function() {

      if (params.target) isParent = true;

      if (isParent) id = (window[params.tunnelNextIdName] == undefined)?(window[params.tunnelNextIdName] = 1)-1:window[params.tunnelNextIdName]++;

      if (!window['postMessage'] || params.forceFallback) {
        fallbackMode = true;
        _monitorHash(params.hashName, params.hashCache, _onReceive, params.target);
      } else {
        _monitorMessage(_onReceive);
      }

      // parent send id in init message, child sends empty message
      send();
      
    },
    send = function(data) {

      if (typeof data == 'undefined') data = {};

      if (typeof id != 'undefined') data[params.idName] = id;

      if (fallbackMode) {
        var newHref = _writeHash(isParent?params.target.src:document.referrer, params.hashName, params.hashCache, data);
        if (isParent)
          params.target.src = newHref;
        else
          parent.location.href = newHref;
          
      }
      else {
        _postMessage(isParent?params.target.contentWindow:parent, isParent?params.target.src:document.referrer, data);
      }

    },
    setOnReceive = function(onReceive) {

      params.onReceive = onReceive;

    },
    _onReceive = function(data) {

      if (isParent)
        switch (_messageType(params.idName, id, data)) {
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
          
        }
      else {

        // if child still doesn't know who the parent is and sees an id, it takes it and sends it back

        if (typeof data[params.idName] != 'undefined' && (!handshaken)) {
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

  _messageType = function(idName, idValue, data) {

    // if tunnel is parent and message does not contain id, its a broadcast.
    if (typeof data[idName] == 'undefined')
      return mTypes.BROADCAST;
    else if (data[idName] == idValue) 
      return mTypes.ADDRESSED;
    else 
      return mTypes.OTHER;
  },


  _postMessage = function(frame, targetUrl, data) {

    var message = Base64.encode(''.addUrlParameters(data));

    frame['postMessage'](message, targetUrl.replace(/#.*$/, ''));

  },

  _monitorMessage = function(callback) {

    addEvent(window, 'message', function(message) {

      var data = Base64.decode(message.data).getUrlParameters();

      callback(data);

    });

  },


  _monitorHash = function(hashParamName, hashCacheName, callback, target) {

    if (!hashCache) hashCache = Math.ceil(Math.random(0,100000)*1000);

    addEvent(window, 'hashchange', function() {

      var data = Base64.decode(hash.getParam(hashParamName, '', document.location.href.substr(document.location.href.replace(/#.*$/, '').length))).getUrlParameters();

      // remove hash cache value

      if (typeof data[hashCacheName] != 'undefined') delete data[hashCacheName];

      callback(data);

    });

  },


  _writeHash = function(target, hashParamName, hashCacheName, data) {

    data[hashCacheName] = hashCache++;

    var hashValue = Base64.encode(''.addUrlParameters(data))
      , targetUrl = target.replace(/#.*$/, '')
      , targetHash = target.substr(targetUrl.length).replace('#','');

    return targetUrl + '#' + hash.setParam(hashParamName, hashValue, targetHash);

  },

  extend = function(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
  },

  addEvent = function(elem, types, eventHandle) {
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
  },

  forEach = function(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  },

  Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
            Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
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

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

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
    _utf8_encode : function (string) {
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
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;

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
    }
  },

  size = function( obj ) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };


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


  if (typeof exports !== 'undefined')
    exports.iTunnel = iTunnel;
  else
    window.iTunnel = iTunnel;

})();

},{}],3:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":1,"../../js/lib/loadJs/loadJs.mod.js":3}],8:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":1,"debug":4}],9:[function(require,module,exports){
var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

debug = require( 'debug' ),

tunnelLib = require( '../../js/lib/iTunnel/iTunnel.js' ),

config = {
  events: {
    load: 'load'
  },
  scrollOffset: 50,
  heightOffset: 40
};

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

  var log,

  controller,

  hasNext = false,      // state indicating if there are more events to load

  activeEventUid = false,    // state indicating if event is being displayed or not

  autoscroll = true,    // state indicating if list should load automatically

  listPos = false,

  initing = true,

  sync, syncTimeout, queued, pending,

  currentListParams = {}, // current know state of request params

  tunnel, // link to inside of iframe

  init = function() {

    var uid = _readUid( options.anchorConfig );

    log = debug( 'list widget ' + uid );

    log( 'initing' );
    
    controller = options.register( wLib.interface( 'list', uid, {
      change : change
    } ));

    controller.getControlData( function( data ) {

      autoscroll = true;

      if ( data.ebd && !data.ebd.sc ) {

        autoscroll = false;

      }

      cn.addEvent( document, 'scroll', _monitorScroll );

    } );

    _initTunnel({
      'eventopensuccess' : _onEventOpen,
      'closeevent' : _onEventClose,
      'eventdateplaceselect' : _onEventDatePlaceSelect,
      'eventmapplaceunselect' : _onEventMapPlaceUnselect,
      'success' : _onListChange,
    });

  },

  _onEventOpen = function( data ) {

    activeEventUid = data.uid;

    _repositionToFrameTop();

    _update({ uid: data.uid });

  },

  _onEventClose = function( data ) {

    activeEventUid = false;

    _repositionToListOffset();

    _update({ uid: null });

  },

  _onEventDatePlaceSelect = function( data ) {

    if ( activeEventUid ) {

      _update({ uid: activeEventUid, location: data.location });
      
    }

  },

  _onEventMapPlaceUnselect = function( data ) {

    if ( activeEventUid ) {

      _update({ uid: activeEventUid });

    }

  },

  _isSame = function( o1, o2 ) {

    return JSON.stringify( o1 ) == JSON.stringify( o2 );

  }

  _onListChange = function( data ) {

    log( 'received data from tunnel' );

    pending = false;

    var clean = _clean( data );

    if ( !sync ) {

      if ( _isSame( clean, currentListParams ) ) {

        sync = true;

        log( 'list is in sync' );

      }

      return _processQueued();

    }

    for( var r in currentListParams ) {

      if ( typeof clean[r] == 'undefined' ) { // active unset params

        currentListParams[r] = null;

      }

    }

    /**
     * any value not expected to be changed by embed
     * is filtered out before values are copied
     */

    for( var r in _filtered( clean ) ) {

      currentListParams[r] = clean[r];

    }

    _update( currentListParams );

    _processQueued();

  },

  _processQueued = function() {

    if ( queued ) {

      _send( queued );

      queued = false;

    }

  },

  _filtered = function( values ) {

    var filteredValues = cn.extend( {}, values );

    cn.forEach( [ 'neLat', 'neLng', 'swLat', 'swLng' ], function( f ) {

      if ( filteredValues[ f ] ) delete filteredValues[ f ];

    });

    return filteredValues;

  },

  _clean = function( data ) {

    var clean = {};

    for( var i in data ) {

      if ( !cn.contains( [ 'count', 'next', 'prev', 'reset', 'event', 'page' ],  i ) ) {

        clean[ i ] = data[ i ];

      }

    }

    if ( clean.tags ) {

      clean.tags = clean.tags.split( ',' );

    }

    cn.forEach( [ 'neLat', 'neLng', 'swLat', 'swLng' ], function( f ) {

      if ( clean[ f ] ) clean[ f ] = parseFloat( clean[ f ] );

    });

    return clean;

  },

  change = function( reqParams ) {

    currentListParams = cn.extend({}, reqParams );

    var sentParams = cn.extend({
      location: null,
      tags: null,
      category: null,
      from: null,
      to: null,
      what: null,
      uid: null,
      neLat: null,
      neLng: null,
      swLat: null,
      swLng: null,
      event: config.events.load
    }, reqParams );

    log( 'change of params to "%s" - sending to frame', JSON.stringify( sentParams ) );

    if ( pending ) {

      log( 'list is pending response, queuing' );

      queued = sentParams;

    } else {

      _send( sentParams );

    }

  },

  _send = function( data ) {

    log( 'sending to frame' );

    _setUnsynced();

    pending = true;

    tunnel.send( data );

  },

  _setUnsynced = function() {

    if ( syncTimeout ) {

      clearTimeout( syncTimeout );

      syncTimeout = false;

    }

    sync = false;

    syncTimeout = setTimeout( function() { sync = true; syncTimeout = false; }, 6000 );

  },

  _monitorScroll = function() {

    if ( activeEventUid ) return;

    listPos = _scrollPosition();

    if ( autoscroll && !responsePending && hasNext && ( elem.offsetTop + elem.offsetHeight <= listPos + cn.el( 'html' ).clientHeight ) ) {
      
      responsePending = true;
      
      tunnel.send({ event: 'loadNext' });

    }

  },

  _update = function( params ) {

    log( 'updating request params "%s"', JSON.stringify( params ) );

    controller.update( 'list', params );

  },

  _initTunnel = function( cbs ) {

    tunnel = tunnelLib.iTunnel({ target: elem, onReceive: function( data ) {

      responsePending = false;

      // adjust height if required
      if ( data.height ) {

        elem.style.height = ( parseInt( data.height, 10 ) + config.heightOffset ) + 'px';

        delete data.height;

      }

      // does list have more content to load?
      
      if ( data.hasNext ) hasNext = ( data.hasNext == 'true' );

      if ( data.event == 'hasNext' ) return;

      // callback should only be called if a load has been successful

      if ( typeof cbs[ data.event ] == 'undefined' ) {

        log( 'unknown frame event: %s', data.event );

      } else {

        cbs[ data.event ]( data );

      }

    } });

  },

  _repositionToFrameTop = function() {

    var framePos = _findPos()[1];

    if ( _scrollPosition() > framePos ) {

      _scrollPosition( Math.max( 0, framePos - config.scrollOffset ) );

    }

  },

  _repositionToListOffset = function() {

    var offsetPos = listPos;

    setTimeout( function() {

      if ( offsetPos ) _scrollPosition( offsetPos );

    }, 200 );

  },

  _scrollPosition = function(value) {

    if ( typeof value !== 'undefined' ) scrollTo( 0, value );

    return cn.getScrollOffsets().y;
    
  },

  _findPos = function() {

    var curleft = 0, curtop = 0, element = elem;

    if ( element.offsetParent ) {

      do {

        curleft += element.offsetLeft;
        curtop += element.offsetTop;

      } while ( element = element.offsetParent);

    }

    return [ curleft, curtop ];

  },

  _readUid = function( src ) {

    var parts = src.split('/');

    return parts.splice(parts.length-2, 2).join('/').split('?')[ UID ];

  }

  init();

};

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpglst', { register: register }, widget );

});

},{"../../js/lib/common/common.mod.js":1,"../../js/lib/iTunnel/iTunnel.js":2,"../lib/controllerLoader":7,"../lib/widgetLib":8,"debug":4}]},{},[9]);
