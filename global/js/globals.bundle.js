(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var debug = require( 'debug' ),

log = debug( 'globals' );

window.handleGlobals = require('../../layout/js/main');

},{"../../layout/js/main":21,"debug":25}],2:[function(require,module,exports){
var lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

debug = require('debug'),

log = debug('action'),

defaults = {
  onResponse: false,  // type, data
  onElemReady: false,  // form
  loadLightbox: false,
  errorLightbox: false
},

params = {
  lightboxClasses: {
    frame: 'wsq lightbox-frame',
    canvas: 'lightbox-canvas', 
    buttonBox: 'lightbox-buttons', 
    body: 'noscroll' 
  },
  debug: false
};

exports.init = function(options) {

  cn.extend(params, typeof options == 'undefined'?{}:options);

};

exports.get = function get(res, options) {

  log('processing get on %s', res);

  if (typeof options == 'undefined') options = {};

  var reqParams = options.data?options.data:{};

  options = cn.extend({}, defaults, options);

  request(res, reqParams, function(responseType, data) {

    log('get response received: %s', responseType);

    if (responseType!=='success') {

      if (options.onResponse) options.onResponse(responseType);

      return;

    }

    if ((data.success===false) && data.message && options.errorLightbox) lightbox({
      message: data.message,
      classes: params.lightboxClasses
    });

    if (data.partial && options.loadLightbox) {

      lightbox({
        html: data.partial,
        buttons: false,
        classes: params.lightboxClasses,
        onOpen: options.onElemReady
      });

    }

    if (data.partial && !options.loadLightbox) {

      log('TODO: partial is loaded not to be used for lightbox');

    }

    if (data.redirect) get(data.redirect, options);

    if (options.onResponse) options.onResponse(responseType, data);

  });

};

var request =  function(res, reqParams, callback) {

  if (params.debug) reqParams.format = 'jsonp';

  remote.get(res, {data: reqParams, timeout: 10000, retries: 1}, callback, !params.debug);

};

},{"../../js/lib/common/common.mod.js":6,"../../js/lib/lightbox/lightbox.mod.js":8,"../../js/lib/remote/remote.mod.js":9,"debug":25}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/* EventHandler v0.2 */
(function( root ){

  var EventHandler = function(){
    this.register = {};
    this.nextId = 1;
  };

  EventHandler.prototype = {

    // register new function to call on event, returns an track id of the function
    on: function(eventName, func){

      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

      this.register[eventName].push({func: func, funcId: this.nextId});

      return this.nextId++;

    },

    trigger: function(eventName, params){

      if (typeof this.register[eventName] == 'undefined') this.register[eventName] = [];

      var i = this.register[eventName].length;

      while (i--)
        this.register[eventName][i].func(params);

    },

    cancel: function(funcId){

      var i;

      for (var eventName in this.register) {

        i = this.register[eventName].length;

        while (i--)
          if (funcId==this.register[eventName][i].funcId) {

            this.register[eventName].splice(i,1);

            return true;

          }

      
      }

      return false;

    },

    clear: function() {

      this.register = {};

    },

    hasEvent: function(name) {

      return typeof this.register[name] != 'undefined';

    }

  };

  root.EventHandler = EventHandler;

  root.sEventHandler = (function() {

    var instance;

    return {
      getInstance: function() {

        if (!instance)
          instance = new EventHandler();

        return instance;
      }
    };

  })();

})( typeof exports !== 'undefined' ? exports : window );

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

  if ( !HTMLElement.prototype.insertAdjacentHTML) HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML);
  };

  if ( !HTMLElement.prototype.insertAdjacentText ) HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
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

},{}],7:[function(require,module,exports){
"use strict";

var qs = require( 'qs' ),

utils = require( 'utils' );

module.exports = {
  el: el,
  els: els,
  addEvent: addEvent,     // add an event to an element 
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
}

function isElement( o ) {

  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );

}

function preventDefault( event ) {

  event.preventDefault ? event.preventDefault() : event.returnValue = false;

};

function childObject(elem, index) {

  var i = 0, realI = 0;

  while (elem.childNodes[i]) {

    if (elem.childNodes[i].nodeType == 1) {

      if (realI==index) return elem.childNodes[i];

      realI++;
    }

    i++;

  }

  return false;

}


function hasClass( element, cls ) {

  return ( ' ' + element.className + ' ').indexOf(' ' + cls + ' ' ) > -1; 

}

function addClass( element, className ) {

  if (!hasClass(element, className)) element.className = element.className + ' ' + className; 

}

function removeClass( element, cls ) {

  if ( hasClass( element, cls ) ) {

    var regex = new RegExp(cls, 'g');

    element.className = element.className.replace(regex,'');

  } 

}


function els( node, selector ) {

  if ( typeof node == 'string' ) {

    selector = node;
    node = document;

  }

  var prefix = selector.substr( 0, 1 );

  if ( '.#,'.indexOf( prefix ) !== -1 ) {

    selector = selector.substr( 1 );

  }

  if ( prefix == '.' ) {

    return getElementsByClassName( node, selector );

  } else if ( prefix == '#') {

    var result = node.getElementById( selector );
    
    if ( result ) {

      return [ result ];

    } else {

      return [];

    }

  } else {

    return node.getElementsByTagName( selector );

  }

};

function el( node, selector ) {

  var results = els( node, selector );

  return results.length ? results[ 0 ] : null;

}


function whenReady( cb ) {

  if ( document.readyState === 'complete' ) {

    cb();

  } else {

    addEvent( window, 'load', cb );

  }

}

function asapReady( selector, timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = selector;

    timeout = 0;

    selector = 'body'

  } else if ( arguments.length == 2 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( el( selector ) ) return cb();

  setTimeout( function() {

    asapReady( selector, Math.min( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

}


function loadInLocation( values ) {

  var href = window.location.href.split( '?' )[ 0 ];

  if ( utils.size( values ) ) {

    href += '?' + qs.stringify( values );

  }

  return href;

}


/**
 * cross browser add event
 */

function addEvent( elem, types, eventHandle ) {

  if ( elem == null || elem == undefined ) return;
  
  if ( typeof types == 'string' ) types = [ types ];
  
  forEach( types, function( type ) {

    if ( elem.addEventListener ) {

      elem.addEventListener( type, eventHandle, false );

    } else if ( elem.attachEvent ) {

        elem.attachEvent( 'on' + type, eventHandle );

    } else {

        elem[ 'on' + type ]=eventHandle;

    }

  } );

}

function forEach( array, action ) {

  for ( var i = 0; i < array.length; i++ ) {

    action( array[ i ] );

  }

}

function getElementsByClassName( node, className ) {

  if ( typeof node == 'string' ) {

    className = node;
    node = document;

  }

  var a = [],

  re = new RegExp( '(^| )' + className + '( |$)' ),

  els = node.getElementsByTagName( '*' );

  for( var i=0, j=els.length; i<j; i++ ) {

    if ( re.test( els[i].className ) ) {

      a.push( els[i] );

    }

  }

  return a;

}


function nl2br( str, is_xhtml ) {

  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');

}

},{"qs":30,"utils":36}],8:[function(require,module,exports){
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

  var defaultButtons = { ok: { label: 'Ok' } },

  exposed = {
    hide: function() {
      _hide( options.classes )
    },
    reposition: _repositionFrame
  };

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

  if ( options.onOpen ) options.onOpen( frameElem, exposed );

  onClose = options.onClose ? options.onClose : false;

  beforeClose = options.beforeClose ? options.beforeClose : false;

  onHide = options.onHide ? options.onHide : false;

  return exposed;

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

  cn.addEvent( frameElem, 'click', function() { frontClickFlag = true; });

  cn.extend( frameElem.style, {
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

    if ( buttons[ i ] ) {

      var button = document.createElement( 'button' );

      button.innerHTML = buttons[i].label;

      (function( button, buttonConfig ) {

        cn.addEvent( button, 'click', function(){

          if ( buttonConfig.onClick ) buttonConfig.onClick();

          if ( typeof buttonConfig.hide !== 'undefined' ) if ( !buttonConfig.hide ) return;

          _hide( classes );

        });

      })(button, buttons[i]);

      if ( buttons[i].className ) cn.addClass( button, buttons[i].className );

      if ( classes.button ) cn.addClass( button, classes.button );

      div.appendChild( button );

    }

  }

  frameElem.appendChild( div );

};

},{"../common/common.mod.js":6}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*!
 * Cookies.js - 0.3.1
 * Wednesday, April 24 2013 @ 2:28 AM EST
 *
 * Copyright (c) 2013, Scott Hamper
 * Licensed under the MIT license,
 * http://www.opensource.org/licenses/MIT
 */
(function (undefined) {
    'use strict';

    var Cookies = function (key, value, options) {
        return arguments.length === 1 ?
            Cookies.get(key) : Cookies.set(key, value, options);
    };

    // Allows for setter injection in unit tests
    Cookies._document = document;
    Cookies._navigator = navigator;

    Cookies.defaults = {
        path: '/'
    };

    Cookies.get = function (key) {
        if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache();
        }

        return Cookies._cache[key];
    };

    Cookies.set = function (key, value, options) {
        options = Cookies._getExtendedOptions(options);
        options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

        Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

        return Cookies;
    };

    Cookies.expire = function (key, options) {
        return Cookies.set(key, undefined, options);
    };

    Cookies._getExtendedOptions = function (options) {
        return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
        };
    };

    Cookies._isValidDate = function (date) {
        return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
    };

    Cookies._getExpiresDate = function (expires, now) {
        now = now || new Date();
        switch (typeof expires) {
            case 'number': expires = new Date(now.getTime() + expires * 1000); break;
            case 'string': expires = new Date(expires); break;
        }

        if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance');
        }

        return expires;
    };

    Cookies._generateCookieString = function (key, value, options) {
        key = encodeURIComponent(key);
        value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
        options = options || {};

        var cookieString = key + '=' + value;
        cookieString += options.path ? ';path=' + options.path : '';
        cookieString += options.domain ? ';domain=' + options.domain : '';
        cookieString += options.expires ? ';expires=' + options.expires.toGMTString() : '';
        cookieString += options.secure ? ';secure' : '';

        return cookieString;
    };

    Cookies._getCookieObjectFromString = function (documentCookie) {
        var cookieObject = {};
        var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

        for (var i = 0; i < cookiesArray.length; i++) {
            var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

            if (cookieObject[cookieKvp.key] === undefined) {
                cookieObject[cookieKvp.key] = cookieKvp.value;
            }
        }

        return cookieObject;
    };

    Cookies._getKeyValuePairFromCookieString = function (cookieString) {
        // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
        var separatorIndex = cookieString.indexOf('=');

        // IE omits the "=" when the cookie value is an empty string
        separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

        return {
            key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
            value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
        };
    };

    Cookies._renewCache = function () {
        Cookies._cache = Cookies._getCookieObjectFromString(Cookies._document.cookie);
        Cookies._cachedDocumentCookie = Cookies._document.cookie;
    };

    Cookies._areEnabled = function () {
        return Cookies._navigator.cookieEnabled ||
            Cookies.set('cookies.js', 1).get('cookies.js') === '1';
    };

    Cookies.enabled = Cookies._areEnabled();

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return Cookies; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Cookies;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = Cookies;
    } else {
        window.Cookies = Cookies;
    }
})();

},{}],11:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

