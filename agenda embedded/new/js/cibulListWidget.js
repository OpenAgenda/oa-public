(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var params = {
    events: {
      load: 'load'
    }
  },

  reqParams,

  hasNext = false,      // state indicating if there are more events to load

  eventOpen = false,    // state indicating if event is being displayed or not

  cibulListWidget = function(element, register) {

    var controller,

    tunnel, // link between inside and outside of iframe.

    responsePending = false,

    run = function() {

      controller = register('list', extend(_extractIdentifiers(element), {
        sendRequest: _sendRequest
      }));

      tunnel = _handleTunnel(element, controller.onResponse);

      addEvent(document, 'scroll', function() {
        _monitorScroll(tunnel, element);
      });

    },

    /**
     * send data through the tunnel
     */
    
    _sendRequest = function(request) {

      responsePending = true;

      tunnel.send(extend({event: params.events.load}, request));

    };

    run();

  },


  /**
   * handle data received from the iframe tunnel
   */
  
  _handleTunnel = function(element, onResponse) {

    return iTunnel({target: element, onReceive: function(data) {

      responsePending = false;

      // adjust height if required
      if (data.height) {

        element.style.height = data.height + 'px';

        delete data.height;

      }


      // does list have more content to load?
      
      if (data.hasNext) hasNext = (data.hasNext == 'true');


      // callback should only be called if a load has been successful

      if (data.event == 'success') {

        delete data.event;

        reqParams = extend({}, data);

        onResponse(reqParams);

      } else if (data.event == 'eventopensuccess') {

        eventOpen = true;

        onResponse({uid: data.uid});

      } else if (data.event == 'closeevent') {

        eventOpen = false;

        onResponse(reqParams);

      }

    }});

  },


  /**
   * extract key and uid from iframe source attribute
   */
  
  _extractIdentifiers = function(element) {

    var src = element.getAttribute('src');

    if ((typeof cibulEnv !== 'undefined') && (typeof cibulEnv.templates !== 'undefined') && cibulEnv.templates.list) {

      var config = src.substr(src.indexOf('#') + 1).split('|');

      return { uid: config[0], key: config[1] };

    } else {

      var url = src.split('?')[0];

      return {
        uid: url.substr(url.indexOf('/embed/') + '/embed/'.length),
        key: src.getUrlParameters().key
      };

    }

  },

  _monitorScroll = function(tunnel, element) {

    if (!responsePending && !eventOpen && hasNext && (element.offsetTop + element.offsetHeight <= _scrollPosition() + el('html').clientHeight)) {
      
      responsePending = true;
      
      tunnel.send({event: 'loadNext'});

    }

  },

  _scrollPosition = function(value) {

    if (typeof value !== 'undefined') scrollTo(0, value);

    return getScrollOffsets().y;
    
  },

  run = function() {
    cibulControllers.loadWidget('.cbpglst', cibulListWidget);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();