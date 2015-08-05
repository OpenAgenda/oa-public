(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var rsplit = function(string, regex) {
  var result = regex.exec(string),retArr = new Array(), first_idx, last_idx, first_bit;
  while (result != null)
  {
    first_idx = result.index; last_idx = regex.lastIndex;
    if ((first_idx) != 0)
    {
      first_bit = string.substring(0,first_idx);
      retArr.push(string.substring(0,first_idx));
      string = string.slice(first_idx);
    }   
    retArr.push(result[0]);
    string = string.slice(result[0].length);
    result = regex.exec(string);  
  }
  if (! string == '')
  {
    retArr.push(string);
  }
  return retArr;
},
chop =  function(string){
    return string.substr(0, string.length - 1);
},
extend = function(d, s){
    for(var n in s){
        if(s.hasOwnProperty(n))  d[n] = s[n]
    }
},


EJS = function( options ){
  options = typeof options == "string" ? {view: options} : options
    this.set_options(options);
  if(options.precompiled){
    this.template = {};
    this.template.process = options.precompiled;
    EJS.update(this.name, this);
    return;
  }
    if(options.element)
  {
    if(typeof options.element == 'string'){
      var name = options.element
      options.element = document.getElementById(  options.element )
      if(options.element == null) throw name+'does not exist!'
    }
    if(options.element.value){
      this.text = options.element.value
    }else{
      this.text = options.element.innerHTML
    }
    this.name = options.element.id
    this.type = '['
  }else if(options.url){
        options.url = EJS.endExt(options.url, this.extMatch);
    this.name = this.name ? this.name : options.url;
        var url = options.url
        //options.view = options.absolute_url || options.view || options.;
    var template = EJS.get(this.name /*url*/, this.cache);
    if (template) return template;
      if (template == EJS.INVALID_PATH) return null;
        try{
            this.text = EJS.request( url+(this.cache ? '' : '?'+Math.random() ));
        }catch(e){}

    if(this.text == null){
            throw( {type: 'EJS', message: 'There is no template at '+url}  );
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
    render : function(object, extra_helpers){
        object = object || {};
        this._extra_helpers = extra_helpers;
    var v = new EJS.Helpers(object, extra_helpers || {});
    return this.template.process.call(object, object,v);
  },
    update : function(element, options){
        if(typeof element == 'string'){
      element = document.getElementById(element)
    }
    if(options == null){
      _template = this;
      return function(object){
        EJS.prototype.update.call(_template, element, object)
      }
    }
    if(typeof options == 'string'){
      params = {}
      params.url = options
      _template = this;
      params.onComplete = function(request){
        var object = eval( request.responseText )
        EJS.prototype.update.call(_template, element, object)
      }
      EJS.ajax_request(params)
    }else
    {
      element.innerHTML = this.render(options)
    }
    },
  out : function(){
    return this.template.out;
  },
    /**
     * Sets options on this view to be rendered with.
     * @param {Object} options
     */
  set_options : function(options){
        this.type = options.type || EJS.type;
    this.cache = options.cache != null ? options.cache : EJS.cache;
    this.text = options.text || null;
    this.name =  options.name || null;
    this.ext = options.ext || EJS.ext;
    this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
  }
};
EJS.endExt = function(path, match){
  if(!path) return null;
  match.lastIndex = 0
  return path+ (match.test(path) ? '' : this.ext )
}




/* @Static*/
EJS.Scanner = function(source, left, right) {
  
    extend(this,
        {left_delimiter:  left +'%',
         right_delimiter:   '%'+right,
         double_left:     left+'%%',
         double_right:    '%%'+right,
         left_equal:    left+'%=',
         left_comment:  left+'%#'})

  this.SplitRegexp = left=='[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('('+this.double_left+')|(%%'+this.double_right+')|('+this.left_equal+')|('+this.left_comment+')|('+this.left_delimiter+')|('+this.right_delimiter+'\n)|('+this.right_delimiter+')|(\n)') ;
  
  this.source = source;
  this.stag = null;
  this.lines = 0;
};

EJS.Scanner.to_text = function(input){
  if(input == null || input === undefined)
        return '';
    if(input instanceof Date)
    return input.toDateString();
  if(input.toString) 
        return input.toString();
  return '';
};

EJS.Scanner.prototype = {
  scan: function(block) {
     scanline = this.scanline;
   regex = this.SplitRegexp;
   if (! this.source == '')
   {
     var source_split = rsplit(this.source, /\n/);
     for(var i=0; i<source_split.length; i++) {
       var item = source_split[i];
       this.scanline(item, regex, block);
     }
   }
  },
  scanline: function(line, regex, block) {
   this.lines++;
   var line_split = rsplit(line, regex);
   for(var i=0; i<line_split.length; i++) {
     var token = line_split[i];
       if (token != null) {
        try{
            block(token, this);
      }catch(e){
        throw {type: 'EJS.Scanner', line: this.lines};
      }
       }
   }
  }
};


EJS.Buffer = function(pre_cmd, post_cmd) {
  this.line = new Array();
  this.script = "";
  this.pre_cmd = pre_cmd;
  this.post_cmd = post_cmd;
  for (var i=0; i<this.pre_cmd.length; i++)
  {
    this.push(pre_cmd[i]);
  }
};
EJS.Buffer.prototype = {
  
  push: function(cmd) {
  this.line.push(cmd);
  },

  cr: function() {
  this.script = this.script + this.line.join('; ');
  this.line = new Array();
  this.script = this.script + "\n";
  },

  close: function() {
  if (this.line.length > 0)
  {
    for (var i=0; i<this.post_cmd.length; i++){
      this.push(pre_cmd[i]);
    }
    this.script = this.script + this.line.join('; ');
    line = null;
  }
  }
  
};


EJS.Compiler = function(source, left) {
    this.pre_cmd = ['var ___ViewO = [];'];
  this.post_cmd = new Array();
  this.source = ' ';  
  if (source != null)
  {
    if (typeof source == 'string')
    {
        source = source.replace(/\r\n/g, "\n");
            source = source.replace(/\r/g,   "\n");
      this.source = source;
    }else if (source.innerHTML){
      this.source = source.innerHTML;
    } 
    if (typeof this.source != 'string'){
      this.source = "";
    }
  }
  left = left || '<';
  var right = '>';
  switch(left) {
    case '[':
      right = ']';
      break;
    case '<':
      break;
    default:
      throw left+' is not a supported deliminator';
      break;
  }
  this.scanner = new EJS.Scanner(this.source, left, right);
  this.out = '';
};
EJS.Compiler.prototype = {
  compile: function(options, name) {
    options = options || {};
  this.out = '';
  var put_cmd = "___ViewO.push(";
  var insert_cmd = put_cmd;
  var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);   
  var content = '';
  var clean = function(content)
  {
      content = content.replace(/\\/g, '\\\\');
        content = content.replace(/\n/g, '\\n');
        content = content.replace(/"/g,  '\\"');
        return content;
  };
  this.scanner.scan(function(token, scanner) {
    if (scanner.stag == null)
    {
      switch(token) {
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
          if (content.length > 0)
          {
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
    }
    else {
      switch(token) {
        case scanner.right_delimiter:
          switch(scanner.stag) {
            case scanner.left_delimiter:
              if (content[content.length - 1] == '\n')
              {
                content = chop(content);
                buff.push(content);
                buff.cr();
              }
              else {
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
  if (content.length > 0)
  {
    // Chould be content.dump in Ruby
    buff.push(put_cmd + '"' + clean(content) + '")');
  }
  buff.close();
  this.out = buff.script + ";";
  var to_be_evaled = '/*'+name+'*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
  
  try{
    eval(to_be_evaled);
  }catch(e){
    if(typeof JSLINT != 'undefined'){
      JSLINT(this.out);
      for(var i = 0; i < JSLINT.errors.length; i++){
        var error = JSLINT.errors[i];
        if(error.reason != "Unnecessary semicolon."){
          error.line++;
          var e = new Error();
          e.lineNumber = error.line;
          e.message = error.reason;
          if(options.view)
            e.fileName = options.view;
          throw e;
        }
      }
    }else{
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
EJS.config = function(options){
  EJS.cache = options.cache != null ? options.cache : EJS.cache;
  EJS.type = options.type != null ? options.type : EJS.type;
  EJS.ext = options.ext != null ? options.ext : EJS.ext;
  
  var templates_directory = EJS.templates_directory || {}; //nice and private container
  EJS.templates_directory = templates_directory;
  EJS.get = function(path, cache){
    if(cache == false) return null;
    if(templates_directory[path]) return templates_directory[path];
      return null;
  };
  
  EJS.update = function(path, template) { 
    if(path == null) return;
    templates_directory[path] = template ;
  };
  
  EJS.INVALID_PATH =  -1;
};
EJS.config( {cache: true, type: '<', ext: '.ejs' } );



/**
 * @constructor
 * By adding functions to EJS.Helpers.prototype, those functions will be available in the 
 * views.
 * @init Creates a view helper.  This function is called internally.  You should never call it.
 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
 */
EJS.Helpers = function(data, extras){
  this._data = data;
    this._extras = extras;
    extend(this, extras );
};
/* @prototype*/
EJS.Helpers.prototype = {
    /**
     * Renders a new view.  If data is passed in, uses that to render the view.
     * @param {Object} options standard options passed to a new view.
     * @param {optional:Object} data
     * @return {String}
     */
  view: function(options, data, helpers){
        if(!helpers) helpers = this._extras
    if(!data) data = this._data;
    return new EJS(options).render(data, helpers);
  },
    /**
     * For a given value, tries to create a human representation.
     * @param {Object} input the value being converted.
     * @param {Object} null_text what text should be present if input == null or undefined, defaults to ''
     * @return {String} 
     */
  to_text: function(input, null_text) {
      if(input == null || input === undefined) return null_text || '';
      if(input instanceof Date) return input.toDateString();
    if(input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
    return '';
  }
};
EJS.newRequest = function(){
 var factories = [function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
 for(var i = 0; i < factories.length; i++) {
      try {
          var request = factories[i]();
          if (request != null)  return request;
      }
      catch(e) { continue;}
 }
}

EJS.request = function(path){
 var request = new EJS.newRequest()
 request.open("GET", path, false);
 
 try{request.send(null);}
 catch(e){return null;}
 
 if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
 
 return request.responseText
}
EJS.ajax_request = function(params){
params.method = ( params.method ? params.method : 'GET')

var request = new EJS.newRequest();
request.onreadystatechange = function(){
  if(request.readyState == 4){
    if(request.status == 200){
      params.onComplete(request)
    }else
    {
      params.onComplete(request)
    }
  }
}
request.open(params.method, params.url)
request.send(null)
}

module.exports = EJS;

},{}],2:[function(require,module,exports){
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
/*!
 * CibulCalendar v0.2.7 ~ Copyright (c) 2013 Kari Olafsson, http://tech.cibul.net
 * Released under MIT license, http://opensource.org/licenses/mit-license.php
 */

(function( root, factory ) {

  if ( typeof exports == 'object' ) { // CommonJS

    module.exports = factory();

  } else if ( typeof define == 'function' && define.amd ) { // AMD module

    define(factory);

  } else { // Browser global

    var objs = factory();

    root.CibulCalendar = objs.CibulCalendar;

    root.setCibulCalendar = objs.setCibulCalendar;

  }

}( this, function() {

  'use strict';

  var hasTouch = 'ontouchstart' in window && !( /hp-tablet/gi ).test( navigator.appVersion ),

  CibulCalendar = function( element, options ) {

    if ( !options ) options = {};

    if ( !isElement( element ) ) return;

    extend( this, {
      options: extend({
        init: new Date(),   // month to be displayed at init (defaults at current)
        range: true,        // date selection mode
        lang: 'en',
        enabled: true,
        firstDayOfWeek: 1,
        selected: false,
        filter: false,
        template: '<div class="calhead"><ul class="calmonthnav"><li class="calprevmonth"><span>#navprev</span></li><li class="calmonth"><span class="month">#title</span></li><li class="calnextmonth"><span>#navnext</span></li></ul><ul class="calweekdays"><li><span>#wd0</span></li><li><span>#wd1</span></li><li><span>#wd2</span></li><li><span>#wd3</span></li><li><span>#wd4</span></li><li><span>#wd5</span></li><li><span>#wd6</span></li></ul></div><div class="calbody"><ul><li#cls00><span>#d00</span></li><li#cls01><span>#d01</span></li><li#cls02><span>#d02</span></li><li#cls03><span>#d03</span></li><li#cls04><span>#d04</span></li><li#cls05><span>#d05</span></li><li#cls06><span>#d06</span></li></ul><ul><li#cls07><span>#d07</span></li><li#cls08><span>#d08</span></li><li#cls09><span>#d09</span></li><li#cls10><span>#d10</span></li><li#cls11><span>#d11</span></li><li#cls12><span>#d12</span></li><li#cls13><span>#d13</span></li></ul><ul><li#cls14><span>#d14</span></li><li#cls15><span>#d15</span></li><li#cls16><span>#d16</span></li><li#cls17><span>#d17</span></li><li#cls18><span>#d18</span></li><li#cls19><span>#d19</span></li><li#cls20><span>#d20</span></li></ul><ul><li#cls21><span>#d21</span></li><li#cls22><span>#d22</span></li><li#cls23><span>#d23</span></li><li#cls24><span>#d24</span></li><li#cls25><span>#d25</span></li><li#cls26><span>#d26</span></li><li#cls27><span>#d27</span></li></ul><ul><li#cls28><span>#d28</span></li><li#cls29><span>#d29</span></li><li#cls30><span>#d30</span></li><li#cls31><span>#d31</span></li><li#cls32><span>#d32</span></li><li#cls33><span>#d33</span></li><li#cls34><span>#d34</span></li></ul><ul><li#cls35><span>#d35</span></li><li#cls36><span>#d36</span></li><li#cls37><span>#d37</span></li><li#cls38><span>#d38</span></li><li#cls39><span>#d39</span></li><li#cls40><span>#d40</span></li><li#cls41><span>#d41</span></li></ul></div>',
        classes: extend({
          calendar: 'ccal',
          locale: extend({en:'en', fr:'fr', it:'it', es:'es', sv:'sv', no:'no', da:'da', ar:'ar', de: 'de'}),
          navDomPrev: 'calprevmonth',
          navDomNext: 'calnextmonth',
          calendarBody: 'calbody',
          selected: 'selected',
          preSelected: 'preselected',
          today: 'today',
          month: 'month',
          prevMonthDate: 'calprev',
          nextMonthDate: 'calnext',
          disabled: 'disabled',
          originCalendar: 'origincal',
        }, options.classes?options.classes:{}),
        navDomContent: { prev: '<', next: '>'},
        monthNames: extend({
          en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
          it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
          es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          sv: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
          no: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
          da: ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
          ar: ['دجمبر','نونبر','أكتوبر','شتمبر','غشت','يوليو','يونيو','ماي','أبريل','مارس','فبراير','يناير'],
          de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
        }, options.monthNames?options.monthNames:{}),
        weekDays: extend({
          en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
          it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
          es: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
          sv: ['Sön', 'Mån', 'Tid', 'Ons', 'Tor', 'Fre', 'Lör'],
          no: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
          da: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
          ar: ['اﻷحد','السبت','الجمعة','الخميس','اﻷربعاء','الثلاتاء','اﻷتنين'],
          de: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam']
        }, options.weekDays),
        switchMonthOnHoverDelay: 800,
      }, options),
      displayedCalendarElement: false,
      preSelection: false,
      selecting: false,
      element: element,
    });

    this.enabled = this.options.enabled;

    this.setSelected(this.options.selected);

    this._renderCalendar();

  };

  CibulCalendar.prototype = {

    disable: function() {

      this.enabled = false;

      addClass( getElementsByClassName( this.element, this.options.classes.calendar)[0], this.options.classes.disabled );

    },

    enable: function() {

      this.enabled = true;

      removeClass( getElementsByClassName( this.element, this.options.classes.calendar)[0], this.options.classes.disabled );

    },

    showNext: function() {

      if ( !this.enabled ) return;

      this._incDisplayedMonth();

    },

    showPrevious: function() {

      if ( !this.enabled ) return;

      this._decDisplayedMonth();

    },

    setSelected: function( selected, updateMonth ) {

      if ( selected ) {

        if ( typeof selected.begin == 'undefined' ) selected = { begin: selected, end: selected };
        
        if ( typeof updateMonth == 'undefined' ) updateMonth = true;

        this.selection = ( selected.begin > selected.end ) ? { begin: selected.end, end: selected.begin } : selected;

        if ( this.selection && updateMonth ) {

          this.setDisplayedMonth( new Date( this.selection.begin.getTime() ) );

        } else {

          this._renderSelection( this.selection );

        }

      } else {

        this.selection = false;

        this._clearSelectionRender();

      }

    },

    setDisplayedMonth: function( date ) {

      this.displayedMonth = date;

      this._renderCalendar();

    },

    _getSelected: function() {

      if ( typeof this.selection == 'undefined' ) this.selection = false;

      return this.selection;

    },

    _getSelectedElements: function() {

      return getElementsByClassName( getElementsByClassName( this.displayedCalendarElement, this.options.classes.calendarBody )[0], this.options.classes.selected );

    },

    _applyBehavior: function() {

      var self = this;

      // show previous calendar on show previous

      addEvent( getElementsByClassName(this.displayedCalendarElement, this.options.classes.navDomPrev )[0], 'click', function( listItem ) {

        self.showPrevious();

      });

      addEvent( getElementsByClassName(this.displayedCalendarElement, this.options.classes.navDomNext )[0], 'click', function( listItem ) {

        self.showNext();

      });

      // selection behavior on date elements
      forEach( getElementsByClassName(this.displayedCalendarElement, this.options.classes.calendarBody )[0].getElementsByTagName( 'li' ), function( listItem ){

        self._applySelectionBehavior(listItem);

      });

      // selection behavior on month click
      addEvent( getElementsByClassName(this.displayedCalendarElement, this.options.classes.month )[0], 'click', function(){

        self._selectMonth();

      });
      
    },

    _selectMonth: function(){

      if ( !this.enabled || !this.options.range ) return;

      var dMonth = this._getDisplayedMonth();

      this.setSelected( {
        begin: new Date( dMonth.getFullYear(), dMonth.getMonth(), 1 ),
        end: new Date( dMonth.getFullYear(), dMonth.getMonth()+1, 0 )
      } );

      this._renderCalendar();

      if ( typeof this.options.onSelect != 'undefined' ) this.options.onSelect( this.selection );

    },

    _applySelectionBehavior: function( listItem ) {

      var self = this;

      addEvent( listItem, ['touchstart', 'mousedown'], function( event ){

        if ( self.selecting || !self.enabled ) return;

        self.selecting = true;

        self._beginPreselection( listItem );

      });

      addEvent( listItem, ['mouseover', 'touchmove'], function( event ) {

        if ( !self.selecting || !self.enabled ) return; 
          
        self._updatePreselection( self._getActualListItem(listItem, event ) );

      });

      addEvent( listItem, ['mouseup', 'touchend'], function( event ){

        if ( !self.selecting || !self.enabled ) return;

        self.selecting = false;

        self._completePreselection( listItem );

        if ( getElementsByClassName( self.element, self.options.classes.originCalendar ).length ) self.element.removeChild( getElementsByClassName( self.element, self.options.classes.originCalendar )[0] );

      });
    },

    _preventDefaultBodyMove: function(event) {

      if ( event.preventDefault ) event.preventDefault();

    },

    _beginPreselection: function( listItem ) {

      if ( hasTouch ) addEvent( document.getElementsByTagName('body')[0],'touchmove', this._preventDefaultBodyMove );

      this.selection = false;

      this.currentListItem = listItem;

      this.anchorDate = this._getDateFromElement( listItem );

      this.preSelection = { begin: this.anchorDate, end: this.anchorDate };

      this._renderSelection( this.preSelection, true );

    },

    _updatePreselection: function( listItem ) {

      if ( this.currentListItem == listItem ) return;

      this.currentListItem = listItem;

      var date = this._getDateFromElement( listItem );

      if ( this.options.range ) {

        this.preSelection = ( date < this.anchorDate )?{ begin: date, end: this.anchorDate }:{ begin: this.anchorDate, end: date };

      } else {

        this.preSelection = { begin: date, end: date };

      }

      this._switchMonthOnTimer( listItem, date );

      this._renderSelection( this.preSelection, true );

    },

    _completePreselection: function( listItem ) {

      if ( hasTouch ) document.getElementsByTagName( 'body' )[0].removeEventListener( 'touchmove', this._preventDefaultBodyMove, false );

      this.currentListItem = false;

      this.setSelected(this.preSelection, false);

      this._renderSelection(this.selection);

      this.preSelection = false;

      if ( typeof this.options.onSelect != 'undefined' ) this.options.onSelect( this.options.range?this.selection:this.selection.begin );

      this._clearHoverTimer();

    },

    _switchMonthOnTimer: function( listItem, date ) {

      var toggle = false,
      
      self = this,
      
      sameMonth = ( self._getDisplayedMonth().getMonth() == date.getMonth() );

      switch ( getChildIndex( listItem.parentNode ) )
      {
        case 0:

          if ( (getChildIndex(listItem) === 0) || !sameMonth ) toggle = 'prev';
          break;

        case 4:

          if ( !sameMonth ) toggle = 'next';
          break;

        case 5:

          if ( (getChildIndex(listItem) == 6) || !sameMonth ) toggle = 'next';
          break;

      }

      if ( toggle ) {

        if ( typeof this.hoverTimer == 'undefined' ) this.hoverTimer = setTimeout( function(){

          if ( toggle == 'next' ) {

            self.showNext();

          } else if ( toggle == 'prev' ) {

            self.showPrevious();

          }

          self._clearHoverTimer();

        }, this.options.switchMonthOnHoverDelay );

      } else {

        this._clearHoverTimer();

      }

    },

    _clearHoverTimer: function() {

      if ( this.hoverTimer ) clearTimeout( this.hoverTimer );

      this.hoverTimer = undefined;

    },

    _getDateFromElement: function( liElement ) {

      var ulIndex = getChildIndex( liElement.parentNode ),

      incMonth = 0,

      dateValue = parseInt( liElement.getElementsByTagName('span')[0].innerHTML, 10 ),

      displayedMonth = this._getDisplayedMonth();

      if ( (ulIndex===0) && (dateValue>10) ) incMonth = -1;

      if ( (ulIndex>=4) && (dateValue<12) ) incMonth = 1;

      return new Date( displayedMonth.getFullYear(), displayedMonth.getMonth() + incMonth, dateValue );

    },

    _incDisplayedMonth: function() {

      var displayedMonth = this._getDisplayedMonth();

      displayedMonth.setMonth( displayedMonth.getMonth()+1 );

      this.setDisplayedMonth( displayedMonth );

    },

    _decDisplayedMonth: function() {

      var displayedMonth = this._getDisplayedMonth();

      displayedMonth.setMonth( displayedMonth.getMonth()-1 );

      this.setDisplayedMonth( displayedMonth );

    },

    _getDisplayedMonth: function() {

      if ( typeof this.displayedMonth == 'undefined' ) this.displayedMonth = this.options.init;

      return this.displayedMonth;

    },

    _clearSelectionRender: function() {

      var self = this;

      if ( !this.displayedCalendarElement ) return;

      forEach( getElementsByClassName( getElementsByClassName(this.displayedCalendarElement, this.options.classes.calendarBody)[0], this.options.classes.selected ), function( listItem ) {

        removeClass( listItem, self.options.classes.selected );

      });

    },

    _renderSelection: function( selection, preSelection ) {

      if ( !this.displayedCalendarElement ) return;

      var iDate = false, 
      
      i=0, 
      
      classes,
      
      self = this,
      
      currentMonth = self._getDisplayedMonth().getMonth();
        
      preSelection = (typeof preSelection == 'undefined') ? false : preSelection;

      forEach(getElementsByClassName(this.displayedCalendarElement, this.options.classes.calendarBody)[0].getElementsByTagName('li'), function(listItem) {
      
        classes = [];

        if (!iDate) iDate = self._getDateFromElement(listItem);

        else iDate.setDate(iDate.getDate()+1);

        if (self._isWithinRange(iDate, selection)) classes.push(preSelection?self.options.classes.preSelected:self.options.classes.selected);

        if (self._isToday(iDate)) classes.push(self.options.classes.today);

        if (iDate.getMonth() != currentMonth) classes.push(self.options.classes[i++<7?'prevMonthDate':'nextMonthDate']);

        if (self.options.filter) classes = self.options.filter(iDate, classes);

        listItem.className = classes.join(' ');

      });

    },

    _generateCalendarHTML: function( displayedMonth ) {

      var i,
        render = this.options.template,
        regexp, curDate,
        varMonth = 0,
        selected = this._getSelected(),
        monthStack = this._getMonthStack(displayedMonth.getMonth(), displayedMonth.getFullYear());

      //render days

      for (i = 0; i<monthStack.length; i++) {

        regexp = new RegExp('#d' + (i>9?'':'0') + i);

        render = render.replace(regexp, monthStack[i]);

        var mSi = parseInt(monthStack[i], 10);

        // add classes for prev and next month days and selected

        var classes = [];

        regexp = new RegExp('#cls' + (i>9?'':'0') + i);

        varMonth = 0;

        if ((i<7) && (mSi>10)){

          classes.push(this.options.classes.prevMonthDate);
          varMonth = -1;

        } else {

          // 
          if ((i>27) && (mSi<13)) {

            classes.push(this.options.classes.nextMonthDate);
            varMonth = 1;

          }

        }

        curDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + varMonth, mSi);

        if (selected) if (this._isWithinRange(curDate, selected)) classes.push(this.options.classes.selected);

        if (this._isToday(curDate)) {
          classes.push(this.options.classes.today);
        }

        if (this.options.filter) this.options.filter(curDate, classes);

        render = render.replace(regexp, classes.length?' class="' + classes.join(' ') + '"':'');

      }


      // render weekdays
      for (i=0; i<7; i++) {

        regexp = new RegExp('#wd' + i);

        render = render.replace(regexp, this.options.weekDays[this.options.lang][(i + this.options.firstDayOfWeek)%7]);

      }
      
      // render title
      render = render.replace('#title', this.options.monthNames[this.options.lang][displayedMonth.getMonth()] + ' ' + displayedMonth.getFullYear());

      // render nav icons

      render = render.replace('#navprev', this.options.navDomContent.prev).replace('#navnext', this.options.navDomContent.next);

      return render;

    },

    _renderCalendar: function() {

      var displayedMonth = this._getDisplayedMonth();

      if (this.selecting) {
        
        // ensure selection origin calendar is maintained and hidden if it isn't calendar to be shown. Show it if it is.

        if ((displayedMonth.getMonth() == this.anchorDate.getMonth()) &&
           (displayedMonth.getFullYear() == this.anchorDate.getFullYear()) &&
           (getElementsByClassName(this.element, this.options.classes.originCalendar).length)) {

          this.element.removeChild(getElementsByClassName(this.element, this.options.classes.calendar)[0]);

          getElementsByClassName(this.element, this.options.classes.originCalendar)[0].setAttribute('style', 'display:block;');
          getElementsByClassName(this.element, this.options.classes.originCalendar)[0].className = this.options.classes.calendar;

          return;

        } else {

          // set origin calendar if does not exist and render current month calendar
          if (!getElementsByClassName(this.element, this.options.classes.originCalendar).length) {
            getElementsByClassName(this.element, this.options.classes.calendar)[0].setAttribute('style', 'display:none;');
            getElementsByClassName(this.element, this.options.classes.calendar)[0].className = this.options.classes.originCalendar;  
          } else {
            this.element.removeChild(getElementsByClassName(this.element, this.options.classes.calendar)[0]);
          }

        }

      } else {

        if (getElementsByClassName(this.element, this.options.classes.calendar).length)
          this.element.removeChild(getElementsByClassName(this.element, this.options.classes.calendar)[0]);

      }

      var eltToDisplay = document.createElement('div');
      eltToDisplay.className = this.options.classes.calendar + ' ' + this.options.classes.locale[this.options.lang];
      eltToDisplay.innerHTML = this._generateCalendarHTML(displayedMonth);

      this.element.appendChild(eltToDisplay);

      this.displayedCalendarElement = getElementsByClassName(this.element, this.options.classes.calendar)[0];

      makeUnselectable(this.element);

      this._applyBehavior();

    },

    _getMonthStack: function( month, year ) {

      var calStack = [], 
          day = new Date(year, month + 1, 0), //start with the last day of the month
          i;

      // shove in month days
      i = day.getDate();

      while(i--)
        calStack.unshift((i+1).toString());

      // every day of the month is now in the stack,
      // shove in days of previous month

      day = new Date(year, month, 1);

      var offsetDays = (day.getDay()-this.options.firstDayOfWeek)%7;
      offsetDays = offsetDays<0?offsetDays+7:offsetDays;

      while(offsetDays--) {

        day.setDate(day.getDate()-1);

        calStack.unshift(day.getDate().toString());

      }

      // shove in days of next month
      day = new Date(year, month + 1, 0);

      while(calStack.length < 42) {

        day.setDate(day.getDate()+1);

        calStack.push(day.getDate().toString());

      }

      return calStack;

    },

    _isToday: function( date ) {

      if (typeof this.today == 'undefined') this.today = new Date().toDateString();

      return (date.toDateString() == this.today);

    },

    _isWithinRange: function( date, range ) {

      var dateString = date.toDateString();
      var rangeStrings = {begin: range.begin.toDateString(), end: range.end.toDateString() };

      if ((dateString == rangeStrings.begin) || (dateString == rangeStrings.end)) return true;

      if ((date>=range.begin) && (date <= range.end)) return true;

      return false;

    },

    _getActualListItem: function( listItem, event ) {

      if (typeof event == 'undefined') return listItem;
      if (typeof event.touches == 'undefined') return listItem;

      return elementFromDocumentPoint(event.touches[0].pageX, event.touches[0].pageY).parentNode;

    }

  };


  var setCibulCalendar = function( elementId, options ) {

    // on field select, need to create element
    // on click elsewhere need to hide it

    var element = document.getElementById( elementId ),

    calCanvas,

    calendar,

    inFocus = false,

    _init = function() {

      options = extend({
        onSelect: _onSelect,
        separator: ' - ',
        canvasClass: 'calendar-canvas',
        offset: {top: 5, left: 0 }
      }, options?options:{});

      addEvent(element, 'click', _focus);

      addEvent(document.getElementsByTagName('body')[0], 'click', function(){
        if (!inFocus) _blur();
        inFocus = false;
      });

    },

    _focus = function() {

      inFocus = true;

      if (!calCanvas) _createCalendar();

      extend(calCanvas.style, {
        position: 'absolute',
        top: (element.offsetTop + element.offsetHeight + options.offset.top) + 'px',
        left: element.offsetLeft + options.offset.left + 'px'
      });

      calCanvas.style.display = 'block';

      element.blur();

    },

    _blur = function() {

      if (calCanvas) calCanvas.style.display = 'none';

    },

    _createCalendar = function() {

      calCanvas = document.createElement('div');
      calCanvas.className = options.canvasClass;

      if (!element.parentNode.style.position) element.parentNode.style.position = 'relative';

      calCanvas.style.position = 'absolute';

      addEvent(calCanvas, 'click', _focus);

      element.parentNode.appendChild(calCanvas);

      new CibulCalendar(calCanvas, options);

    },

    _onSelect = function( newSelection ) {

      element.value = newSelection.begin?_dateToString(newSelection.begin) + (newSelection.begin!=newSelection.end?options.separator+_dateToString(newSelection.end):''):_dateToString(newSelection);
      fireEvent(element, 'change');

      setTimeout(_blur,200);
    },

    _dateToString = function( date ) {
      return _fZ(date.getDate()) + '/' + _fZ(date.getMonth()+1) + '/' + date.getFullYear();
    },

    _fZ = function( n ) {
      return (n>9?'':'0') + n;
    };

    _init();

  },

  extend = function(){

    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];

  },

  getElementsByClassName = function( node, classname ) {

    var a = [];
    var re = new RegExp('(^| )'+classname+'( |$)');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;

  },

  isElement = function( o ){

    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
    );

  },

  forEach = function( array, action ) {

    for (var i = 0; i < array.length; i++)
      action(array[i]);

  },

  addEvent = function( elem, types, eventHandle ) {

    if (elem === null || elem === undefined) return;
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

  fireEvent = function( elem, types ) {

    if (elem === null || elem === undefined) return;
    if (typeof types == 'string') types = [types];
    forEach(types, function(type){
      if ("fireEvent" in elem) {
        elem.fireEvent(type);
      } else {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, false, true);
        elem.dispatchEvent(evt);
      }
    });

  },

  makeUnselectable = function( node ) {

    if (node.nodeType == 1) node.setAttribute("unselectable", "on");
    
    var child = node.firstChild;
    while (child) {
        makeUnselectable(child);
        child = child.nextSibling;
    }

  },

  previousObject = function( elem ) {
    
    elem = elem.previousSibling;

    while (elem && elem.nodeType != 1)
      elem = elem.previousSibling;

    return elem;

  },

  getChildIndex = function( child ) {

    var i = 0;

    while( (child = previousObject(child)) !== null ) i++;

    return i;

  },

  hasClass = function(element, cls) { return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1; },

  addClass = function(element, className) { if (!hasClass(element, className)) element.className = element.className + ' ' + className; },

  removeClass = function(element, cls) { if (hasClass(element, cls)) { var regex = new RegExp(cls, 'g'); element.className = element.className.replace(regex,''); } },

  elementFromPointIsUsingViewPortCoordinates = function() {
    if (window.pageYOffset > 0) {     // page scrolled down
      return (window.document.elementFromPoint(0, window.pageYOffset + window.innerHeight -1) === null);
    } else if (window.pageXOffset > 0) {   // page scrolled to the right
      return (window.document.elementFromPoint(window.pageXOffset + window.innerWidth -1, 0) === null);
    }
    return false; // no scrolling, don't care
  },

  elementFromDocumentPoint = function(x,y) {

    if (elementFromPointIsUsingViewPortCoordinates()){
      return window.document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
    } else {
      return window.document.elementFromPoint(x,y);
    }
    
  };

  return {
    CibulCalendar: CibulCalendar,
    setCibulCalendar: setCibulCalendar
  };

}));

},{}],5:[function(require,module,exports){

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

},{"./debug":6}],6:[function(require,module,exports){

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

},{"ms":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

cLib = require( '../../js/vendors/CibulCalendar/src/CibulCalendar' ),

debug = require( 'debug' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

config = {
  langAttribute : 'data-lang'
},

templates = {
  main : require( './main.ejs' )
},

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

onReady;


if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  controller,

  enabled = false,

  lang = 'en',

  calendar,

  activeDates = [],

  existingDates = [],

  selection = false,

  firstEnable = true;

  // init settings, register widget, fetch control data, create calendar

  ( function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'calendar widget ' + uid );

    if ( options.anchorConfig.length > 1 ) {

      lang = options.anchorConfig[ LANG ];

      log( 'setting widget lang to %s', lang );

    }

    if ( elem.hasAttribute( config.langAttribute )) {

      lang = elem.getAttribute( config.langAttribute );

      log( 'overwriting lang to %s', lang );

    }

    controller = options.register( wLib.interface( 'calendar', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    controller.getControlData( function( data ) {

      if ( data.ebd && data.ebd.dcss ) styler( style );

      existingDates = _getAllDates( data );

      _createCalendar();

      if ( onReady ) onReady();

    });

  } )();


  function enable( reqParams ) {

    if ( firstEnable ) {

      _setCalendarPosition();

    }

    firstEnable = false;

    selection = false;

    enabled = true;

    if ( reqParams.from ) {

      log( 'setting from at %s', reqParams.from );

      selection = new Date( reqParams.from );

    }

    if ( reqParams.to ) {

      log( 'setting to at %s', reqParams.to );

      selection = {
        begin : selection,
        end : new Date( reqParams.to )
      };

    }

    _refresh();

  }


  function clear() {

    activeDates = [];

    if ( calendar ) calendar.setSelected( false );

  }


  function include( eventItem ) {

    for ( var i in eventItem.l ) {

      for ( var j = eventItem.l[ i ].d.length - 1; j >= 0; j-- ) {

        if ( !cn.contains( activeDates, eventItem.l[i].d[j]) ) {

          activeDates.push( eventItem.l[i].d[j] );

        }

      }

    }

  }


  function disable() {

    log( 'disabling calendar' );

    enabled = false;

    _refresh();

  }


  function _onSelect( newSelection ) {

    // filter out unique date selection only
    
    var newRange = {
      from: _dStringify( newSelection.begin ),
      to: _dStringify( newSelection.end )
    },

    isRelevent = false;

    for ( var i = 0; i < existingDates.length; i++ ) {

      if ( ( existingDates[ i ] <= newRange.to )

      && ( existingDates[ i ] >= newRange.from ) ) {

        isRelevent = true;

        break;

      }

    }

    if ( !isRelevent ) {

      calendar.setSelected( selection );

    } else {

      _update( newRange );

    }

  }


  function _update( range ) {

    log( 'updating request parameters' );

    controller.update( 'calendar', range );

  }


  /**
   * create calendar
   */

  function _createCalendar() {

    elem.innerHTML = new EJS( { text: templates.main } ).render( {} );

    calendar = new cLib.CibulCalendar( cn.el( elem, 'div' ), {
      filter: function( date, classes ) {

        return _filterCalendar( date, classes );
        
      },
      onSelect: _onSelect,
      navDomContent: { prev: '<', next: '>'},
      lang: lang
    } );

  }


  function _setCalendarPosition() {

    var now = new Date(),

    closestDates = [ false, false ],

    refDate;

    now = now.getFullYear() + '-' + _fZ( now.getMonth() + 1 ) + '-' + _fZ( now.getDate() ),

    cn.forEach( activeDates, function( d ) {

      if ( d >= now ) {

        if ( !closestDates[ 1 ] || ( d < closestDates[ 1 ] ) ) {

          closestDates[ 1 ] = d;

        }

      } else {

        if ( !closestDates[ 0 ] || ( d > closestDates[ 0 ] ) ) {

          closestDates[ 0 ] = d;

        }

      }

    } );

    refDate = closestDates[ 1 ] ? closestDates[ 1 ] : closestDates[ 0 ];

    if ( !refDate ) return;

    if ( refDate.substr( 0, 7 ) == now.substr( 0, 7 ) ) {

      return;

    }

    // reference date is different from current month.

    calendar.setDisplayedMonth( new Date( refDate ) );


  }


  function _filterCalendar( date, classes ) {

    var formattedDate = [ 

      date.getFullYear(),

      ( date.getMonth() < 9 ? '0' : '' ) + ( date.getMonth() + 1 ),

      ( date.getDate() < 10 ? '0' : '' ) + date.getDate()

    ].join( '-' );

    if ( cn.contains( activeDates, formattedDate ) ) {

      classes.push( 'hasdates' );

    }

    return classes;

  }


  function _refresh() {

    if ( !calendar ) return;

    calendar.setSelected( selection, false );

    // TWEAK - to force refresh on selection - this should be corrected at the calendar level
    
    if ( !selection ) {

      calendar.showNext();
      calendar.showPrevious();

    }

    if ( enabled ) {

      calendar.enable();

    } else {

      calendar.disable();

    }

  };

}

function _getAllDates( data ) {

  var dates = {}, datesArr = [];

  for ( var i in data.ev ) {

    cn.forEach( data.ev[ i ].d, function( d ) {

      dates[ d ] = 1;

    } );

  }

  for ( var d in dates ) {

    datesArr.push( d );

  }

  console.log( datesArr );

  return datesArr;

}

function _dStringify( d ) {

  return [ d.getFullYear(), _fZ( d.getMonth() + 1), _fZ( d.getDate() ) ].join( '-' );

}

function _fZ( n ) {

  return (n>9?'':'0') + n;

};

function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgcl', { register: register }, widget );

} );

},{"../../js/lib/clientEjs/ejs":1,"../../js/lib/common/common.mod.js":2,"../../js/vendors/CibulCalendar/src/CibulCalendar":4,"../lib/controllerLoader":11,"../lib/widgetLib":12,"../lib/widgetStyler":13,"./main.ejs":9,"./style.css":10,"debug":5}],9:[function(require,module,exports){
module.exports = "<div class=\"calendar-canvas\"></div>";

},{}],10:[function(require,module,exports){
module.exports = ".ccal { width: 18em; font-size: 0.8em; text-align: center; display: inline-block; }\n.ccal div { display: block;}\n.ccal ul { margin: 0; padding: 0; text-align: left; }\n.ccal li { list-style-type: none; display: inline-block; width: 13.2%; cursor: pointer; text-align: center; border: 1px solid transparent; }\n.ccal li span { display: inline-block; line-height: 1.8em; }\n.ccal li.calmonth { width: 69%; cursor: pointer; }\n.ccal li span { padding: 0.1em 0.05em; display: block; }\n.ccal li.calprev span, .ccal li.calnext span { background: #eee; color: #aaa; }\n.ccal li.calprev, .ccal li.calnext { border: 1px solid #eee; }\n.ccal .calbody li { cursor: pointer; }\n.ccal .calbody li span { color: #999; }\n.ccal .calbody li.today { border: 1px solid #eee; }\n.ccal .calbody li.selected span { background: #666; color: white; }\n.ccal .calbody li.preselected span { background: {{ preselectedColor }}; }\n.ccal * { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; }\n.ccal .calbody li.hasdates span { color: {{ defaultColor }}; }";

},{}],11:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":2,"../../js/lib/loadJs/loadJs.mod.js":3}],12:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":2,"debug":5}],13:[function(require,module,exports){
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

},{"../../js/lib/common/common.mod.js":2}]},{},[8]);
