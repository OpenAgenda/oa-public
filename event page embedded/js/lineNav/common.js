/* Object.size */
if (typeof Object.size == 'undefined') Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/* extend */
function extend(){
  for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
          if(arguments[i].hasOwnProperty(key))
              arguments[0][key] = arguments[i][key];
  return arguments[0];
};

/*contains*/
function contains(a, obj) {
  var i = a.length;
  while (i--) {
     if (a[i] === obj) {
         return true;
     }
  }
  return false;
};

/*hasClass addClass removeClass*/
var hasClass = function(element, cls) { return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1; };
var addClass = function(element, className) { if (!hasClass(element, className)) element.className = element.className + ' ' + className; };
var removeClass = function(element, cls) { if (hasClass(element, cls)) { var regex = new RegExp(cls, 'g'); element.className = element.className.replace(regex,''); } };

/*addEvent v0.1 */
var addEvent = function(elem, types, eventHandle) {
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

/* removeEvent v0.1 */
var removeEvent = function(elem,types,eventHandle) {
  if (elem == null || elem == undefined) return;
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

/* preventDefault */
var preventDefault = function(event) {
  event.preventDefault ? event.preventDefault() : event.returnValue = false;
};

/* getElementsByClassName */
function getElementsByClassName(node, classname) {
  var a = [];
  var re = new RegExp('(^| )'+classname+'( |$)');
  var els = node.getElementsByTagName("*");
  for(var i=0,j=els.length; i<j; i++)
      if(re.test(els[i].className))a.push(els[i]);
  return a;
};

/* makeUnselectable v0.1 */
function makeUnselectable(node) {
  if (node.nodeType == 1) {
      node.setAttribute("unselectable", "on");
  }
  var child = node.firstChild;
  while (child) {
      makeUnselectable(child);
      child = child.nextSibling;
  }
};

/*String.getUrlParameters v0.1*/
if (typeof String.prototype.getUrlParameters == 'undefined') String.prototype.getUrlParameters = function(){
  var map = {};
  var parts = this.replace(/[?#&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {
    map[key] = value;
  });
  return map; 
};


/*String.addUrlParameters v0.3*/
if (typeof String.prototype.addUrlParameters == 'undefined') String.prototype.addUrlParameters = function(parameters) {

  var newParameters = extend(this.getUrlParameters(), parameters);

  var newString = '';

  for (index in newParameters) {
    newString = newString.addUrlParameter(index, newParameters[index]);
  }

  if (this.indexOf('?') != -1) return this.substr(0,this.indexOf('?')) + '?' + newString.substr(1);
  
  return this + '?' + newString.substr(1);

};

/*String.addUrlParameter v0.2*/
if (typeof String.prototype.addUrlParameter == 'undefined') String.prototype.addUrlParameter = function(name, value){

  if (typeof value == 'undefined') value = '';
  
  var string = name + '=' + encodeURIComponent(value);

  var result = this;

  if (result.indexOf('?') != -1) result = result + '&' + string;
  else result = result + '?' + string;

  return result;
};


/* Base64 v0.1*/
var Base64 = {
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
};

/* loadJs v0.1 */
//var loadJs=function(a,b){if(typeof a=='string'){var s=document.createElement('script');document.getElementsByTagName('head')[0].appendChild(s);s.onload=function(){if(typeof b=="function")b();b=null};s.onreadystatechange=function(){if(s.readyState==4||s.readyState=="complete"){if(typeof b=="function")b();b=null}};s.charset="utf-8";s.src=a}else{var c=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){c++;if(c==a.length){b();b=null}})}}};


/* loadJs v0.1.2 */
/* 
  example: loadJs(scriptPaths, callback);
    scriptPaths is either a string (for a single file) or an array
*/

var loadJs=function(src, callback){

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

        if(typeof callback=="function") callback(); callback=null

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


/* hash v0.3 */
var hash = {
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

/* previousObject, nextObject, childObject, getChildIndex v0.1 */
var previousObject = function(elem) {
  
  elem = elem.previousSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.previousSibling;

  return elem;

};

var nextObject = function(elem) {

  elem = elem.nextSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.nextSibling;  

  return elem;
};

var childObject = function(elem, index) {

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

var getChildIndex = function(child) {

  var i = 0;

  while( (child = previousObject(child)) != null ) i++;

  return i;

};

function forEach(array, action) {
  for (var i = 0; i < array.length; i++)
    action(array[i]);
};


function asymDiff(a, b) {

  if (typeof dSuffix != 'string') dSuffix = '';
  var diff = {};
  
  for (pName in a) {
      if (typeof b[pName] != 'undefined') {
          if (b[pName] !== a[pName]) diff[pName] = a[pName];
      } else {
          diff[pName] = a[pName];
      }
  }
  
  return diff;
};


function getScrollOffsets(w) {

  // Use the specified window or the current window if no argument 
  w = w || window;

  // This works for all browsers except IE versions 8 and before
  if (w.pageXOffset != null) return {
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

/* setLinks, setLinksElems v0.1.1 */
function setLinks(inputText, options) {

  if (typeof options == 'undefined') options = {};

  // options: classes and targetBlank
  var target = typeof options.targetBlank == 'undefined'?'':options.targetBlank?' target="_blank"':'',
    classes = typeof options.linkClasses == 'undefined'?'':[' class="', options.linkClasses, '"'].join(''),
    patterns = {
      http: /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      www: /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;ï\*]*[-A-Z0-9+&@#\/%=~_|ï\*]/gim,
      mailto: /([\.\w]+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim
    };

  return inputText
    .replace(/\u200B/g, "")
    //URLs starting with http://, https://, or ftp://  
    .replace(patterns.http, function($0,$1){ 
      return $1?$0:['<a', classes, ' href="', $0, '"', target, '>', $0, '</a>'].join('') 
    })
    //URLS starting with www and not the above
    .replace(patterns.www, function($0,$1){ 
      return $1?$0:['<a', classes, '" href="http://', $0, '"', target, '>', $0,'</a>'].join('');
    })
    //Change email addresses to mailto:: links
    .replace(patterns.mailto, ['<a', classes, '" href="mailto:$1">$1</a>'].join(''));
};

function setLinksElems(elems, options) {
  if (typeof elems.nodeType != 'undefined') elems = [selem];
  forEach(elems, function(elem) {
    elem.innerHTML = setLinks(elem.innerHTML, options);
  });
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
};