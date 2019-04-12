var cn = require('../common/common.mod.js');

module.exports = function(headSelector, sectionHeadSelector, sectionContent, options) {

  var params = cn.extend({
    canvas: false,
    submit: false,
    wrapper: false,
    wrapperClass: false,
  }, options),

  select, // our select control

  run = function() {

    if (!params.canvas) params.canvas = cn.el('body');

    if (!params.submit) params.submit = params.canvas.getElementsByTagName('input[type="submit"]')[0];

    _createSelect();

    if (params.submit) _moveSubmits();

    cn.addEvent(select, 'change', _toggleDisplay);

    _toggleDisplay();

  },

  _createSelect = function() {

    select = document.createElement('select');

    var i=-1, elemToInsert = select;

    select.className = 'form-control';

    if (params.wrapper) {
      elemToInsert = document.createElement(params.wrapper);

      if (params.wrapperClass) elemToInsert.className = params.wrapperClass;

      elemToInsert.appendChild(select);
    }

    cn.el(params.canvas, headSelector).insertAdjacentElement( 'beforebegin', elemToInsert );

    // insert title as first select option

    select.options[select.options.length] = new Option(_popText(cn.el(params.canvas, headSelector)), i++);

    // insert section titles in select
    while ( cn.els( params.canvas, sectionHeadSelector ).length ) {

      select.options[select.options.length] = new Option(_popText(cn.el(params.canvas, sectionHeadSelector)), i++);

    }

  },

  _moveSubmits = function() {

    var submitElems = (typeof params.submit.length=='undefined')?[params.submit]:params.submit;

    cn.forEach(submitElems, function(elem) {
      select.insertAdjacentElement('afterend', elem);
    });

  },

  _toggleDisplay = function() {

    var selectedIndex = select.options[select.selectedIndex].value,

    sectionElems = cn.els(params.canvas, sectionContent);

    for (var i = sectionElems.length - 1; i >= 0; i--) {

      if (i==selectedIndex) {
        cn.removeProperty(sectionElems[i].style, 'display');
      } else {
        sectionElems[i].style.display = 'none';
      }

    }

  },

  _popText = function(elem) {

    var nestedItem = elem, text;

    // find most nested and pick text
    while (cn.childObject(nestedItem, 0)) nestedItem = cn.childObject(nestedItem, 0);

    text = nestedItem.innerHTML;

    elem.parentNode.removeChild(elem);

    return text;

  };

  run();

};
