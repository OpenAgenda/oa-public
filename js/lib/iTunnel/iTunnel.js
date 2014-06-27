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
      ,

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

      if (params.onReceive && Object.size(data)) params.onReceive(data);

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

  };


  if (typeof exports !== 'undefined')
    exports.iTunnel = iTunnel;
  else
    window.iTunnel = iTunnel;

})();