cTemplater = require( './clientTemplater' ),

tpl = 'user/transferMessage';

module.exports = function() {

  if ( !_show() ) return;

  cTemplater( tpl, {}, function( err, template ) {

    _print( template.render( {} ) );

  } );

}

function _show() {

  var query = window.location.href.split('?');

  return query.indexOf( 'cibul=' ) !==-1;

}

function _print( render ) {

  var d = document.createElement( 'div' );

  d.innerHTML = render;

  d.className = 'popup-overlay share-menu';

  cn.el( 'body' ).insertAdjacentElement( 'beforeend', d );

  cn.addEvent( d, 'click', function( e ) {

    cn.preventDefault( e );

    cn.el( 'body' ).removeChild( d );

  });

}

},{"../../js/lib/common/common.mod.js":6,"./clientTemplater":12}],12:[function(require,module,exports){
var cn = require( '../../js/lib/common/common.mod.js' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

store = require( 'store' ),

useCache = true,

routePrefix = '/templates/',

storePrefix = 'templates:',

i18n = require( './i18n' ),

async = require( 'async' );


/**
 * load template from remote and render data
 */

module.exports = function( templateName, options, cb  ) {

  var params = {
    urls: {},          // urls to be used by genUrl
    lang: 'fr',        // language to use
    lastUpdate: false  // what is the last udpate time for templates
  },

  helpers = {},

  template,

  labels,

  init = function() {

    if ( !cb ) {

      cb = options;

      options = {};

    }

    if ( window.env == 'tpl' ) {

      routePrefix = '/';

      useCache = false;

    }

    cn.extend( params, options );

    _loadTemplate( templateName, params, function( err, t, l ) {

      if ( err ) return cb( err );

      template = t;

      labels = l;

      helpers = {
        __ : i18n( labels ),
        genUrl : _loadGenUrl( params.urls )
      };

      cb( null, {
        render: render
      } );

    });

  },

  render = function( data ) {

    return new EJS({ text: template }).render( cn.extend( data, helpers ) );

  };


  init();

};



/**
 * load template from remote or local store
 */

function _loadTemplate( name, options, cb ) {

  if ( options.lastUpdate ) _checkAndClearTemplates( options.lastUpdate );

  async.parallel([
    async.apply( _loadEjs, name ),
    async.apply( _loadLabels, name, options.lang )
  ], function( err, results ) {

    if ( err ) return cb( err );

    cb( null, results[0], results[1] );

  });

}


/**
 * load labels from remote or local store
 */

function _loadLabels( name, lang, cb ) {

  var labels = {};

  if ( lang == 'en' ) return cb( null, labels );

  if ( store.enabled && useCache ) {

    labels = store.get( storePrefix + name + '.' + lang + '.json');

    if ( labels ) return cb( null, labels );

  }

  _fetchAndStore( name + '.' + lang + '.json', true, cb );

}


/**
 * load ejs template
 */

function _loadEjs( name, cb ) {

  if ( store.enabled && useCache ) {

    labels = store.get( storePrefix + name + '.ejs');

    if ( labels ) return cb( null, labels );

  }

  _fetchAndStore( name + '.ejs', cb );

}


/**
 * fetch file from remote and store content in local storage
 */

function _fetchAndStore( filename, parse, cb ) {

  if ( !cb ) {

    cb = parse;

    parse = false;

  }

  remote.getXmlHttp( routePrefix + filename, { raw: true }, function( responseType, content ) {

    if ( responseType !== 'success' ) return cb( responseType );

    if ( parse ) content = JSON.parse( content );

    if ( store.enabled && useCache ) {

      store.set( storePrefix + filename, content );

    }

    cb( null, content );

  });

  

}


/**
 * load url generator
 */

function _loadGenUrl( urls ) {

  return function( uri, values ) {

    if ( !urls[ uri ] ) return '#';

    return urls[ uri ];

  };

}



/**
 * check against lastUpdate value in store
 * clear all templates if outdated
 */

function _checkAndClearTemplates( lastUpdate ) {

  if ( !store.enabled ) return;

  if ( store.get('lastTemplateUpdate') >= lastUpdate ) return;

  store.forEach(function( key, value ) {

    if ( key.indexOf( storePrefix ) !== -1 ) store.clear( key );

  });

  store.set('lastTemplateUpdate', lastUpdate );

};

},{"../../js/lib/clientEjs/ejs":5,"../../js/lib/common/common.mod.js":6,"../../js/lib/remote/remote.mod.js":9,"./i18n":19,"async":24,"store":35}],13:[function(require,module,exports){
var cn = require( '../../js/lib/common/common.mod.js' ),

debug = require('debug'),

log = debug('handleMessageLinks'),

lightbox = require( '../../js/lib/lightbox/lightbox.mod' ),

params = {
  lang: "fr",
  selectors: {
    link: '.js_message_confirm'
  },
  attributes: {
    message: 'data-confirm',
    ok: 'data-ok',
    cancel: 'data-cancel'
  },
  classes: {
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas', 
      buttonBox: 'lightbox-buttons', 
      body: 'noscroll'
    }
  }
};

module.exports = function() {

  cn.forEach( cn.els( params.selectors.link ), function( linkElem ) {

    cn.addEvent( linkElem, 'click', function( e ) {

      cn.preventDefault( e );

      lightbox({
        message: linkElem.getAttribute( params.attributes.message ),
        classes: params.classes.lightbox,
        button: false,
        buttons: {
          ok: {
            label: linkElem.getAttribute( params.attributes.ok ),
            onClick: function() {
              
              window.location.href = linkElem.getAttribute( 'href' );

            }
          },
          cancel: {
            label: linkElem.getAttribute( params.attributes.cancel )
          }
        }
      });

    });

  } );

}

},{"../../js/lib/common/common.mod.js":6,"../../js/lib/lightbox/lightbox.mod":8,"debug":25}],14:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

