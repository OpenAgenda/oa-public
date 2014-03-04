(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulSearchWidget = cibulWidget({
      name: 'search',
      templates: {
        main: '<input type="text">',
      },
      init: function(ctl) {

        this.categories = ctl.ct;

        this._create();

      },
      enable: function(reqParams) {

      },
      clear: function() {

      },
      include: function(eItem) {

      },
      refresh: function() {

      }
    });

    new cibulSearchWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgsc', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();