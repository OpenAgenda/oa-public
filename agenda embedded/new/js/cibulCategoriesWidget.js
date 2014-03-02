(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulCategoriesWidget = cibulWidget({
      name: 'categories',
      templates: {
        main: '<ul class="categories"></ul>',
        item: '<li<% if (typeof cl !== \'undefined\' ) { %> class="<%= cl %>"<% } %>><a data-slug="<%= s %>"><%= c %></a></li>'
      },
      category: false, // selected category (part of selection filter)
      activeCategories: [], // active categories (used by events in selection)
      init: function(ctl) {

        this.categories = ctl.ct;

        this._create();

        this._createItems(this.categories, this.addItemBehavior,'ul');

      },
      enable: function(reqParams) {

        this.category = reqParams.category?reqParams.category:false;

      },
      clear: function() {

        this.activeCategories = [];

      },
      include: function(eItem) {

        if (eItem.c && !contains(this.activeCategories, eItem.c)) this.activeCategories.push(eItem.c);

      },
      refresh: function() {

        // toggle active classe on widget items

        var catElem, elemIndex = 0;

        while (catElem = childObject(el(this.element, 'ul'), elemIndex++)) {

          var cat = el(catElem, 'a').getAttribute(this.attributes.slug);

          if (cat == this.category) {
            addClass(catElem, this.classes.selected);
          } else {
            removeClass(catElem, this.classes.selected);
          }

          if (contains(this.activeCategories, cat)) {
            addClass(catElem, this.classes.active);
          } else {
            removeClass(catElem, this.classes.active);
          }

        }

      },
      addItemBehavior: function(itemElem, itemData) {

        var self = this;

        addEvent(itemElem, 'click', function() {

          self._select({category: self.category==itemData.s?null:itemData.s});

        });

      }
    });

    new cibulCategoriesWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgct', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();