b64 = require('../../js/lib/Base64/Base64.mod.js'),

cookies = require('../../js/vendors/Cookies-master/src/cookies.js'),

lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

cookieValues,

params = {
  keys: {
    cookie: 'cibul',
    value: 'flash', 
    type: 'flash_type'
  },
  classes: {
    canvas: 'lightbox-canvas',
    frame: 'wsq lightbox-frame',
    buttonBox: 'lightbox-buttons',
    body: 'noscroll'
  }
};

module.exports = function() {

  var c = read();

  if (!c.value || !c.value.length) return;

  lightbox({
    message: c.value,
    classes: params.classes
  });

  clear();

};

var read = function() {

  var rawCookie = cookies(params.keys.cookie);

  if (!rawCookie) return {value: false, type: false};

  cookieValues = JSON.parse(b64.decode( rawCookie ));

  return {
    value: cookieValues[params.keys.value],
    type: cookieValues[params.keys.type]
  };

},

clear = function() {

  if ( !cookieValues ) return;

  cookieValues[params.keys.value] = false;
  cookieValues[params.keys.type] = false;

  cookies.set(params.keys.cookie, b64.encode(JSON.stringify(cookieValues)));

};

},{"../../js/lib/Base64/Base64.mod.js":3,"../../js/lib/common/common.mod.js":6,"../../js/lib/lightbox/lightbox.mod.js":8,"../../js/vendors/Cookies-master/src/cookies.js":10}],15:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

action = require('../../home/js/action.js'),

debug = require('debug'),

log = debug('handleMessageLinks'),

params = {
  selectors: {
    links: '.js_message_link'
  },
  events: ['contentload', 'lhSuccess', 'success', 'loadSuccess'],
  attribute: 'data-enabled'
};

module.exports = function(eh, options) {

  // assuming the document is loaded
  
  if (typeof options !== 'undefined') cn.extend(params, options);

  cn.forEach( params.events, function( eventName ) {

    eh.on( eventName, scan );
    
  });

  scan();

};

