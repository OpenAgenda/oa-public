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
var canvasElem = false,
  frameElem = false,
  onClose = false,
  onHide = false,
  beforeClose = false,
  cn = require('../common/common.mod.js');

module.exports = function(options) {

  options = cn.extend({
    classes: cn.extend({
      canvas: 'lightboxcanvas',
      frame: 'lightboxframe',
      buttonBox: 'lightboxbuttons',
      button: false,
      body: 'noscroll'
    }, options.classes?options.classes:{}),
    onOpen: false
  }, options?options:{});

  var defaultButtons = { ok: { label: 'Ok' } };

  if ( typeof options.buttons !== 'undefined' ) {

    if ( options.buttons === false ) {

      options.buttons = {};

    } else {

      options.buttons = cn.extend(defaultButtons, options.buttons);

    }

  } else {

    options.buttons = defaultButtons;

  }

  _prepare( options.classes );

  if ( options.html )
    _setContent( options.html );
  else if ( options.elems )
    _setContent( options.elems );
  else if ( options.message )
    _setMessageContent( options.message );

  if ( options.buttons ) _setButtons( options.classes, options.buttons );

  _display( options.classes );

  if ( options.onOpen ) options.onOpen( frameElem );

  onClose = options.onClose ? options.onClose : false;

  beforeClose = options.beforeClose ? options.beforeClose : false;

  onHide = options.onHide ? options.onHide : false;

  return {
    hide: function() {
      _hide( options.classes )
    }
  };

};


var _prepare = function( classes ) {

  canvasElem ? _clear( classes ) : _create( classes );

  canvasElem.className = classes.canvas;

  frameElem.className = classes.frame;

},

_display = function( classes ) {

  canvasElem.style.display = 'block';

  _positionFrame();

  cn.addClass( cn.el('body'), classes.body );

},

_create = function( classes ) {

  var frontClickFlag = false;

  // create canvas

  canvasElem = document.createElement('div');

  cn.extend(canvasElem.style, {
    position: 'absolute',
    top: cn.getScrollOffsets().y + 'px',
    height: '100%',
    width: '100%',
    display: 'none'
  });

  cn.addEvent( canvasElem, 'click', function() {

    if ( frontClickFlag ) {
      frontClickFlag = false;
      return;
    }

    _hide( classes );

  });

  cn.addEvent(window, 'scroll', function() {
    canvasElem.style.top = cn.getScrollOffsets().y + 'px';
  });

  // create frame

  frameElem = document.createElement('div');

  cn.addEvent(frameElem, 'click', function() { frontClickFlag = true; });

  cn.extend(frameElem.style, {
    display: 'inline-block',
    position: 'absolute'
  });

  canvasElem.appendChild( frameElem );

  cn.el('body').appendChild( canvasElem );

  cn.addEvent(window, 'resize', _repositionFrame);

},

_clear = function( classes ) {

  if ( beforeClose ) {

    beforeClose( frameElem );
    beforeClose = false;

  }

  while ( frameElem.childNodes.length ) {

    frameElem.removeChild( frameElem.childNodes[0] );

  }

  cn.removeClass( cn.el('body'), classes.body );


  if ( cn.el( 'body' ).style.marginTop !== '0px' ) {

    cn.el( 'body' ).scrollTop = - cn.el( 'body' ).style.marginTop.replace( 'px','' );
    
    cn.el( 'body' ).style.marginTop = 0;

  }
  

  if ( onClose ) {

    onClose();
    onClose = false;

  }

},

_hide = function( classes ) {

  _clear( classes );

  canvasElem.style.display = 'none';

  if ( onHide ) onHide();

},

_repositionFrame = function() {

  if (canvasElem.style.display == 'none') return;

  _positionFrame();

},

