(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var cibulCategoriesWidget = function(element, controllers) {

    var update = function (values) {
      console.log('the widget is given values that indicate external change');
    },

    UID = 0, // index of the embed uid in the widget config

    config = element.getAttribute('data-cbctl').split('|');

    // hook is used to throw info to controller

    hook = controllers.register('categories', {uid: config[UID], update: update});

  };

  // load widget dependencies before loading widget
  loadJs(cibulDebug?cibulDebug.paths.lib:['//cibul.net/js/cibulWidgetLib.js'], function() {

    cibulWidgetInit('.cbpgct', cibulCategoriesWidget, cibulAgendaControllers);

  });

})();