var scan = function() {

  cn.forEach(cn.els(params.selectors.links), function(linkElem) {

    if (linkElem.hasAttribute(params.attribute)) return;

    cn.addEvent(linkElem, 'click', function(e) {

      cn.preventDefault(e);

      action.get(linkElem.getAttribute('href'), {loadLightbox: true, errorLightbox: true});

      linkElem.setAttribute(params.attribute, true);  

    });

  });

};

},{"../../home/js/action.js":2,"../../js/lib/common/common.mod.js":6,"debug":25}],16:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

params = {
  events: {
    init: 'mobileinit',
    check: 'mobilecheck'
  },
  threshold: 600
},

w, d, n;

module.exports = function(doc, win, nav, eh, options) {

  d = doc; w = win; n = nav;

  if (typeof options !== 'undefined') cn.extend(params, options);

  var isMobile = (doCheck() || (getWidth() < params.threshold));

  eh.trigger(params.events.init, isMobile);

  eh.on(params.events.check, function(callback) {

    callback(isMobile);

  });

};

// from http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser
var doCheck = function() {
  
  var check = false;

  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(n.userAgent||n.vendor||w.opera);

  return check;

},

getWidth = function() {

  return d.width?d.width:w.innerWidth;

};

},{"../../js/lib/common/common.mod.js":6}],17:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

Cookies = require( '../../js/vendors/Cookies-master/src/cookies.js' ),

Base64 = require( '../../js/lib/Base64/Base64.mod.js' ),

debug = require( 'debug' ), log,

store = require( 'store' ),

defaults = {
  url: {
    prod: '/session',
    dev: '/frontend_dev.php/session',
    test: '/frontend_test.php/session',
    tpl: {
      logged: '/server/testdata/opensession.json',
      unlogged: '/server/testdata/closedsession.json'
    }
  },
  env: false,
  cookie: 'cibul',
  cookieFlag: 'refresh',
  cookieLogged: 'logged',
  local: 'cibul',
  onLoaded: false,
  events: { fetch: 'getsessiondata', clear: false },
  lifetime: 60*60*1000
};

module.exports = window.handleSession = function( options ) {

  var params = cn.extend( {}, defaults, options ), url,

  stack = [], windowStack = [],

  isReady = false,

  sessionData;

  if ( window.env ) params.env = window.env;

  if ( cn.contains( [ 'dev', 'tpl' ], params.env ) ) debug.enable( '*' );

  log = debug( 'handleSession' );

  url = _defineUrl();

  if ( _flaggedCookie() || !_hasSessionData() || _contradictingCookie()) {

    _fetch( url, function( data ) {

      log( 'fetched session data, setting in local storage' );

      _setSessionData( data );

      isReady = true;

      _processStack();
      
    });

  } else {

    log( 'local storage is valid and can be used' );

    isReady = true;

  }

  return function( cb ) {

    if ( !isReady ) {

      return stack.push( cb );

    }

    cb( _getSessionData() );

  }

  function _defineUrl() {

    var env = window.env ? window.env : 'prod',

    url = params.url[ env ];

    if ( typeof url !== 'string' ) {

      url = url[ window.location.href.indexOf( 'logged=' ) == -1 ? 'unlogged' : 'logged' ];

    }

    return url;

  }

  function _processStack() {

    var data = _getSessionData();

    cn.forEach( stack, function( cb ) {

      cb( data );

    });

    stack = undefined;

  }

  function _hasSessionData() {

    var data = _getSessionData( true ),

    now = new Date().getTime();

    if ( window.env == 'tpl' ) {

      return false;

    }

    if ( !data ) {

      log( 'has no session data' );

      return false;

    }

    if ( !data.timestamp ) {

      log( 'timestamp is not set' );

      return false;

    }

    if ( data.timestamp + params.lifetime < now ) {

      log( 'localStorage is too old' );

      return false;

    }

    log( 'has valid local storage - expires in %s', ( ( params.lifetime - ( now - data.timestamp ) ) / 1000 ) + 's'  );

    return true;

  }

  function _getSessionData( force ) {

    if ( !sessionData || force ) {

      log( 'parsing session data from local storage' );

      try {

        sessionData = JSON.parse( store.get( params.local ) );
        
      } catch( e ) {

        return false;

      }


    }

    return sessionData;

  }


  function _setSessionData( data ) {

    var result;

    log( 'setting session data in local storage' );

    sessionData = null;

    data.timestamp = new Date().getTime();

    result = store.set( params.local, JSON.stringify( data ) );

    return result;

  }

  
  function _getCookieValue( name, defaultValue ) {

    if (typeof defaultValue == 'undefined') defaultValue = false;

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse( Base64.decode(Cookies.get(params.cookie)) );

    return (typeof values[name] == 'undefined')?defaultValue:values[name];
  }

  
  function _setCookieValue( name, value ) {

    if (!Cookies.get(params.cookie)) throw 'no cookie';

    var values = JSON.parse(Base64.decode(Cookies.get(params.cookie)));

    values[name] = value;

    Cookies.set(params.cookie, Base64.encode(JSON.stringify(values)));

  }

  
  function _flaggedCookie() {

    var flagged;

    try {

      flagged = _getCookieValue(params.cookieFlag);

    } catch (e) {

      log( 'could not read cookie' );

      return false;

    }

    log( 'cookie is %s', flagged ? 'flagged' : 'not flagged' );

    _setCookieValue(params.cookieFlag, false);

    return flagged;

  }


  function _contradictingCookie() {

    var cookieValue;

    try {

      cookieValue = _getCookieValue( 'logged' );

    } catch (e) {

      log( 'could not retrieved logged cookie value' );

      return false;

    }

    var logged = _getSessionData().logged;

    if (logged !== cookieValue) {

      log( 'logged cookie value is different from local storage' );

      return true;

    }

    log( 'logged cookie matches local storage state' );

    return false;

  }

}


function _fetch( url, cb ) {

  log( 'fetching %s', url );

  remote.get( url, { timeout: 10000 }, function( responseType, data ){

    if ( responseType == 'success' ) cb( data );

  }, true );

}

},{"../../js/lib/Base64/Base64.mod.js":3,"../../js/lib/common/common.mod.js":6,"../../js/lib/remote/remote.mod.js":9,"../../js/vendors/Cookies-master/src/cookies.js":10,"debug":25,"store":35}],18:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

cTemplater = require( './clientTemplater' ),

b64 = require( '../../js/lib/Base64/Base64.mod.js' ),

toggle = require( './toggle' ),

utils = require( 'utils' ),

du = require( '../../js/lib/domUtils' ),