_positionFrame = function() {

  cn.extend(frameElem.style, {
    display: 'inline-block',
    left: Math.round((canvasElem.offsetWidth - frameElem.offsetWidth)/2) + 'px',
    top: 0,
    maxHeight: 'none',
    overflowY: 'hidden'
  });

  if (frameElem.offsetHeight > cn.windowInnerHeight()) {

    // adjust body position
    cn.el( 'body' ).style.marginTop = '-' + cn.getScrollOffsets().y + 'px';

    cn.extend(frameElem.style, {
      maxHeight: (cn.windowInnerHeight()-20) + 'px',
      overflowY: 'scroll',
      top: cn.getScrollOffsets().y + 'px'
    });

  } else {

    cn.extend(frameElem.style, { top: Math.round((canvasElem.offsetHeight - frameElem.offsetHeight)/2) + 'px' });

  }

},

_setContent = function(content) {

  if ( typeof content == 'string' ) {

    var div = document.createElement('div');

    div.innerHTML = content;

  }

  var elems = div ? div.childNodes : content;

  while ( elems.length ) {

    frameElem.appendChild(cn.isArray(elems)?elems.shift():elems[0]);

  }

  cn.forEach( cn.els( frameElem,'img' ), function(imgElem) {

    cn.addEvent( imgElem, 'load', _repositionFrame );

  });

  cn.forEach( frameElem.getElementsByTagName('script'), function( scriptElem ) {

    eval( scriptElem.innerHTML );

  });

},

_setMessageContent = function(message) {

  var p = document.createElement('p');
  p.innerHTML = message;
  frameElem.appendChild(p);

},

