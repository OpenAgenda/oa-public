(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulTagsWidget = cibulWidget({
      name: 'tags',
      subset: false,
      activeTags: [],
      templates: {
        main: '<ul class="tags"></ul>',
        item: '<li><a data-slug="<%= s %>"><%= t %></a></li>'
      },
      tag: false, // active category (part of selection filter)
      init: function(ctl, config) {

        this.defineTagSet(ctl, config);

        this._create();

        this._createItems(this.tags, this.addItemBehavior,'ul');

      },
      enable: function(reqParams) {

        this.tag = reqParams.tags?reqParams.tags:false;

      },
      clear: function() {

        this.activeTags = [];

      },
      include: function(eItem) {

        if (eItem.t && eItem.t.length) for (var i = eItem.t.length - 1; i >= 0; i--) {
          if (!contains(this.activeTags, eItem.t[i])) this.activeTags.push(eItem.t[i]);
        }

      },
      refresh: function() {

        // toggle active classe on widget items

        var tagElem, elemIndex = 0;

        while (tagElem = childObject(el(this.element, 'ul'), elemIndex++)) {

          var tag = el(tagElem, 'a').getAttribute(this.attributes.slug);

          if (tag == this.tag) {
            addClass(tagElem, this.classes.selected);
          } else {
            removeClass(tagElem, this.classes.selected);
          }

          if (contains(this.activeTags, tag)) {
            addClass(tagElem, this.classes.active);
          } else {
            removeClass(tagElem, this.classes.active);
          }

        }

      },
      addItemBehavior: function(itemElem, itemData) {

        var self = this;

        addEvent(itemElem, 'click', function() {

          self._select({tags: self.tag==itemData.s?null:itemData.s});

        });

      },
      defineTagSet: function(ctl, config) {

        if (config.length > 1) {

          this.subset = config[1].split(',');

          this.tags = [];

          for (var i = ctl.t.length - 1; i >= 0; i--) {
            if (contains(this.subset, ctl.t[i].s)) this.tags.push(ctl.t[i]);
          }

        } else {

          this.tags = ctl.t;

        }

      }
    });

    new cibulTagsWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgtg', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();