params = {
  selectors: {
    languageMenu: '.js_language_menu',
    headerLinks: '.js_header_links',
    signinLink: '.js_signin_link',
    profile: '.js_profile',
    dropdown: '.js_profile_dropdown'
  },
  classes: {
    displayNone: 'display-none'
  },
  template: 'user/menu'
},

pClicked = false;

module.exports = function( options ) {

  params = utils.extend( params, options );

  var languageMenu = du.el( params.selectors.languageMenu ),

  signinLink = du.el( params.selectors.signinLink );

  // tmp hack to avoid execution on legacy project
  if ( !languageMenu ) return;

  // tmp hack to know which user template to load
  if ( window.templates == 'bs' ) params.template = 'user/bsMenu';

  window.getSession( function( session ) {

    if ( !session.logged ) {

      _addSigninLinkRedirect( du.el( params.selectors.signinLink ) );

      return;

    }

    languageMenu.parentNode.removeChild( languageMenu );

    signinLink.parentNode.removeChild( signinLink );

    cTemplater( params.template, {
      urls: {
        settingsIndex: '/settings',
        homeEvents: '/home/events',
        homeAgendas: '/home',
        signout: '/signout',
        agendaNew: '/new',
        searchAgendas: '/agendas/search'
      },
      fullName: session.fullName,
      thumbnail: session.thumbnail,
      lang: session.culture,
      lastUpdate: window.env=='dev' ? new Date() : session.lastTemplateUpdate
    }, function( err, template ) {

      if ( err ) {
        
        return;
        
      }

      var rendered = template.render( session ),

      ul = document.createElement( 'ul' ),

      li;

      ul.innerHTML = rendered;

      li = du.el( ul, 'li' );

      du.el( params.selectors.headerLinks ).insertAdjacentElement( 'beforeend', li );

      toggle( li );

    });


  });

};

function _addSigninLinkRedirect( elem ) {

  elem.setAttribute( 'href', elem.getAttribute( 'href' ) + '?redirect=' + b64.encode( window.location.href ) );

}

function _behave( li ) {

  du.addEvent( du.el( li, params.selectors.profile ), 'click', function( e ) {

    pClicked = true;

    setTimeout(function() {

      pClicked = false;

    }, false);

  });

  du.addEvent( du.el( 'body' ), 'click', function( e ) {

    if ( pClicked ) {

      _show( li );

    } else {

      _hide( li );

    }

  });

}

function _show( li ) {

  du.removeClass( du.el( li, params.selectors.dropdown ), params.classes.displayNone );

}

function _hide( li ) {

  du.addClass( du.el( li, params.selectors.dropdown ), params.classes.displayNone );

}

},{"../../js/lib/Base64/Base64.mod.js":3,"../../js/lib/common/common.mod.js":6,"../../js/lib/domUtils":7,"./clientTemplater":12,"./toggle":23,"utils":36}],19:[function(require,module,exports){
"use strict";

module.exports = function( labelSet ) {

  return function( label, values ) {

    if ( !values ) values = {};

    var translation = label;

    if ( labelSet && labelSet[ label ] ) {

      translation = labelSet[ label ];

    }

    for (var key in values) {

      translation = translation.replace( key, values[key] );

    }

    return translation;

  };

}

},{}],20:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' );

module.exports = {
  getOptions: getOptions
}

function getOptions( selector ) {

  var options = {}, 

  stringified = cn.el( selector ).getAttribute( 'data-options' );

  if ( !stringified ) return options;

  try {

    options = JSON.parse( stringified );

  } catch( e ) {

    log( 'could not parse options' );

  }

  return options;

}

},{"../../js/lib/common/common.mod.js":6}],21:[function(require,module,exports){
"use strict";

var utils = require( 'utils' ),

du = require( '../../js/lib/domUtils' ),

mobileMonitor = require('./handleMobileMonitor.js'),

mobileMenu = require( './mobileMenu' ),

messageLinks = require('./handleMessageLinks.js'),

confirmMessage = require( './confirmMessage' ),

cibulMessage = require( './cibulMessage' ),

handleSession = require( './handleSession' ),

headerProfile = require( './headerProfile' ),

outdated = require( 'outdated-browser-rework' ),

toggle = require( './toggle' ),

debug = require('debug'),

layout = require( './layout' ),

log = debug('globals'),

flash = require('./handleFlashMessage.js'),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance(),

ran = false, asapRan = false,

hooks = [], asaps = [],

params = {};

outdated( {
  browserSupport: {
    'Chrome': 33,
    'IE': 9,
    'Safari': 5,
    'Mobile Safari': 5,
    'Firefox':  24
  }
});

/**
 * provide function to retrieve session data
 */

window.getSession = handleSession();


du.asapReady( function() {

  utils.extend( params, layout.getOptions( 'body' ) );

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( params.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  mobileMenu();

  messageLinks( eh );

  confirmMessage();

  toggle();

  flash();

  cibulMessage();

  headerProfile( params.profile );

  du.forEach( asaps, function( asapHook ) {

    asapHook( params );

  });

  asapRan = true;

} );


du.addEvent( window, 'load', function() {

  du.forEach( hooks, function( hook ) {

    hook( params );

  });

  ran = true;

} );


/**
 * provide hook for page specific script launchers
 * which are to be called when page is ready
 */

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};


/**
 * same as hook, but ready as soon as options are
 * available
 */

window.asap = function( cb ) {

  if ( asapRan ) return cb( params );

  asaps.push( cb )

}

},{"../../js/lib/EventHandler/EventHandler.js":4,"../../js/lib/domUtils":7,"./cibulMessage":11,"./confirmMessage":13,"./handleFlashMessage.js":14,"./handleMessageLinks.js":15,"./handleMobileMonitor.js":16,"./handleSession":17,"./headerProfile":18,"./layout":20,"./mobileMenu":22,"./toggle":23,"debug":25,"outdated-browser-rework":28,"utils":36}],22:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

params = {
  selectors: {
    link: '.js_menu_button',
    items: '.js_menu_item'
  },
  classes: {
    active: 'active'
  }
}

/**
 * handle the sidebar menu in mobile mode
 */

