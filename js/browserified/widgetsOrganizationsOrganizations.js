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
    controllersPath : '//cibul.net/js/embed/cibulControllers.js'
  },
  dev : {
    controllersPath : '//d.cibul.net/js/embed/cibulControllers.js'
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
},{"../../js/lib/common/common.mod.js":2,"../../js/lib/loadJs/loadJs.mod.js":3}],8:[function(require,module,exports){
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
},{"../../js/lib/common/common.mod.js":2,"debug":4}],9:[function(require,module,exports){
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

    cn. addEvent( w, 'load', function() {

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
},{"../../js/lib/common/common.mod.js":2}],10:[function(require,module,exports){
var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'organizations dom' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

templates = {
  main: require( './main.ejs' ),
  item : require( './item.ejs' )
};

module.exports = function( anchorElem ) {

  var _onSelect = false, _onUnselect = false,

  init = function() {

    return {
      render: render,
      setOnSelect: setOnSelect,
      setOnUnselect: setOnUnselect,
      setDefaultStyle: setDefaultStyle
    }
    
  },

  render = function( data ) {

    anchorElem.innerHTML = new EJS( { text: templates.main } ).render( data );

    cn.forEach( data.organizations, function( org ) {

      var catWrapper = document.createElement( 'ul' ),

      catElem;

      catWrapper.innerHTML = new EJS( { text: templates.item } ).render( org );

      catElem = cn.el( catWrapper, 'li' );

      cn.addEvent( catElem, 'click', function( e ) {

        log( 'click' );

        cn.preventDefault( e );

        if ( !data.enabled ) {

          log( 'click ignored: widget is not enabled' );

          return;

        }

        if ( !org.active ) {

          log( 'organization not active. running anyways' );

        }

        if ( org.selected ) {

          _unselect( org );

        } else {

          _select( org );

        }

      });

      cn.el( anchorElem, 'ul' ).appendChild( catElem );

    } );

  },

  setOnSelect = function( cb ) {

    _onSelect = cb;

  },

  setOnUnselect = function( cb ) {

    _onUnselect = cb;

  },

  setDefaultStyle = function() {

    styler( style );

  },

  _select = function( organization ) {

    log( 'organization %s is selected', organization.label );

    if ( _onSelect ) _onSelect( organization );

  },

  _unselect = function( organization ) {

    log( 'organization %s is unselected', organization.label );

    if ( _onUnselect ) _onUnselect( organization );

  };

  return init();

}
},{"../../js/lib/clientEjs/ejs":1,"../../js/lib/common/common.mod.js":2,"../lib/widgetStyler":9,"./item.ejs":11,"./main.ejs":12,"./style.css":14,"debug":4}],11:[function(require,module,exports){
module.exports = "<li class=\"<% if (typeof className !== 'undefined' ) { %><%= className %><% } %><% if ( selected ) { %> selected<% } %><% if ( active ) { %> active<% } %>\"><a><%= label %></a></li>";

},{}],12:[function(require,module,exports){
module.exports = "<ul class=\"organizers\"></ul>";

},{}],13:[function(require,module,exports){
"use strict";

exports.setOnReady = setOnReady;

var UID = 0,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( window.env == 'tpl' ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  field = 'org',

  controller,

  enabled = false,

  selectedOrg = false,

  selectedLabel = false,

  organizations = [],

  orgsInTime,

  selectedContributor = null,

  activeOrgs = [],  // categories which are within current event selection
  
  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'organizations widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'organzations', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    view.setOnSelect( _onSelect );

    view.setOnUnselect( _onUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched agenda control data' );

      _setOrganizations( data );

      if ( !data.ebd || data.ebd.dcss ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    });

  },

  enable = function( reqParams ) {

    enabled = true;

    log( 'enabling organizations widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedOrg = null;

    selectedLabel = null;

    if ( reqParams.org ) {

      selectedOrg = reqParams.org;

      cn.forEach( organizations, function( organization ) {

        if ( organization.s == selectedOrg ) {

          selectedLabel = organization.l;

        }

      });

    }

    _render();

  },

  clear = function() {

    log( 'clearing, awaiting enable or disable to render' );

    activeOrgs = [];

    selectedContributor = null;

  },

  include = function( eventItem ) {

    if ( eventItem.org && !cn.contains( activeOrgs, eventItem.org ) ) {

      activeOrgs.push( eventItem.org.s );

    }

  },

  disable = function() {

    enabled = false;

    _render();

  },

  _onSelect = function( organization ) {

    log( 'selected %s with slug %s', organization.label, organization.slug );

    if ( !cn.contains( activeOrgs, organization.slug ) ) {

      log( 'organization is not active. Running it anyways' );

    }

    selectedOrg = organization.slug;

    selectedLabel = organization.label;

    _update();

  },

  _onUnselect = function( organization ) {

    log( 'unselect %s with slug %s', organization.label, organization.slug );

    if ( selectedOrg !== organization.slug ) {

      log( 'unselect organization "%s" is not as expected "%s"', organization.slug, selectedOrg );

      return;

    }

    selectedOrg = null;

    selectedLabel = null;

    _update();

  },


  _update = function() {

    var updatedParams = { org : selectedOrg, orgLabel : selectedLabel };

    if ( orgsInTime[ selectedOrg ] ) {

      updatedParams.passed = '1';

    }

    log( 'updating request params with org at "%s"', selectedOrg );

    controller.update( 'organizations', updatedParams );

  },


  _setOrganizations = function( data ) {

    var today = new Date();

    orgsInTime = {}; // org indexed by slug, with bool passed

    today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() ),


    log( 'defining widget organizations' );

    for( var a in data.a ) {

      if ( typeof data.a[ a ].org !== 'undefined' ) {

        if ( typeof orgsInTime[ data.a[ a ].org.s ] == 'undefined' ) {

          orgsInTime[ data.a[ a ].org.s ] = true;

        }

      }

      for( var l in data.a[ a ].l ) {

        for( var d in data.a[ a ].l[ l ].d ) {

          if ( data.a[ a ].l[ l ].d[ d ] >= today ) {

            orgsInTime[ data.a[ a ].org.s ] = false;

            break;
            break;

          }
          
        }

      }

    }

    
    organizations = data.org ? data.org : [];

    cn.forEach( organizations, function( org ) {

      if ( typeof orgsInTime[ org.s ] == 'undefined' ) {

        orgsInTime[ org.s ] = true;

      }

    });

    log( 'widget initialized with %d organizations', organizations.length );

  },

  _render = function() {

    log( 'rendering as %s', enabled ? 'enabled' : 'disabled' );

    var data = {
      enabled : enabled,
      organizations : []
    };

    cn.forEach( organizations, function( organization ) {

      data.organizations.push( {
        label : organization.l,
        slug : organization.s,
        active : enabled && cn.contains( activeOrgs, organization.s ),
        selected : selectedOrg == organization.s,
        className : undefined
      } );

    });

    view.render( data );

  };

  init();

}

function setOnReady( cb ) {

  onReady = cb;

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgor', { register: register }, widget );

} );
},{"../../js/lib/common/common.mod.js":2,"../lib/controllerLoader":7,"../lib/widgetLib":8,"./dom.js":10,"debug":4}],14:[function(require,module,exports){
module.exports = ".cibulOrganizations ul {\n  margin: 0;\n  padding: 0;\n}\n\n.cibulOrganizations li {\n  display: inline-block;\n  cursor: pointer;\n  padding-right: 1em;\n  color: {{ disabledColor }};\n}\n\n.cibulOrganizations li.active {\n  color: {{ activeColor }};\n}\n\n.cibulOrganizations li.selected { \n  color: {{ selectedColor }}; \n}\n\n.cibulOrganizations.disabled li {\n  cursor: wait; \n  color: {{ disabledColor }}; \n}";

},{}]},{},[13]);
