if (typeof cibulWidget == 'undefined') var cibulWidget = function(methods) {

  var widget = function() {
    this._init.apply(this, arguments);
  };

  widget.prototype = extend({
    enabled: false,   // indicates weather widget is enabled or not
    requireCtl: true, // false if widget does not require control data to function
    classes: {
      disabled: 'disabled',
      active: 'active',
      selected: 'selected'
    },
    attributes: {
      slug: 'data-slug'
    },
    _init: function(element, register) {

      var self = this;

      self.element = element;
      
      self._log('registering to controller');

      var config = element.getAttribute('data-cbctl').split('|'),

      UID = 0;

      self._log('registering widget with embed uid: ' + config[UID]);

      self.controller = register(self.name, {
        uid: config[UID],
        clear: function() { self._clear(); },
        include: function(i) { self._include(i); },
        enable: function(p) { self._enable(p); },
        disable: function() { self._disable(); },
        getWidget: function() { return self._getWidget(); }
      });

      if (this.requireCtl) self.controller.getControlData(function(ctl) {

        self._log('control data is fetched');

        if (typeof self.init == 'undefined') {
          
          self._log('widget init method is not defined');

          return;
        }

        self._log('styling widget');


        // if dcss param is set for widget, default style is applied
        if ( ctl.ebd && ctl.ebd.dcss ) {

          if (ctl.ebd.dcss[self.name]) self._applyDefaultStyle();

        } else {

          self._applyDefaultStyle();

        }

        self.init(ctl, config);

      });
      else self.init(config);

    },

    _getWidget: function() {

      return this;

    },

    _clear: function() {

      this._log('clearing');

      if (typeof this.clear !== 'undefined') this.clear();

      this._disable();

    },


    /**
     * called by controller to indicate that event item is in current selection
     */
    
    _include: function(eventItem) {

      if (typeof this.include !== 'undefined') this.include(eventItem);

    },


    /**
     * called by widget to indicated value has been selected
     * checks widget state and sends new value to controller
     */
    
    _select: function(data) {

      if (this.enabled) {

        this._log('selected item, sending data to controller', data);

        this.controller.update(data);

      } else {

        this._log('select attempt on disabled widget', data);

      }

    },


    _enable: function(reqParams) {

      if (!isDef(reqParams)) reqParams = {};
      
      this._log('enabling');

      this.enabled = true;

      if (typeof this.enable !== 'undefined') this.enable(reqParams);

      this._refresh();

    },


    _refresh: function() {

      this._log('refreshing');

      if (typeof this.refresh !== 'undefined') this.refresh();

      if (!this.enabled) {

        addClass(this.element, this.classes.disabled);

        return;

      }

      removeClass(this.element, this.classes.disabled);

    },


    _disable: function() {
      
      this._log('disabling');

      this.enabled = false;

      if (typeof this.disable !== 'undefined') this.disable();

      this._refresh();

    },


    /**
     * create main widget element and attach it to the dom
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    
    _create: function(data) {

      var self = this;

      self.element.innerHTML = new EJS({text: self.templates.main }).render(data);

      return self.element;

    },


    /**
     * create dom data item, put it in element, within specified selector
     */
    
    _createItems: function(itemsData, onCreate, selector) {

      var self = this, elem = self.element;

      if (typeof selector !== 'undefined') elem = el(elem, selector);

      for (var i = itemsData.length - 1; i >= 0; i--) {

        var itemCanvas = document.createElement('div');

        itemCanvas.innerHTML = new EJS({text: self.templates.item }).render(itemsData[i]);

        var item = childObject(itemCanvas, 0);

        onCreate.apply(self, [item, itemsData[i]]);

        elem.appendChild(item);
      }

    },

    /**
     * apply default styles to widget, if any
     */
    
    _applyDefaultStyle: function() {

      this._log('applying default style');

      if (typeof this.defaultStyle !== 'undefined') cibulStyle(this.defaultStyle);

    },


    /**
     * log things if in debug mode
     */
    
    _log: function(message, data) {

      if (typeof cibulEnv == 'undefined') return;

      console.log(this.name + ': ' + message);

      if (typeof data !== 'undefined') console.log(data);

    }
  }, methods);

  return widget;

};