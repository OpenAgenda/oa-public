(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var cibulCategoriesWidget = function(element, controllers) {

    var params = {
      attributes: {
        slug: 'data-slug'
      },
      classes: {
        item: 'filter-item',
        disabled: 'disabled',
        active: 'active'
      },
      templates: {
        main: '<ul class="categories"></ul>',
        item: '<a data-slug="<%= s %>"><%= c %></a>'
      }
    },

    canvas, // categories list canvas

    categories, // the categories handled by widget

    activeCategories = [],

    currentCategory = false,

    enabled = false,

    controller = false,

    run = function() {

      var UID = 0, // index of the embed uid in the widget config

      config = element.getAttribute('data-cbctl').split('|');

      // register widget and get handle to controller

      controller = controllers.register('categories', {
        uid: config[UID],
        clear: clear,
        include: include,
        enable: enable,
        disable: disable
      });

      controller.getControlData(function(ctl) {

        categories = ctl.ct;

        _create(_createItem);

      });

    },


    _onSelect = function(category) {

      controller.update({category: category.s});

    },

    
    /**
     * clear current state of widget
     */
    
    clear = function() {

      disable();

    },


    /**
     * called by controller to indicate that event item is in selection
     * widget knows then that corresponding category is included in current selection
     */
    
    include = function(eItem) {

    },

    
    /**
     * enable the widget
     */
    
    enable = function(reqParams) {

      if (reqParams.category) currentCategory = reqParams.category;

      enabled = true;

      _refresh();

    },

    disable = function() {

      enabled = false;

      _refresh();

    },

    _refresh = function() {

      // toggle disabled class on widget

      if (enabled) {
        removeClass(el(element, 'ul'), params.classes.disabled);
      } else {
        addClass(el(element, 'ul'), params.classes.disabled);

        return;
      }

      // toggle active classe on widget items

      var catElem, elemIndex = 0;

      while (catElem = childObject(el(element, 'ul'), elemIndex++)) {

        if (catElem.getAttribute(params.attributes.slug) == currentCategory) {
          addClass(catElem, params.classes.active);
        } else {
          removeClass(catElem, params.classes.active);
        }

      }

    },


    /**
     * write the widget in the dom
     */
    
    _create = function(itemCreator) {

      element.innerHTML = new EJS({text: params.templates.main }).render();

      for (var i = categories.length - 1; i >= 0; i--) {

        el(element, 'ul').appendChild(itemCreator(categories[i]));

      }

    },


    /**
     * write a category item
     */

    _createItem = function(category) {

      var li = document.createElement('li');

      li.innerHTML = new EJS({text: params.templates.item }).render(category);

      li.setAttribute(params.attributes.slug, category.s);

      addEvent(li, 'click', function() {

        if (enabled) _onSelect(category);

      });

      return li;

    };

    run();
  };

  // load widget dependencies before loading widget
  loadJs(cibulDebug?cibulDebug.paths.lib:['//cibul.net/js/cibulWidgetLib.js'], function() {

    cibulWidgetInit('.cbpgct', cibulCategoriesWidget, cibulAgendaControllers);

  });

})();