_setButtons = function(classes, buttons) {

  var div = document.createElement( 'div' );
  cn.addClass( div, classes.buttonBox );

  for ( var i in buttons ) {

    var button = document.createElement('button');
    button.innerHTML = buttons[i].label;

    (function( button, buttonConfig ) {

      cn.addEvent( button, 'click', function(){

        if ( buttonConfig.onClick ) buttonConfig.onClick();

        if (typeof buttonConfig.hide !== 'undefined') if ( !buttonConfig.hide ) return;

        _hide( classes );

      });

    })(button, buttons[i]);

    if ( buttons[i].className ) cn.addClass( button, buttons[i].className );

    if ( classes.button ) cn.addClass( button, classes.button );

    div.appendChild( button );

  }

  frameElem.appendChild( div );

};
},{"../common/common.mod.js":1}],3:[function(require,module,exports){
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
      script.setAttribute('type','text/javascript');
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
var cn = require('../common/common.mod.js');

module.exports = function(headSelector, sectionHeadSelector, sectionContent, options) {

  var params = cn.extend({
    canvas: false,
    submit: false,
    wrapper: false,
    wrapperClass: false,
  }, options),

  select, // our select control

  run = function() {

    if (!params.canvas) params.canvas = cn.el('body');

    if (!params.submit) params.submit = params.canvas.getElementsByTagName('input[type="submit"]')[0];

    _createSelect();

    if (params.submit) _moveSubmits();

    cn.addEvent(select, 'change', _toggleDisplay);

    _toggleDisplay();

  },

  _createSelect = function() {

    select = document.createElement('select');

    var i=-1, elemToInsert = select;

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

  _moveSubmits = function() {

    var submitElems = (typeof params.submit.length=='undefined')?[params.submit]:params.submit;

    forEach(submitElems, function(elem) {
      select.insertAdjacentElement('afterend', elem);
    });

  },

  _toggleDisplay = function() {

    var selectedIndex = select.options[select.selectedIndex].value,

    sectionElems = cn.els(params.canvas, sectionContent);

    for (var i = sectionElems.length - 1; i >= 0; i--) {

      if (i==selectedIndex) {
        cn.removeProperty(sectionElems[i].style, 'display');
      } else {
        sectionElems[i].style.display = 'none';
      }
      
    }

  },

  _popText = function(elem) {

    var nestedItem = elem, text;

    // find most nested and pick text
    while (cn.childObject(nestedItem, 0)) nestedItem = cn.childObject(nestedItem, 0);

    text = nestedItem.innerHTML;

    elem.parentNode.removeChild(elem);

    return text;

  };

  run();

};
},{"../common/common.mod.js":1}],5:[function(require,module,exports){
var cn = require('../../../js/lib/common/common.mod.js'),

selectForm = require('../../../js/lib/selectForm/selectForm.mod.js'),

frameLoader = require('./lib/frameLoader'),

lightboxPage = require( './lib/lightboxPage' ),

selectionExclude = require( './lib/selectionExclude' ),

defaultHeight = 2000;

window.hook( function( options ) {

  var refresh = frameLoader( options, {
    onRefresh: _frameHeightAdjust,
    onReady: _frameHeightAdjust
  });

  _runSelectForm( options.folded );

  lightboxPage( {
    classes: {
      disabled: 'disabled',
      lightbox: {
        frame: 'wsq lightbox-frame w500 newsletter', 
        canvas: 'lightbox-canvas', 
        buttonBox: 'lightbox-buttons', 
        button: 'small button',
        body: 'noscroll'
      }
    }
  }, {
    onClose: refresh
  });

  selectionExclude();

} );


/**
 * hide geographic menus in a select menu
 */

var _runSelectForm = function( options ) {

  cn.addEvent( window, 'load', function() {

    var params = cn.extend({
      title: '.js_title',
      canvas: '.js_folded',
      subtitle: '.js_subtitle',
      detail: '.js_detail',
      wrapper: 'div',
      wrapperClass: 'select-menu'
    }, options);

    selectForm( params.title, params.subtitle, params.detail, {
      canvas: cn.el( params.canvas ),
      wrapper: params.wrapper, 
      wrapperClass: params.wrapperClass
    });

  } );
  
},

_frameHeightAdjust = function( frameElem ) {

  frameElem.setAttribute('height', _estimateFrameHeight());

  setTimeout(function() { // approximation for image load

    frameElem.setAttribute('height', _estimateFrameHeight());

  }, 3000);

},

_estimateFrameHeight = function() {

  if ( !window.frames[0] ) {

    return;

  }

  var frameHtml = window.frames[0].document.getElementsByTagName('html')[0];

  if ( !frameHtml ) return defaultHeight;

  return window.frames[0].document.getElementsByTagName('html')[0].offsetHeight;

};
},{"../../../js/lib/common/common.mod.js":1,"../../../js/lib/selectForm/selectForm.mod.js":4,"./lib/frameLoader":6,"./lib/lightboxPage":7,"./lib/selectionExclude":8}],6:[function(require,module,exports){
/**
 * monitors form inputs and triggers refresh of iframe by posting updated values
 */

var cn = require('../../../../js/lib/common/common.mod.js');

module.exports = function( options, callbacks ) {

  var params = cn.extend({
    preview: false,    // resource for previewing newsletter based on submission
    selectors: {
      form: '.js_campaign_layout_form',
      frame: 'iframe',
      reloaders: '.js_frame_reload'
    }
  }, options);

  if ( callbacks ) cn.extend( params, callbacks );

  return instance( params );

};

/**
 * instantiate based on given params
 */

var instance = function( params ) {

  var ready = false, formElem, frameElem, baseAction,

  run = function () {

    formElem = cn.el( params.selectors.form );

    frameElem = cn.el( params.selectors.frame );

    baseAction = formElem.getAttribute( 'action' );

    cn.forEach( cn.els( params.selectors.reloaders ), _changeListener( refreshFrame ) );

    ready = true;

    if ( params.onReady ) params.onReady( frameElem );

  },


  /**
   * listen to change and trigger callback when its detected
   */

  _changeListener = function( onChange ) {

    return function( elem ) {

      cn.addEvent( elem, 'change', onChange );

    };

  },


  /**
   * trigger submission of form towards frame
   */

  refreshFrame = function() {

    if ( !ready ) return;

    formElem.setAttribute( 'target', frameElem.getAttribute('name') );

    formElem.setAttribute( 'action', params.preview );

    formElem.submit();

    formElem.removeAttribute( 'target' );

    formElem.setAttribute( 'action', baseAction );

    if ( params.onRefresh ) params.onRefresh( frameElem );

  };

  cn.addEvent( window, 'load', run );

  return refreshFrame;

};
},{"../../../../js/lib/common/common.mod.js":1}],7:[function(require,module,exports){
/**
 * loads resource in a lightbox and takes over 
 * all links of rendered lightbox content 
 * to make ajax calls
 */

var cn = require( '../../../../js/lib/common/common.mod.js' ),

lightbox = require( '../../../../js/lib/lightbox/lightbox.mod.js' ),

remote = require( '../../../../js/lib/remote/remote.mod.js' ),

formSerialize = require( 'form-serialize' ),

params = {
  selectors: {
    trigger: '.js_lightbox_trigger'
  },
  classes: {
    disabled: 'disabled',
    lightbox: {
      frame: 'wsq lightbox-frame w500', 
      canvas: 'lightbox-canvas', 
      buttonBox: 'lightbox-buttons', 
      button: 'small button'
    }
  }
};

module.exports = function( options, cbs ) {

  cn.extend( params, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    cn.forEach( cn.els( params.selectors.trigger ), function( aElem ) {

      _handleLightbox( aElem, cbs );

    } );

  });

};

var _handleLightbox = function( triggerElem, cbs ) {

  var res, data = {}, form;

  if ( triggerElem.tagName == 'FORM' ) {

    form = triggerElem;

    triggerElem = cn.el( form, 'button' );

    res = form.getAttribute( 'action' );

  } else {

    res = triggerElem.getAttribute( 'href' );

  }

  cn.addEvent( triggerElem, 'click', function( e ) {

    cn.preventDefault( e );

    if ( _isDisabled( triggerElem ) ) return;

    _disable( triggerElem ); // disables triggering elem

    if ( form ) {

      data = formSerialize( form, { hash: true } );

    }

    _loadPage( res, data, function( err, html ) {

      if ( err ) return _handleError( triggerElem, err );

      lightbox({
        html: html,
        buttons: false,
        classes: params.classes.lightbox,
        onOpen: function( frameElem ) {

          _enable( triggerElem );

          _handleLightboxContent( frameElem, cbs );
          
        },
        onHide: function() {

          cbs.onClose();

          _enable( triggerElem );

        }
      });

    });

  });

},


_handleLightboxContent = function( lightboxFrameElem, cbs ) {

  cn.forEach( cn.els( lightboxFrameElem, 'a' ), function( aElem ) {

    _handleLightbox( aElem, cbs );

  } );

  var formElem = cn.el( lightboxFrameElem, 'form' );

  if ( formElem ) _handleLightbox( formElem, cbs );

},


/**
 * fetch partial from server
 */

_loadPage = function( res, data, cb ) {

  remote.getXmlHttp( res, { timeout: 10000, data: data }, function( responseType, data) {

    if ( responseType !== 'success' ) return cb( 'unsuccessful request: ' + responseType );

    if ( !data.success ) return cb( { message: data.message } );

    cb( null, data.partial );

  });

},


/**
 * disable page lightbox buttons
 */

_disable = function( elem ) {

  cn.addClass( elem, params.classes.disabled );

},

_isDisabled = function( elem ) {

  return cn.hasClass( elem, params.classes.disabled );

}


/**
 * enable page lightbox buttons
 */

_enable = function( elem ) {

  cn.removeClass( elem, params.classes.disabled ); 

},


/**
 * handle error
 */

_handleError = function( elem, err ) {

  _enable( );

  console.log('aborting');
  console.log(err);

};
},{"../../../../js/lib/common/common.mod.js":1,"../../../../js/lib/lightbox/lightbox.mod.js":2,"../../../../js/lib/remote/remote.mod.js":3,"form-serialize":9}],8:[function(require,module,exports){
var cn = require( '../../../../js/lib/common/common.mod.js' ),

params = {
  selectors: {
    checkbox: '.js_exclude',
    options: '.js_selection_options'
  }
},

checkbox, optionsElem;

module.exports = function( options ) {

  cn.extend( params, options );

  checkbox = cn.el( params.selectors.checkbox );

  optionsElem = cn.el( params.selectors.options );

  if ( !checkbox ) return;

  _hide();

  cn.addEvent( window, 'load', function() {

    if ( !checkbox.checked ) {

      _show();

    }

    cn.addEvent( checkbox, 'click', function() {

      if ( checkbox.checked ) {

        _hide();

      } else {

        _show();

      }

    } );

  });  

};

function _show() {

  cn.removeProperty( optionsElem.style, 'display' );

};

function _hide() {

  optionsElem.style.display = 'none';

};
},{"../../../../js/lib/common/common.mod.js":1}],9:[function(require,module,exports){
// get successful control from form and assemble into object
// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

// types which indicate a submit action and are not successful controls
// these will be ignored
var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

// node names which could be successful controls
var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

// keys with brackets for hash keys
var brackets_regex = /\[(.+?)\]/g;
var brackeks_prefix_regex = /^(.+?)\[/;

// serializes form fields
// @param form MUST be an HTMLForm element
// @param options is an optional argument to configure the serialization. Default output
// with no options specified is a url encoded string
//    - hash: [true | false] Configure the output type. If true, the output will
//    be a js object.
//    - serializer: [function] Optional serializer function to override the default one.
//    The function takes 3 arguments (result, key, value) and should return new result
//    hash and url encoded str serializers are provided with this module
//    - disabled: [true | false]. If true serialize disabled fields.
function serialize(form, options) {
    if (typeof options != 'object') {
        options = { hash: !!options };
    }
    else if (options.hash === undefined) {
        options.hash = true;
    }

    var result = (options.hash) ? {} : '';
    var serializer = options.serializer || (options.hash) ? hash_serializer : str_serialize;

    var elements = form.elements || [];

    for (var i=0 ; i<elements.length ; ++i) {
        var element = elements[i];

        // ingore disabled fields
        if ((!options.disabled && element.disabled) || !element.name) {
            continue;
        }
        // ignore anyhting that is not considered a success field
        if (!k_r_success_contrls.test(element.nodeName) ||
            k_r_submitter.test(element.type)) {
            continue;
        }

        var key = element.name;
        var val = element.value;

        // we can't just use element.value for checkboxes cause some browsers lie to us
        // they say "on" for value when the box isn't checked
        if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
            val = undefined;
        }

        // value-less fields are ignored
        if (!val) {
            continue;
        }

        // multi select boxes
        if (element.type === 'select-multiple') {
            val = [];

            var options = element.options;
            for (var i=0 ; i<options.length ; ++i) {
                var option = options[i];
                if (option.selected) {
                    result = serializer(result, key, option.value);
                }
            }

            continue;
        }

        result = serializer(result, key, val);
    }

    return result;
}

// obj/hash encoding serializer
function hash_serializer(result, key, value) {
    if (key in result) {
        var existing = result[key];
        if (!Array.isArray(existing)) {
            result[key] = [existing];
        }
        result[key].push(value);
    }
    else {
        if (has_brackets(key)) {
          extract_from_brackets(result, key, value);
        }
        else {
          result[key] = value;
        }
    }

    return result;
};

// urlform encoding serializer
function str_serialize(result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value);

    // spaces should be '+' rather than '%20'.
    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
};

function has_brackets(string) {
  return string.match(brackets_regex);
};

function matches_between_brackets(string) {
    // Make sure to isolate brackets_regex from .exec() calls
    var regex = new RegExp(brackets_regex);
    var matches = [];
    var match;

    while (match = regex.exec(string)) {
      matches.push(match[1]);
    }

    return matches;
};

function extract_from_brackets(result, key, value) {
    var prefix = key.match(brackeks_prefix_regex)[1];

    // Set the key if it doesn't exist
    if (! result[prefix]) result[prefix] = {};

    var parent = result[prefix];
    var matches_between = matches_between_brackets(key);
    var length = matches_between.length;

    for (var i = 0; i < length; i++) {
        var child = matches_between[i];
        var isLast = (length === i + 1);

        if (isLast) {
            var existing = parent[child];

            if (existing) {
                if (! Array.isArray(existing)) {
                    parent[child] = [ existing ];
                }

                parent[child].push(value);
            }
            else {
                // Finally make the assignment
                parent[child] = value;
            }

        }
        else {
            // This is a nested key, set it properly for the next iteration
            parent[child] = {};
            parent = parent[child];
        }
    }

    parent = value;
};

module.exports = serialize;

},{}]},{},[5]);
