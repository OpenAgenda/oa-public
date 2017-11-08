// this here allows the creation of the element and the appending of a controller

if ( typeof extend === 'undefined' ) {

  var utils = require( '@openagenda/utils' ),

  du = require( '../domUtils' ),

  extend = utils.extend,

  addClass = du.addClass,

  removeClass = du.removeClass,

  forEach = utils.forEach,

  inputControllers = require( './inputControllers' );

}

var inputWidget = {

  _init: function(params) {

    var self = this;

    this.elems = [];

    this.inputElems = [];

    this.error = false;

    this.params = params = extend({
      name: false, // not compulsory, but it would be nice
      canvas: false,
      where: 'beforeend',
      info: false,
      label: false,
      validator: false,
      enabled: true,
      classes: { info: 'info', error: 'error', disabled: 'disabled' },
      filteredChars: {}
    }, (typeof params == 'undefined')?{}:params);

    this._createElements();

    this._createInfo();

    this._createLabel();

    if (this.params.validator) {

      this.onValidChange = this.params.onValidChange;

      params.onValidChange = function(err) {

        self._onValidationChange(err);

      };

    }

    this.controller = new inputControllers[this.type](this.inputElems, params);

    // add input to canvas if required

    if (params.canvas) {

      if (typeof params.canvas == 'string') params.canvas = el(params.canvas);

      forEach(this.elems, function(elem) {
        params.canvas.insertAdjacentElement(params.where, elem);
      });

    }

    return {
      enable: function() {
        self.controller.enable();
      },
      disable: function() {
        self.controller.disable();
      },
      remove: function( removeCanvas ) {
        self.remove( removeCanvas );
      },
      setError: function(error) {
        self._onValidationChange(error);
      },
      validate: function() {
        return self.controller.validate(self.controller.get());
      },
      getError: function() {
        return self.error;
      },
      setValid: function() {
        self._onValidationChange();
      },
      setOnUpdate: function(onUpdate, trigger) {
        self.controller.setOnUpdate(onUpdate);
        if (trigger) onUpdate(self.controller.get());
      },
      get: function() {
        return self.controller.get();
      },
      set: function(value) {
        self.controller.set(value);
      },
      getElements: function() {
        return self.getElements();
      }
    };

  },

  getElements: function() {
    return this.elems;
  },

  remove: function( removeCanvas ) {

    var child, canvas = false;

    if ( typeof removeCanvas == 'undefined' ) removeCanvas = false;

    while (child = this.elems.pop()) {

      if ( child.parentNode ) {

        canvas = child.parentNode;

        child.parentNode.removeChild(child);

      }

    }

    if ( removeCanvas && canvas && canvas.parentNode ) {

      canvas.parentNode.removeChild( canvas );

    }

  },

  _createInfo: function(force) {

    if (typeof force == 'undefined') force = false;

    // is used for error reporting or info displaying. If either is required, 

    if (!this.params.validator && !this.params.info && !force) return;

    this.info = document.createElement('span');
    this.info.className = this.params.classes.info;

    if (this.params.info) this.info.innerHTML = this.params.info;

    this.elems.push(this.info);

    this._displayInfo();

  },

  _createLabel: function() {

    if (!this.params.label) return;

    var label = document.createElement('label');

    label.innerHTML = this.params.label;

    this.elems.splice(0,0, label);

  },

  _displayInfo: function() {

    if ( !this.info ) return;

    removeClass( this.info, this.params.classes.error );

    this.info.innerHTML = this.params.info?this.params.info:'';

  },

  _displayError: function(message) {

    if (!this.info) this._createInfo(true);

    addClass(this.info, this.params.classes.error);

    this.info.innerHTML = message;

  },

  _onValidationChange: function(err) {

    if (err) {

      this._displayError(err);

      this.error = err;

    }
    else {

      this._displayInfo();

      this.error = false;
    }
      

    if (this.onValidChange) this.onValidChange(err);

  }

},

inputWidgets = {
  radio: function() { return this._init.apply(this, arguments); },
  select: function() { return this._init.apply(this, arguments); },
  text: function() { return this._init.apply(this, arguments); },
  textarea: function() { return this._init.apply(this, arguments); }
};

inputWidgets.radio.prototype = extend({
  type: 'radio',
  _createElements: function() {

    var value = this.params.value?this.params.value:false
      , name = this.params.name
      , self = this;

    forEach(this.params.options, function(option) {

      var elem = document.createElement('input');
      elem.setAttribute('type', 'radio');
      if (name) elem.setAttribute('name', name);
      elem.value = option.value;

      self.elems.push(elem);
      self.inputElems.push(elem);

      var elemLabel = document.createElement('label');
      elemLabel.innerHTML = option.label;

      self.elems.push(elemLabel);

    });

  }

}, inputWidget);

inputWidgets.select.prototype = extend({
  type: 'select',
  _createElements: function() {

    var elem = document.createElement('select');

    // loop through options and create them

    var value = this.params.value?this.params.value:false;

    forEach(this.params.options, function(option) {

      var optionElem = document.createElement('option');
      optionElem.innerHTML = option.label;
      optionElem.value = option.value;

      elem.appendChild(optionElem);

    });

    if (this.params.name) elem.setAttribute('name', this.params.name);

    this.elems.push(elem);
    this.inputElems.push(elem);

  }
}, inputWidget);

inputWidgets.text.prototype = extend({

  type: 'text',

  _createElements: function() {
    
    var elem = document.createElement('input');

    elem.setAttribute('type', 'text');
    if (this.params.placeholder) elem.setAttribute('placeholder', this.params.placeholder);
    if (this.params.name) elem.setAttribute('name', this.params.name);

    this.elems.push(elem);
    this.inputElems.push(elem);

  }
}, inputWidget);

inputWidgets.textarea.prototype = extend({

  type: 'textarea',

  _createElements: function() {
    var elem = document.createElement('textarea');
    if (this.params.placeholder) elem.setAttribute('placeholder', this.params.placeholder);
    if (this.params.name) elem.setAttribute('name', this.params.name);
    if (this.params.rows) elem.setAttribute('rows', this.params.rows);

    this.elems.push(elem);
    this.inputElems.push(elem);
  }

}, inputWidget);


if ( typeof module !== 'undefined' ) module.exports = inputWidgets;