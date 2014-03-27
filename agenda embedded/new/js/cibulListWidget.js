(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var params = {
    events: {
      load: 'load'
    },
    scrollOffset: 50,
    heightOffset: 40
  },

  reqParams,

  hasNext = false,      // state indicating if there are more events to load

  eventOpen = false,    // state indicating if event is being displayed or not

  autoscroll = true,    // state indicating if list should load automatically

  listPos = false,

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

      controller.getControlData(function(ctl){

        if (ctl.ebd && !ctl.ebd.sc) autoscroll = false;

      });

    },

    /**
     * send data through the tunnel
     */
    
    _sendRequest = function(request) {

      responsePending = true;

      // clean request

      delete request.page;
      delete request.next;
      delete request.prev;
      delete request.count;
      delete request.reset;
      delete request.uid;

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

        element.style.height = (parseInt(data.height, 10) + params.heightOffset) + 'px';

        delete data.height;

      }

      // does list have more content to load?
      
      if (data.hasNext) hasNext = (data.hasNext == 'true');

      // callback should only be called if a load has been successful
      
      if (!contains(['eventopensuccess', 'closeevent', 'success'], data.event)) return;

      if (data.event == 'eventopensuccess') {

        eventOpen = true;

        _repositionToFrameTop(element);

        return onResponse({uid: data.uid});

      }

      if (data.event == 'closeevent') {
        
        eventOpen = false;

        _repositionToListOffset();

        delete reqParams.uid;

      }

      if (data.event == 'success') {

        delete data.event;

        reqParams = extend({}, data);

      }

      onResponse(reqParams);

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

    if (eventOpen) return;

    listPos = _scrollPosition();

    if (autoscroll && !responsePending && hasNext && (element.offsetTop + element.offsetHeight <= listPos + el('html').clientHeight)) {
      
      responsePending = true;
      
      tunnel.send({event: 'loadNext'});

    }

  },

  _repositionToFrameTop = function(element) {

    var framePos = _findPos(element)[1];

    if (_scrollPosition() > framePos) _scrollPosition(Math.max(0,framePos - params.scrollOffset));

  },

  _repositionToListOffset = function() {

    if (listPos) _scrollPosition(listPos);

  },

  _scrollPosition = function(value) {

    if (typeof value !== 'undefined') scrollTo(0, value);

    return getScrollOffsets().y;
    
  },

  _findPos = function(element) {

    var curleft = 0, curtop = 0;

    if (element.offsetParent) {

      do {
        curleft += element.offsetLeft;
        curtop += element.offsetTop;
      } while (element = element.offsetParent);

    }

    return [curleft, curtop];

  },

  run = function() {
    cibulControllers.loadWidget('.cbpglst', cibulListWidget);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();