module.exports = function() {

  var visible = false,

  linkElem = cn.el( params.selectors.link );

  cn.addEvent( linkElem, 'click', function() {

    cn.forEach( cn.els( params.selectors.items ), function( item ) {

      item.setAttribute( 'style', visible ? 'display: none;' : 'display: block;' );

    } );

    visible = !visible;

    ( visible ? cn.addClass : cn.removeClass )( linkElem, params.classes.active );

  } )

}

},{"../../js/lib/common/common.mod.js":6}],23:[function(require,module,exports){
"use strict";

/**
 * handling of bootstrap collapsed menus
 *
 * run once per page
 */

var cn = require('../../js/lib/common/common.mod.js'),

defaults = {
  selectors: {
    toggler: '.js_toggle',
    toggleTrigger: '.js_toggle_trigger' // optional
  },
  classes: {
    display: 'in'
  },
  attributes: {
    toggle: 'data-toggle'
  }
};

module.exports = function( elem, options ) {

  var els = [], params;

  if ( cn.isElement( elem ) ) {

    els = [ elem ];

  } else {

    options = elem;

  }
  
  params = cn.extend( {}, defaults, options ? options : {} );

  els = els.concat( cn.els( params.selectors.toggler ) );

  cn.forEach( els, function( togglerElem ) {

    _handleToggler( togglerElem, params );

  });

}

function _handleToggler( elem, params ) {

  var attr = elem.getAttribute( params.attributes.toggle ),

  displaying = false,

  targets,

  trigger;

  if ( !attr ) return;

  elem.removeAttribute( params.attributes.toggle );

  targets = cn.els( elem, '.' + attr );

  trigger = cn.el( elem, params.selectors.toggleTrigger );

  if ( !trigger ) trigger = elem; 

  cn.addEvent( trigger, 'click', function( e ) {

    displaying = !displaying;

    cn.forEach( targets, function( targetElem ) {

      ( displaying ? _show : _hide )( targetElem, params );

    });

  });

  _controlHide( [ elem ].concat( targets ), params, function() {

    displaying = false;

  } );

}

function _controlHide( targets, params, onHide ) {

  var clicked = false;


  cn.forEach( targets, function( targetElem ) {

    cn.addEvent( targetElem, 'click', function() {

      clicked = true;

      setTimeout( function() {

        clicked = false;

      }, 10 );

    });

  } );

  cn.addEvent( cn.el( 'body'), 'click', function( e ) {

    if ( !clicked ) {

      cn.forEach( targets, function( targetElem ) {

        _hide( targetElem, params );

      } );

      onHide();

    }

  } );

}

function _show( elem, params ) {

  cn.addClass( elem, params.classes.display );

}

function _hide( elem, params ) {

  cn.removeClass( elem, params.classes.display );

}

},{"../../js/lib/common/common.mod.js":6}],24:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };
    
    async.priorityQueue = function (worker, concurrency) {
        
        function _compareTasks(a, b){
          return a.priority - b.priority;
        };
        
        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }
        
        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };
              
              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }
        
        // Start with a normal queue
        var q = async.queue(worker, concurrency);
        
        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };
        
        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))
},{"_process":37}],25:[function(require,module,exports){

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

},{"./debug":26}],26:[function(require,module,exports){

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

},{"ms":27}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
var UserAgentParser = require('user-agent-parser');
var languageMessages = {
	"br":{
		"outOfDate":"O seu navegador est&aacute; desatualizado!",
		"update":{
			"web":"Atualize o seu navegador para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/br",
		"callToAction":"Atualize o seu navegador agora",
		"close":"Fechar"
	},
	"cn":{
		"outOfDate":"您的浏览器已过时",
		"update":{
			"web":"要正常浏览本网站请升级您的浏览器。",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/cn",
		"callToAction":"现在升级",
		"close":"关闭"
	},
	"cz":{
		"outOfDate":"Váš prohlížeč je zastaralý!",
		"update":{
			"web":"Pro správné zobrazení těchto stránek aktualizujte svůj prohlížeč. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/cz",
		"callToAction":"Aktualizovat nyní svůj prohlížeč",
		"close":"Zavřít"
	},
	"de":{
		"outOfDate":"Ihr Browser ist veraltet!",
		"update":{
			"web":"Bitte aktualisieren Sie Ihren Browser, um diese Website korrekt darzustelcount. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/de",
		"callToAction":"Den Browser jetzt aktualisieren ",
		"close":"Schließen"
	},
	"ee":{
		"outOfDate":"Sinu veebilehitseja on vananenud!",
		"update":{
			"web":"Palun uuenda oma veebilehitsejat, et näha lehekülge korrektselt. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/ee",
		"callToAction":"Uuenda oma veebilehitsejat kohe",
		"close":"Sulge"
	},
	"en":{
		"outOfDate":"Your browser is out-of-date!",
		"update":{
			"web":"Update your browser to view this website correctly. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"Update my browser now",
		"close":"Close"
	},
	"es":{
		"outOfDate":"¡Tu navegador está anticuado!",
		"update":{
			"web":"Actualiza tu navegador para ver esta página correctamente. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/es",
		"callToAction":"Actualizar mi navegador ahora",
		"close":"Cerrar"
	},
	"fa":{
		"rightToLeft":true,
		"outOfDate":"مرورگر شما منسوخ شده است!",
		"update":{
			"web":"جهت مشاهده صحیح این وبسایت، مرورگرتان را بروز رسانی نمایید. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"همین حالا مرورگرم را بروز کن",
		"close":"Close"
	},
	"fi":{
		"outOfDate":"Selaimesi on vanhentunut!",
		"update":{
			"web":"Lataa ajantasainen selain n&auml;hd&auml;ksesi t&auml;m&auml;n sivun oikein. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"P&auml;ivit&auml; selaimeni nyt ",
		"close":"Sulje"
	},
	"fr":{
		"outOfDate":"Votre navigateur est désuet!",
		"update":{
			"web":"Mettez à jour votre navigateur pour afficher correctement ce site Web. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/fr",
		"callToAction":"Mettre à jour maintenant ",
		"close":"Fermer"
	},
	"hu":{
		"outOfDate":"A böngészője elavult!",
		"update":{
			"web":"Firssítse vagy cserélje le a böngészőjét. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/hu",
		"callToAction":"A böngészőm frissítése ",
		"close":"Close"
	},
	"id":{
		"outOfDate":"Browser yang Anda gunakan sudah ketinggalan zaman!",
		"update":{
			"web":"Perbaharuilah browser Anda agar bisa menjelajahi website ini dengan nyaman. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"Perbaharui browser sekarang ",
		"close":"Close"
	},
	"it":{
		"outOfDate":"Il tuo browser non &egrave; aggiornato!",
		"update":{
			"web":"Aggiornalo per vedere questo sito correttamente. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/it",
		"callToAction":"Aggiorna ora",
		"close":"Chiudi"
	},
	"lt":{
		"outOfDate":"Jūsų naršyklės versija yra pasenusi!",
		"update":{
			"web":"Atnaujinkite savo naršyklę, kad galėtumėte peržiūrėti šią svetainę tinkamai. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"Atnaujinti naršyklę ",
		"close":"Close"
	},
	"nl":{
		"outOfDate":"Je gebruikt een oude browser!",
		"update":{
			"web":"Update je browser om deze website correct te bekijken. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/nl",
		"callToAction":"Update mijn browser nu ",
		"close":"Sluiten"
	},
	"pl":{
		"outOfDate":"Twoja przeglądarka jest przestarzała!",
		"update":{
			"web":"Zaktualizuj swoją przeglądarkę, aby poprawnie wyświetlić tę stronę. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/pl",
		"callToAction":"Zaktualizuj przeglądarkę już teraz",
		"close":"Close"
	},
	"pt":{
		"outOfDate":"O seu browser est&aacute; desatualizado!",
		"update":{
			"web":"Atualize o seu browser para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/pt",
		"callToAction":"Atualize o seu browser agora",
		"close":"Fechar"
	},
	"ro":{
		"outOfDate":"Browserul este învechit!",
		"update":{
			"web":"Actualizați browserul pentru a vizualiza corect acest site. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/",
		"callToAction":"Actualizați browserul acum!",
		"close":"Close"
	},
	"ru":{
		"outOfDate":"Ваш браузер устарел!",
		"update":{
			"web":"Обновите ваш браузер для правильного отображения этого сайта. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/ru",
		"callToAction":"Обновить мой браузер ",
		"close":"Close"
	},
	"si":{
		"outOfDate":"Vaš brskalnik je zastarel!",
		"update":{
			"web":"Za pravicount prikaz spletne strani posodobite vaš brskalnik. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/si",
		"callToAction":"Posodobi brskalnik ",
		"close":"Zapri"
	},
	"ua":{
		"outOfDate":"Ваш браузер застарів!",
		"update":{
			"web":"Оновіть ваш браузер для правильного відображення цього сайта. ",
			"googlePlay":"Please install Chrome from Google Play",
			"appStore":"Please update iOS from the Settings App"
		},
		"url":"http://outdatedbrowser.com/ua",
		"callToAction":"Оновити мій браузер ",
		"close":"Close"
	}
};

module.exports = function(options) {

	var main = function(){

		// Despite the docs, UA needs to be provided to constructor explicitly:
		// https://github.com/faisalman/ua-parser-js/issues/90
		var parsedUserAgent = new UserAgentParser(window.navigator.userAgent).getResult();

		// Variable definition (before ajax)
		var outdatedUI = document.getElementById("outdated");

		options = options || {};

		var browserLocale = window.navigator.language || window.navigator.userLanguage ; // Everyone else, IE

		// Set default options
		var browserSupport = options.browserSupport || {
				'Chrome': 37,
				'IE': 10,
				'Safari': 7,
				'Mobile Safari': 7,
				'Firefox':  32
			},
			requiredCssProperty = options.requiredCssProperty || false, // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
			backgroundColor = options.backgroundColor || '#f25648', // Salmon
			textColor = options.textColor || 'white',
			language = options.language || browserLocale.slice(0, 2); // Language code

		var updateSource = 'web'; // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.

		// Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
		var isAndroid = parsedUserAgent.os.name === "Android";
		if ( isAndroid ) {
			updateSource = 'googlePlay';
		}

		var isAndroidButNotChrome;
		if ( options.requireChromeOnAndroid ) {
			isAndroidButNotChrome = ( isAndroid ) && ( parsedUserAgent.browser.name !== "Chrome");
		}

		if ( parsedUserAgent.os.name === 'iOS' ) {
			updateSource = 'appStore';
		}

		// TODO: done what????
		var done = true;

		var changeOpacity = function(opacityValue) {
			outdatedUI.style.opacity = opacityValue / 100;
			outdatedUI.style.filter = 'alpha(opacity=' + opacityValue + ')';
		};

		var fadeIn = function(opacityValue) {
			changeOpacity(opacityValue);
			if (opacityValue == 1) {
				outdatedUI.style.display = 'block';
			}
			if (opacityValue == 100) {
				done = true;
			}
		};

		var isBrowserOutOfDate = function(){
			var browserName = parsedUserAgent.browser.name;
			var browserMajorVersion = parsedUserAgent.browser.major;
			var isOutOfDate = false;
			if ( browserSupport[browserName] ) {
				if ( browserMajorVersion < browserSupport[browserName] ) {
					isOutOfDate = true;
				}
			}
			return isOutOfDate;
		};

		// Returns true if a browser supports a css3 property
		var isPropertySupported = function(prop) {
			if ( ! prop ) {
				return true;
			}
			var div = document.createElement('div'),
				vendorPrefixes = 'Khtml Ms O Moz Webkit'.split(' '),
				count = vendorPrefixes.length;

			if ( div.style[prop] ) return true;

			prop = prop.replace(/^[a-z]/, function(val) {
				return val.toUpperCase();
			});

			while (count--) {
				if ( div.style[vendorPrefixes[count]+prop] ) {
					return true;
				}
			}
			return false;
		};

		var makeFadeInFunction = function(x) {
			return function () {
				fadeIn(x);
			};
		};

		// Style element explicitly - TODO: investigate and delete if not needed
		var startStylesAndEvents = function(){
			var buttonClose = document.getElementById("buttonCloseUpdateBrowser");
			var buttonUpdate = document.getElementById("buttonUpdateBrowser");

			//check settings attributes
			outdatedUI.style.backgroundColor = backgroundColor;
			//way too hard to put !important on IE6
			outdatedUI.style.color = textColor;
			outdatedUI.children[0].style.color = textColor;
			outdatedUI.children[1].style.color = textColor;

			// Update button is desktop only
			if ( buttonUpdate ) {
				buttonUpdate.style.color = textColor;
				if (buttonUpdate.style.borderColor) {
					buttonUpdate.style.borderColor = textColor;
				}

				// Override the update button color to match the background color
				buttonUpdate.onmouseover = function() {
					this.style.color = backgroundColor;
					this.style.backgroundColor = textColor;
				};

				buttonUpdate.onmouseout = function() {
					this.style.color = textColor;
					this.style.backgroundColor = backgroundColor;
				};
			}

			buttonClose.style.color = textColor;

			buttonClose.onmousedown = function() {
				outdatedUI.style.display = 'none';
				return false;
			};
		};

		var getmessage = function(language){
			var messages = languageMessages[language];

			var updateMessages = {
				'web': '<p>'+messages.update.web+'<a id="buttonUpdateBrowser" href="'+messages.url+'">'+messages.callToAction+'</a></p>',
				'googlePlay': '<p>'+messages.update.googlePlay+'<a id="buttonUpdateBrowser" href="https://play.google.com/store/apps/details?id=com.android.chrome">'+messages.callToAction+'</a></p>',
				'appStore':'<p>'+messages.update[updateSource]+'</p>'
			};

			var updateMessage = updateMessages[updateSource];

			// TODO: button used for nothing
			return '<h6>'+messages.outOfDate+'</h6>'+updateMessage+'<p class="last"><a href="#" id="buttonCloseUpdateBrowser" title="'+messages.close+'">×</a></p>';
		};

		// Check if browser is supported
		if ( isBrowserOutOfDate() || ! isPropertySupported(requiredCssProperty) || isAndroidButNotChrome ) {

			// This is an outdated browser
			if (done && outdatedUI.style.opacity !== '1') {
				done = false;

				for (var i = 1; i <= 100; i++) {
					setTimeout(makeFadeInFunction(i), i * 8);
				}
			}

			var insertContentHere = document.getElementById("outdated");
			insertContentHere.innerHTML = getmessage(language);
			startStylesAndEvents();
		}
	};

	// Load main when DOM ready.
	var oldOnload = window.onload;
	if (typeof window.onload !== 'function') {
		window.onload = main;
	} else {
		window.onload = function() {
			if (oldOnload) {
				oldOnload();
			}
			main();
		};
	}
};









},{"user-agent-parser":29}],29:[function(require,module,exports){
// UAParser.js v0.6.0
// Lightweight JavaScript-based User-Agent string parser
// https://github.com/faisalman/ua-parser-js
//
// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
// Dual licensed under GPLv2 & MIT

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet';


    ///////////
    // Helper
    //////////


    var util = {
        has : function (str1, str2) {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
        },
        lowerize : function (str) {
            return str.toLowerCase();
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function () {

            // loop through all regexes maps
            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof(result) === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        q = props[p];
                        if (typeof(q) === OBJ_TYPE) {
                            result[q[0]] = undefined;
                        } else {
                            result[q] = undefined;
                        }
                    }
                }

                // try matching uastring with regexes
                for (j = k = 0; j < regex.length; j++) {
                    matches = regex[j].exec(this.getUA());
                    if (!!matches) {
                        for (p in props) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof(q[1]) == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                        break;
                    }
                }

                if(!!matches) break; // break the loop immediately if match found
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
                    for (var j in map[i]) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                major : {
                    '1' : ['/8', '/1', '/3'],
                    '2' : '/4',
                    '?' : '/'
                },
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        device : {
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    'RT'        : 'ARM'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

            ], [NAME, VERSION, MAJOR], [

            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
            ], [[NAME, 'Opera'], VERSION, MAJOR], [

            // Mixed
            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt)\/((\d+)?[\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt
            ], [NAME, VERSION, MAJOR], [

            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION, MAJOR], [

            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
            ], [VERSION, MAJOR, NAME], [

            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
            ], [NAME, VERSION, MAJOR], [

            // Gecko based
            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
                                                                                // Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

            // Other
            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?((\d+)?[\w\.]+)/i,
                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf
            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
            ], [NAME, VERSION, MAJOR]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM, IRIX, MIPS, SPARC, PA-RISC
            ], [ARCHITECTURE, util.lowerize]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /\((ip[honed]+);.+(apple)/i                                         // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\((bb10);\s(\w+)/i                                                 // BlackBerry 10
            ], [[VENDOR, 'BlackBerry'], MODEL, [TYPE, MOBILE]], [

            /android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i       // Asus Tablets
            ], [[VENDOR, 'Asus'], MODEL, [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])/i                                           // Sony Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /((playstation)\s[3portablevi]+)/i                                  // Playstation
            ], [[VENDOR, 'Sony'], MODEL, [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
            /(zte)-(\w+)*/i,                                                    // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /\s((milestone|droid[2x]?))[globa\s]*\sbuild\//i,                   // Motorola
            /(mot)[\s-]?(\w+)*/i
            ], [[VENDOR, 'Motorola'], MODEL, [TYPE, MOBILE]], [
            /android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i
            ], [[VENDOR, 'Motorola'], MODEL, [TYPE, TABLET]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
            /(sie)-(\w+)*/i                                                     // Siemens
            ], [[VENDOR, 'Siemens'], MODEL, [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android\s3\.[\s\w-;]{10}((a\d{3}))/i                               // Acer
            ], [[VENDOR, 'Acer'], MODEL, [TYPE, TABLET]], [

            /android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i                     // LG
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /((nexus\s4))/i,
            /(lg)[e;\s-\/]+(\w+)*/i
            ], [[VENDOR, 'LG'], MODEL, [TYPE, MOBILE]], [

            /(mobile|tablet);.+rv\:.+gecko\//i                                  // Unidentifiable
            ], [TYPE, VENDOR, MODEL]
        ],

        engine : [[

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)\/([\w\.]+)/i,                                              // Tizen
            /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION],[
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids3portablevu]+)/i,                    // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i             // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i                                    // Mac OS
            ], [NAME, [VERSION, /_/g, '.']], [

            // Other
            /(haiku)\s(\w+)/i,                                                  // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]
    };

    var UAParser = function UAParser (uastring) {
        if (!(this instanceof UAParser)) return new UAParser(uastring).getResult();

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring).getResult();
        }
        this.getBrowser = function () {
            return mapper.rgx.apply(this, regexes.browser);
        };
        this.getCPU = function () {
            return mapper.rgx.apply(this, regexes.cpu);
        };
        this.getDevice = function () {
            return mapper.rgx.apply(this, regexes.device);
        };
        this.getEngine = function () {
            return mapper.rgx.apply(this, regexes.engine);
        };
        this.getOS = function () {
            return mapper.rgx.apply(this, regexes.os);
        };
        this.getResult = function() {
            return {
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        this.setUA(ua);
    };

    module.exports = UAParser;
})(this);

},{}],30:[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":31}],31:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":32,"./stringify":33}],32:[function(require,module,exports){
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

},{"./utils":34}],33:[function(require,module,exports){
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

},{"./utils":34}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
;(function(win){
	var store = {},
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.17'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}
	store.forEach = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = function(storage) {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled

	if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { win.store = store }

})(Function('return this')());

},{}],36:[function(require,module,exports){
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
  escape: escape
};

function escape( str, escapeApostrophe ) {

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
},{}],37:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
