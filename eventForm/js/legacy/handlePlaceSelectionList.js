"use strict";

var utils = require( '@openagenda/utils' ),

du = require( '../../../js/lib/domUtils' );

module.exports = function( params ) {

  params = utils.extend({
    canvas: false, // required; 
    templates: {
      main: '<ul></ul>',
      item: [
        '<li class="suggestion js_suggestion">',
          '<span class="name"><%= name %></span>',
          '<span <% if (name) { %>class="address"<% } %>><%= address %><span class="actions"></span></span>',
        '</li>' ].join(''),
      action: [
        '<a href="#" class="action button small <%= className %>">',
          '<span><%= label %></span>',
        '</a>' ].join('')
    },
    labels: {
      seeMap: 'see map',
      select: 'select'
    },
    selectors: {
      item: '.js_suggestion'
    },
    actions: [
      { name: 'map', label: 'seeMap', className: '' },
      { name: 'select', label: 'select', className: 'blue' }
    ],
    classes: {
      active: 'active'
    },
    maxListItems: 10,
    onSelect: function(name, item) { console.log(name); console.log(item); }
  }, params);

  var elem, list, actionFlag = false,

  set = function(selection) {

    if (!elem) createElem();

    var child;

    // remove children of list
    while ( child = du.childObject( list, 0 ) ) {

        list.removeChild(child);

    }

    // insert each item of the selection and their actions, give them behavior

    for (var i=0; i<=Math.min(selection.length-1, params.maxListItems); i++) {
      list.appendChild(_createSelectionItem(i, selection[i]));
    }

    // first item is default
    if (selection.length) _selectDefault(0, selection[0]);


  },

  createElem = function() {

    if (!elem) {

      elem = document.createElement('div');

      elem.innerHTML = params.templates.main();

      list = du.el(elem, 'ul');

    }

    params.canvas.appendChild(elem);

  },

  removeElem = function() {

    var child;

    if (!elem) return;

    while (child = du.childObject(list, 0)) list.removeChild(child);

    if (elem.parentNode) elem.parentNode.removeChild(elem);

    elem = undefined;
    list = undefined;

  },

  _createSelectionItem = function(index, item) {

    var liCanvas = document.createElement('ul'), li;

    liCanvas.innerHTML = params.templates.item(item);

    li = du.el(liCanvas, 'li');

    du.forEach(params.actions, function(action) {

      li.appendChild(_createActionItem(item, action));

    });

    du.addEvent(li, 'click', function(e) {
      _selectDefault(index, item);
    });

    return li;

  },

  _createActionItem = function(item, action) {

    var actionCanvas = document.createElement('div');

    actionCanvas.innerHTML = params.templates.action(utils.extend({}, action, {label: params.labels[action.label]}));

    du.addEvent(actionCanvas.childNodes[0], 'click', function(e) {

      du.preventDefault(e);

      actionFlag = true;

      if (params.onSelect) params.onSelect(action.name, item);

    });

    return actionCanvas.childNodes[0];

  },

  _selectDefault = function(index, item) {

    if (!actionFlag) {
      if (params.onSelect) params.onSelect('defaultselect', item);
    }

    _highlightDomItem(index);

    actionFlag = false;

  },

  _highlightDomItem = function(index) {

    var li;

    for (var i = du.els(params.canvas, params.selectors.item).length - 1; i >= 0; i--) {

      li = du.els( params.canvas, params.selectors.item )[ i ];

      if ( i==index ) {

        du.addClass( li, params.classes.active );

        li.setAttribute( 'id', 'default-location' );

      } else {

        du.removeClass( li, params.classes.active );

        li.removeAttribute( 'id' );

      }

    };

  };

  return {
    create: createElem,
    remove: removeElem,
    set: set
  };

};