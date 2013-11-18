var inputController = {

  _init: function(elems, params) {

    if (typeof elems == 'string') {
      this.elems = document.getElementsByName(elems);
      params.name = elems;
    } else if (Object.prototype.toString.call(elems) !== '[object Array]')
      this.elems = [elems];
    else
      this.elems = elems;

    if (!this.elems.length) throw 'controller has to be associated with existing input';

    this.params = extend({
      onUpdate: false,
      validator: false, // used if validation of the content is required
      onValidChange: false, // called when the state of the value changes
      name: false,
      classes: { disabled: 'disabled' },
      events: 'change',
      value: false,
      enabled: true,
    }, typeof params == 'undefined'?{}:params);

    this._eventify();

    this.params.value?this._updateDom(this.params.value):this._readDom();

    if (this.params.enabled) 
      this.enable();
    else
      this.disable();
  },
  _setValue: function(newValue) {

    if (!this.validate(newValue)) return;

    if (this.params.onUpdate) this.params.onUpdate(newValue, this.params.name);

  },
  _eventify: function() {

    var self = this;

    forEach(this.elems, function(widgetElement) {
      addEvent(widgetElement, self.params.events, function() {
        self._readDom();
      });
    });

  },
  _readDom: function() {

    this._setValue(this._read(this.elems));

  },
  _updateDom: function(newValue) {

    if (typeof newValue != 'undefined') this._setValue(newValue);

    this._write(this.elems, newValue);

  },

  validate: function(value) {

    if (!this.params.onValidChange || !this.params.validator) return true;

    if (typeof this.valid == 'undefined') return this.valid = true;

    var error = null;

    try {
      this.params.validator(value);
    } catch(e) {
      error = e;
    }

    if (this.valid !== (error?false:true)) {
      this.params.onValidChange(error);
    }

    this.valid = error?false:true;

    return this.valid;

  },

  enable: function() {

    forEach(this.elems, function(elem){
      elem.removeAttribute('disabled');
    });

    if (this.elems[0].nodeName.toLowerCase()=='option' && this.elems[0].parentNode)
      removeClass(this.elems[0].parentNode, this.params.classes.disabled);
    else
      removeClass(this.elems[0], this.params.classes.disabled);

  },

  disable: function() {

    forEach(this.elems, function(elem) {
      elem.setAttribute('disabled', 'disabled');
    });

    if (this.elems[0].nodeName.toLowerCase()=='option' && this.elems[0].parentNode)
      addClass(this.elems[0].parentNode, this.params.classes.disabled);
    else
      addClass(this.elems[0], this.params.classes.disabled);

  },

  get: function() {
    return this._read(this.elems);
  },

  set: function(value) {
    this._write(this.elems, value);
  },

  setValidation: function(validator) {
    this.validator = validator;
  },

  setOnUpdate: function(onUpdate) {
    this.params.onUpdate = onUpdate;
  }

},

inputControllers = {
  radio: function() { this._init.apply(this, arguments); },
  select: function() { this._init.apply(this, arguments); },
  text: function() { this._init.apply(this, arguments); },
  textarea: function() { this._init.apply(this, arguments); }
},


// this is to add controllers to a bunch of existing inputs all at once

setControllers = function(params) {

  for (type in params.widgets) {

    forEach(params.widgets[type], function(name) {
      new inputControllers[type](name, params);
    });

  }

};

inputControllers.radio.prototype = extend({
  _read: function(elems) {
    for (var i=0;i<elems.length;i++) {
      if (elems[i].checked) return elems[i].value;
    }
  },
  _write: function(elems, value) {
    forEach(elems, function(elem) {
      elem.value==value?elem.setAttribute('checked','checked'):elem.removeAttribute('checked');
    });
  }
}, inputController);


inputControllers.select.prototype = extend({
  _read: function(elems) {
    if (!elems[0].options) return undefined;
    return elems[0].options[elems[0].options.selectedIndex].value;
  },
  _write: function(elems, value) {

    for (var i=0; i<elems[0].options.length; i++) {
      if (elems[0].options[i].value == value) {
        elems[0].options.selectedIndex = i;
        return;
      }
    }
  }
}, inputController);


inputControllers.text.prototype = extend({
  _read: function(elems) {
    return elems[0].value;
  },
  _write: function(elems, value) {
    elems[0].value = value;
  }
}, inputController);


inputControllers.textarea.prototype = extend({
  _read: function(elems) {
    return elems[0].value;
  },
  _write: function(elems, value) {
    elems[0].value = value;
  }
}, inputController);