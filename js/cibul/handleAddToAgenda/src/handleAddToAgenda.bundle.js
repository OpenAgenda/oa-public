!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.handleAddToAgenda=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var cn = _dereq_('../../../lib/common/common.mod.js'),

remote = _dereq_('../../../lib/remote/remote.mod.js'),

inited = false;

lightbox = _dereq_('../../../lib/lightbox/lightbox.mod.js'),

lbDefautlts = {},

lbInst = false,

params = {
  url: '/share/event/{slug}',
  w: false, // required - the window object
  eh: false, // required - the event handler
  canvas: false,  // where the link should be placed in the list item
  wrapper: false, // if the link should be set in a wrapping element
  init: {selector: false, attribute: false}, // used if page is preloaded and initial sweep must be made looking at slug
  events: {
    itemReady: 'listItemReady',
    responseReceived: 'eventshareresponse',
    sessionData: 'getsessiondata'
  },
  template: '<a><%= label %></a>',
  attribute: 'data-ata-enabled',
  classes: {
    link: 'url',
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      button: 'small button'
    }
  },
  labels: {
    wrong: 'Something went wrong. Please try again later or share from the event page.',
    link: 'add to agenda'
  }
};

module.exports = function(options) {

  cn.extend(params, options?options:{});

  params.eh.trigger(params.events.sessionData, function(data) {

    if (data.logged) init();

  });

};

var init = function() {

  lbDefaults = { classes: params.classes.lightbox, buttons: false };

  params.eh.on(params.events.itemReady, function(item) {

    if (!cn.contains(['article', 'event'], item.data.template)) return;

    processListItem(item.element, item.data.values.slug);

  });

  if (params.init.selector) forEach(els(params.init.selector), function(element) {

    processListItem(element, element.getAttribute(params.init.attribute));

  });

  if (!inited) {

    params.eh.on('eventshareresponse', handleShareResponse);

  }

  inited = true;

},

processListItem = function(element, slug) {

  if (!element.hasAttribute(params.attribute))
    element.setAttribute(params.attribute, '1');
  else
    return;

  var link = createAndAppendLink(element);

  cn.addEvent(link, 'click', function(e) {

    cn.preventDefault(e);

    displayShareMenu(slug);

  });

},

createAndAppendLink = function(element) {

  var wrapper = document.createElement(params.wrapper?params.wrapper:'div');

  wrapper.innerHTML = params.template.replace('<%= label %>', params.labels.link);

  var link = cn.childObject(wrapper, 0);

  cn.addClass(link, params.classes.link);

  (params.canvas?el(element, params.canvas):element).appendChild(params.wrapper?wrapper:link);

  return link;

},

displayShareMenu = function(slug) {

  remote.getXmlHttp(params.url.replace('slug', slug), {data: {ajax_post: '1'}}, function(responseType, data) {

    var lbParams = cn.extend({}, lbDefaults);

    if (data.success === false) {

      cn.extend(lbParams, { message: data.message, buttons: true });

    } else {

      cn.extend(lbParams, { html: data.partial });

    }

    lbInst = lightbox(lbParams);

  });

},

handleShareResponse = function(data) {

  if (lbInst) lbInst.hide();

  if (!data.success) return lightbox({message: params.labels.wrong, classes: params.classes.lightbox});

  if (!data.valid) return lightbox({html: data.partial, classes: params.classes.lightbox, buttons: false});

  lightbox({message: data.message, classes: params.classes.lightbox});

};
},{"../../../lib/common/common.mod.js":2,"../../../lib/lightbox/lightbox.mod.js":3,"../../../lib/remote/remote.mod.js":4}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
var canvasElem = false,
  frameElem = false,
  onClose = false,
  beforeClose = false,
  cn = _dereq_('../common/common.mod.js');

