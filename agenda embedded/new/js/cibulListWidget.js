(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var cibulListWidget = function(element, controllers) {

    var hook, // link between widget and controller

    run = function() {

      hook = controllers.register('list', _extractIdentifiers(element));

      _handleTunnel(element, hook);

    };

    run();

  },


  /**
   * handle data received from the iframe tunnel
   */
  
  _handleTunnel = function(element, onResponse) {

    return iTunnel({target: element, onReceive: function(data) {

      // adjust height if required
      if (data.height) {

        element.style.height = data.height + 'px';

        delete data.height;

      }

      // callback should only be called if a load has been successful

      if (data.event == 'success') {

        delete data.event;

        onResponse(data);

      }

    }});

  },


  /**
   * extract key and uid from iframe source attribute
   */
  
  _extractIdentifiers = function(element) {

    var src = element.getAttribute('src');

    if (isDef(cibulDebug)) {

      var config = src.substr(src.indexOf('#')+1).split('|');

      return { uid: config[0], key: config[1] };

    } else {

      var url = src.split('?')[0];

      return {
        uid: url.substr(url.indexOf('/embed/') + '/embed/'.length),
        key: src.getUrlParameters().key
      };

    }

  };


  // load widget dependencies before loading widget
  loadJs(cibulDebug?cibulDebug.paths.lib:['//cibul.net/js/cibulWidgetLib.js'], function() {

    cibulWidgetInit('.cbpglst', cibulListWidget, cibulAgendaControllers);

  });

})();