/* remote v0.3 */
var remote = {
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
  
  getStack: function(params) {

    var self = this;
    var receivedStack = {};
    var failedAlready = false;


    for (var index in params.stack) {

      if (params.logger) params.logger.log('remote.getStack - sending index ' + index);

      self.send(params.stack, index, receivedStack, params.callback, params.logger, params.retries, params.timeout, params.ajax);

    }

  },
  send: function(stack, index, receivedStack, callback, logger, retries, timeout, ajax) {

    var self = this;

    if (typeof ajax == 'undefined') ajax = true;

    self.responseType = 'success';

    self.get(stack[index].resource, { data: stack[index].parameters, retries: retries, logger: logger, name: index, timeout: timeout }, function(textStatus, data){

      delete stack[index];

      if (textStatus == 'success') {

        if (logger) logger.log('remote.send - received index ' + index + ' successfully');

        receivedStack[index] = data;

      } else {

        self.responseType = 'partial';

      }

      if (!Object.size(stack)) {

        if (!Object.size(receivedStack)) self.responseType = 'noconnection';

        callback(self.responseType, receivedStack);

      }

    }, ajax);

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