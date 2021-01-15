var embedCodeField = function(element, options) {

  var values = {}
    , ejs
    , initValues = {};
  
  options = extend({
    init: {}, // default values
    template: false, // compulsory - template of content of field 
    classes: {
      disabled: 'disabled'
    }
  }, options);

  var _init = function() {

    _disable();

    _resetValues();

    _setFieldContent();

    _enable();

  },
  _setFieldContent = function() {

    var ejs = new EJS({text: options.template});

    element.value = ejs.render(values);

  },
  _resetValues = function() {
    values = extend({}, options.init);
  },
  _disable = function() {
    element.setAttribute('disabled','');
  },
  _enable = function() {
    element.removeAttribute('disabled');
  };

  _init();

  return {
    reset: _resetValues,
    set: function(newValues) {
      values = extend(values, newValues);
      _setFieldContent();
    },
    disable: _disable,
    enable: _enable
  }

};