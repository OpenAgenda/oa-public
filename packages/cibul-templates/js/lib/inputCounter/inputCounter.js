var inputCounter = function(inputElem, limit, params) {

  params = extend({
    template: '<span></span>',
    errorClass: 'error',
    count: '<span>%count%</span>',
    label: '%count% characters left',
    canvas: false,
    className: false
  }, params);

  var elem, innerHTMLTemplate,

  run = function() {

    _createElem();

    innerHTMLTemplate = params.label.replace('%count%', params.count);

    addEvent(inputElem, ['keyup', 'change'], _refresh);

    _refresh();

    return {
      remove: remove
    };

  },

  _refresh = function() {

    var count = limit - parseInt(inputElem.value.length,10);

    if (count<0) {
      if (!hasClass(elem, params.errorClass)) addClass(elem, params.errorClass);
    } else {
      if (hasClass(elem, params.errorClass)) removeClass(elem, params.errorClass);
    }

    elem.innerHTML = innerHTMLTemplate.replace('%count%', count+'');

  },

  _createElem = function() {

    var canvas = document.createElement('div');

    canvas.innerHTML = params.template;

    elem = canvas.childNodes[0];

    if (params.className) addClass(elem, params.className);

    if (params.canvas)
      params.canvas.appendChild(elem);
    else
      inputElem.insertAdjacentElement('afterend', elem);

  },

  remove = function() {
    elem.parentNode.removeChild(elem);
  };

  return run();

};