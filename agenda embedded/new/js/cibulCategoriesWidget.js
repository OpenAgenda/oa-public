(function() {

  var cibulCategoriesWidget = function(element, controller) {

    var update = function (values) {
      console.log('the widget is given values that indicate external change');
    },

    UID = 0, KEY = 1,

    config = element.getAttribute('data-cbctl').split('|');



    //'48959239/46744426|4bc1106de56674b18e6910699525dfe8'

    hook = controller.register('categories widget', {
      uid: config[UID],
      key: config[KEY]
    });

    //hook('ta mere!');

    // do we need more?

  };
  
  // register scripts
  var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  loadJs(cibulDebug?cibulDebug.paths.lib:['//cibul.net/js/cibulWidgetLib.js'], function() {

    var run = function() {

      forEach(els('.cbpgct'), function(elem) {

        if(!elem.hasAttribute('data-flagged')) {
          cibulCategoriesWidget(elem, cibulAgendaControllers);
          elem.setAttribute('data-flagged', '');
        }

      });
    };

    if (document.readyState === "complete")
      run();
    else
      addEvent(window, 'load', run);

  });


})();