module.exports = function(options) {

  options = cn.extend({
    classes: cn.extend({
      canvas: 'lightboxcanvas',
      frame: 'lightboxframe',
      buttonBox: 'lightboxbuttons',
      button: false
    }, options.classes?options.classes:{}),
    onOpen: false
  }, options?options:{});

  var defaultButtons = { ok: { label: 'Ok' } };

  if (typeof options.buttons !== 'undefined') {
    if (options.buttons === false)
      options.buttons = {};
    else
      options.buttons = cn.extend(defaultButtons, options.buttons);
  } else {
    options.buttons = defaultButtons;
  }

  _prepare(options.classes);

  if (options.html)
    _setContent(options.html);
  else if (options.elems)
    _setContent(options.elems);
  else if (options.message)
    _setMessageContent(options.message);

  if (options.buttons) _setButtons(options.classes, options.buttons);

  _display();

  if (options.onOpen) options.onOpen(frameElem);
  onClose = options.onClose?options.onClose:false;
  beforeClose = options.beforeClose?options.beforeClose:false;

  return {
    hide: _hide
  };

};


var _prepare = function(classes) {

  canvasElem?_clear():_create();

  canvasElem.className = classes.canvas;
  frameElem.className = classes.frame;

},

_display = function() {

  canvasElem.style.display = 'block';

  _positionFrame();

},

_create = function() {

  var frontClickFlag = false;

  // create canvas

  canvasElem = document.createElement('div');

  cn.extend(canvasElem.style, {
    position: 'absolute',
    top: getScrollOffsets().y + 'px',
    height: '100%',
    width: '100%',
    display: 'none'
  });

  addEvent(canvasElem, 'click', function() {

    if (frontClickFlag) {
      frontClickFlag = false;
      return;
    }

    _hide();

  });

  addEvent(window, 'scroll', function() {
    canvasElem.style.top = getScrollOffsets().y + 'px';
  });

  // create frame

  frameElem = document.createElement('div');

  addEvent(frameElem, 'click', function() { frontClickFlag = true; });

  cn.extend(frameElem.style, {
    display: 'inline-block',
    position: 'absolute'
  });

  canvasElem.appendChild(frameElem);

  cn.el('body').appendChild(canvasElem);

  addEvent(window, 'resize', _repositionFrame);

},

_clear = function() {

  if (beforeClose) {
    beforeClose(frameElem);
    beforeClose = false;
  }

  while (frameElem.childNodes.length)
    frameElem.removeChild(frameElem.childNodes[0]);

  if (onClose) {
    onClose();
    onClose = false;
  }

},

_hide = function() {

  _clear();

  canvasElem.style.display = 'none';

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

  if (frameElem.offsetHeight > windowInnerHeight()) {

    cn.extend(frameElem.style, {
      maxHeight: (windowInnerHeight()-20) + 'px',
      overflowY: 'scroll'
    });

  } else {

    cn.extend(frameElem.style, { top: Math.round((canvasElem.offsetHeight - frameElem.offsetHeight)/2) + 'px' });

  }

},

_setContent = function(content) {

  if (typeof content == 'string') {

    var div = document.createElement('div');

    div.innerHTML = content;

  }

  var elems = div?div.childNodes:content;

  while (elems.length)
    frameElem.appendChild(isArray(elems)?elems.shift():elems[0]);

  forEach(els(frameElem,'img'), function(imgElem) {
    addEvent(imgElem, 'load', _repositionFrame);
  });

  forEach(frameElem.getElementsByTagName('script'), function(scriptElem) {
    eval(scriptElem.innerHTML);
  });

},

_setMessageContent = function(message) {

  var p = document.createElement('p');
  p.innerHTML = message;
  frameElem.appendChild(p);

},

_setButtons = function(classes, buttons) {

  var div = document.createElement('div');
  addClass(div, classes.buttonBox);

  for (i in buttons) {

    var button = document.createElement('button');
    button.innerHTML = buttons[i].label;

    (function(button, buttonConfig) {

      addEvent(button, 'click', function(){

        if (buttonConfig.onClick) buttonConfig.onClick();

        if (typeof buttonConfig.hide !== 'undefined') if (!buttonConfig.hide) return;

        _hide();

      });

    })(button, buttons[i]);

    if (buttons[i].className) addClass(button, buttons[i].className);

    if (classes.button) addClass(button, classes.button);

    div.appendChild(button);

  }

  frameElem.appendChild(div);

};
},{"../common/common.mod.js":2}],4:[function(_dereq_,module,exports){
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
},{}]},{},[1])
(1)
});