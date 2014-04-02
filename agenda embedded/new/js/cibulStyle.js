(function(w,d) {

  if (typeof w.cibulStyle !== 'undefined') return;

  var styles = {
    disabledColor: '#ccc',
    defaultColor: '#333',
    activeColor: '#333',
    selectedColor: 'blue',
    preselectedColor: '#f0f0f0'
  },

  sheet,

  style = '',

  init = function() {

    _createSheet();

    if (document.readyState === "complete")
      _stickSheet();
    else
      addEvent(window, 'load', _stickSheet);

  },

  _format = function(tpl, ctx) {
    return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function(m, g) {
        return ctx[g.replace(/^\s+|\s+$/g, '')] || '';
    });
  },

  _createSheet = function() {

    sheet = d.createElement('style');

    sheet.type = 'text/css';

    sheet.media = 'all';

  },

  _stickSheet = function() {

    d.body.appendChild(sheet);

  };

  w.cibulStyle = function(styleToAppend) {

    style += _format(styleToAppend, styles);

    if (sheet.styleSheet) {
      sheet.styleSheet.cssText = style;
    } else {
      sheet.innerHTML += style;
    }

  };

  init();

})(window, document);