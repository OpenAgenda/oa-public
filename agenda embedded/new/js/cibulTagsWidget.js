(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulTagsWidget = cibulWidget({
      name: 'tags',
      subset: false,
      activeTags: [],
      reqTags: [],
      templates: {
        main: '<ul class="tags"></ul>',
        item: '<li><a data-slug="<%= s %>"><%= t %></a></li>'
      },
      tag: false, // active category (part of selection filter)
      defaultStyle: [
        '.cibulTags ul { margin: 0; padding: 0; }',
        '.cibulTags li { display: inline-block; cursor: pointer; padding-right: 1em; color: {{ disabledColor }}; font-size: 0.9em; }',
        '.cibulTags li.active { color: {{ activeColor }}; }',
        '.cibulTags li.selected { color: {{ selectedColor }}; }',
        '.cibulTags.disabled li { cursor: wait; color: {{ disabledColor }} }'
      ].join(''),
      init: function(ctl, config) {

        this.defineTagSet(ctl, config);

        this._create();

        this._createItems(this.tags, this.addItemBehavior,'ul');

      },
      enable: function(reqParams) {

        this.tag = false;
        this.reqTags = [];

        // there is no active filter by tag
        if (!reqParams.tags) return;

        this.reqTags = (typeof reqParams.tags == 'string')?reqParams.tags.split(','):reqParams.tags;

        // there is no subset for this widget. first tag is assumed right tag
        if (!this.subset) {

          this.tag = this.reqTags[0];

          return;

        }

        // there is a subset, if tag is found in it, we keep it
        for (var i = this.reqTags.length - 1; i >= 0; i--) {

          if (contains(this.subset, this.reqTags[i])) {

            this.tag = this.reqTags[i];

            break;

          }

        }

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

          if (!self.tag && !contains(self.activeTags, itemData.s)) return;

          // remove current tag from array
          
          if (self.tag) self.reqTags = removeValueFromArray(self.reqTags, self.tag);

          if (self.tag!==itemData.s) {

            // if clicked tag is not current tag, should be added to filter
            
            self.reqTags.push(itemData.s);
            
          }

          self._select({tags: self.reqTags.length?self.reqTags:null});

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