var formWidget = {
  _init: function(name, getter, setter, params) {

    extend(this, {
      widgetElements: document.getElementsByName(name),
      getter: getter,
      setter: setter,
      name: name,
      params: extend({
        disabledClass: 'disabled',
        event: 'change'
      }, params)
    });

    var configValue = typeof getter == 'function'?getter(name):getter;

    this._eventify();

    configValue==undefined?this._readDom():this._updateDom(configValue);

    this._enableDom();
  },
  _setValue: function(newValue) {

    value = newValue;

    if (this.setter) this.setter(this.name, newValue);

  },
  _eventify: function() {

    var self = this;

    forEach(this.widgetElements, function(widgetElement) {
      addEvent(widgetElement, self.params.event, function() {
        self._readDom();
      });
    });

  },
  _enableDom: function() {

    forEach(this.widgetElements, function(widgetElement){
      widgetElement.removeAttribute('disabled');
    });

    removeClass(this.widgetElements[0].parentNode, this.params.disabledClass);

  },
  _readDom: function() {
    this._setValue(this._read(this.widgetElements));
  },
  _updateDom: function(newValue) {

    if (typeof newValue != 'undefined') this._setValue(newValue);

    this._write(this.widgetElements, value);

  }

},
radioWidget = function() { this._init.apply(this, arguments); },
selectWidget = function() { this._init.apply(this, arguments); },
textWidget = function() { this._init.apply(this, arguments); },
textareaWidget = function() { this._init.apply(this, arguments); },
setWidgets = function(params) {

  var widgets = {
    radio: radioWidget,
    select: selectWidget,
    text: textWidget,
    textarea: textareaWidget
  };

  for (type in params.widgets) {

    forEach(params.widgets[type], function(name) {
      new widgets[type](name, params.get, params.set);
    });

  }

};

radioWidget.prototype = extend({
  _read: function(widgetElements) {
    for (var i=0;i<widgetElements.length;i++) {
      if (widgetElements[i].checked) return widgetElements[i].value;
    }
  },
  _write: function(widgetElements, value) {
    forEach(widgetElements, function(wElement) {
      wElement.value==value?wElement.setAttribute('checked','checked'):wElement.removeAttribute('checked');
    });
  }
}, formWidget);


selectWidget.prototype = extend({
  _read: function(widgetElements) {
    if (!widgetElements[0].options) return undefined;
    return widgetElements[0].options[widgetElements[0].options.selectedIndex].value;
  },
  _write: function(widgetElements, value) {

    for (var i=0; i<widgetElements[0].options.length; i++) {
      if (widgetElements[0].options[i].value == value) {
        widgetElements[0].options.selectedIndex = i;
        return;
      }
    }

  }
}, formWidget);


textWidget.prototype = extend({
  _read: function(widgetElements) {
    return widgetElements[0].value;
  },
  _write: function(widgetElements, value) {
    widgetElements[0].value = value;
  }
}, formWidget);


textareaWidget.prototype = extend({
  _read: function(widgetElements) {
    return widgetElements[0].value;
  },
  _write: function(widgetElements, value) {
    widgetElements[0].value = value;
  }
}, formWidget);