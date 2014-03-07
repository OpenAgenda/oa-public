var selectForm = function(headSelector, sectionHeadSelector, sectionContent, options) {

  var params = extend({
    canvas: false,
    submit: false,
    wrapper: false,
    wrapperClass: false,
  }, options),

  select, // our select control

  run = function() {

    if (!params.canvas) params.canvas = el('body');

    if (!params.submit) params.submit = params.canvas.getElementsByTagName('input[type="submit"]')[0];

    _createSelect();

    if (params.submit) _moveSubmits();

    addEvent(select, 'change', _toggleDisplay);

    _toggleDisplay();

  },

  _createSelect = function() {

    select = document.createElement('select');

    var i=-1, elemToInsert = select;

    if (params.wrapper) {
      elemToInsert = document.createElement(params.wrapper);

      if (params.wrapperClass) elemToInsert.className = params.wrapperClass;

      elemToInsert.appendChild(select);
    }

    el(params.canvas, headSelector).insertAdjacentElement('beforebegin', elemToInsert);
    

    // insert title as first select option

    select.options[select.options.length] = new Option(_popText(el(params.canvas, headSelector)), i++);

    // insert section titles in select
    while (els(params.canvas, sectionHeadSelector).length) {

      select.options[select.options.length] = new Option(_popText(el(params.canvas, sectionHeadSelector)), i++);

    }

  },

  _moveSubmits = function() {

    var submitElems = (typeof params.submit.length=='undefined')?[params.submit]:params.submit;

    forEach(submitElems, function(elem) {
      select.insertAdjacentElement('afterend', elem);
    });

  },

  _toggleDisplay = function() {

    var selectedIndex = select.options[select.selectedIndex].value,

    sectionElems = els(params.canvas, sectionContent);

    for (var i = sectionElems.length - 1; i >= 0; i--) {

      if (i==selectedIndex) {
        removeProperty(sectionElems[i].style, 'display');
      } else {
        sectionElems[i].style.display = 'none';
      }
      
    }

  },

  _popText = function(elem) {

    var nestedItem = elem, text;

    // find most nested and pick text
    while (childObject(nestedItem, 0)) nestedItem = childObject(nestedItem, 0);

    text = nestedItem.innerHTML;

    elem.parentNode.removeChild(elem);

    return text;

  };

  run();

};