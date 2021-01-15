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