var handlePlaceSelectionList = function(params) {

  params = extend({
    canvas: false, // required; 
    templates: {
      main: '<ul></ul>',
      item: '<li class="suggestion"><span class="name"><%= name %></span><span <% if (name) { %>class="address"<% } %>><%= address %><span class="actions"></span></span></li>',
      action: '<a href="#" class="action"><% if (icon) { %><i class="<%= icon %>"></i><% } %><% if (label) { %><span><%= label %></span><% } %></a>'
    },
    labels: {
      seeMap: 'see map',
      select: 'select'
    },
    actions: [
      { name: 'map', icon: 'icon-map-marker', label: 'seeMap' },
      { name: 'select', icon: 'icon-arrow-right', label: 'select' }
    ],
    maxListItems: 10,
    onSelect: function(name, item) { console.log(name); console.log(item); }
  }, params);

  var elem, list,

  set = function(selection) {

    if (!elem) createElem();

    var child;

    // remove children of list
    while (child = childObject(list, 0)) list.removeChild(child);

    // insert each item of the selection and their actions, give them behavior

    for (var i=0; i<=Math.min(selection.length-1, params.maxListItems); i++) {
      list.appendChild(_createSelectionItem(selection[i]));
    }


  },

  createElem = function() {

    if (!elem) {

      elem = document.createElement('div');

      elem.innerHTML = new EJS({text: params.templates.main }).render();

      list = el(elem, 'ul');

    }

    params.canvas.appendChild(elem);

  },

  removeElem = function() {

    if (!elem) return;

    while (child = childObject(list, 0)) list.removeChild(child);

    if (elem.parentNode) elem.parentNode.removeChild(elem);

    delete elem;
    delete list;

  },

  _createSelectionItem = function(item) {

    var liCanvas = document.createElement('ul'), li;

    liCanvas.innerHTML = new EJS({ text: params.templates.item }).render(item);

    li = el(liCanvas, 'li');

    forEach(params.actions, function(action) {

      li.appendChild(_createActionItem(item, action));

    });

    return li;

  },

  _createActionItem = function(item, action) {

    var actionCanvas = document.createElement('div');

    actionCanvas.innerHTML = new EJS({text: params.templates.action}).render(extend({}, action, {label: params.labels[action.label]}));

    addEvent(actionCanvas.childNodes[0], 'click', function(e) {

      preventDefault(e);

      if (params.onSelect) params.onSelect(action.name, item);

    });

    return actionCanvas.childNodes[0];

  };

  return {
    create: createElem,
    remove: removeElem,
    set: set
  };

};