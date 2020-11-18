var handlePlaceSelection = function(params) {

  params = extend({
    canvas: false,          // required. where the selection widget will go
    onSelect: false,        // required. called when a place has been chosen
    onDefaultSelect: false, // required. whenever a location selection can be deduced
    onHeightChange: false,
    templates: {
      main: '<ul class="place-suggestion-tabs js_suggestion_tabs"><li class="js_tab active"><a href="#"><i class="icon-list"></i></a></li><li class="js_tab"><a href="#"><i class="icon-map-marker"></i></a></li></ul><div class="js_suggestions place-suggestions"></div>',
      empty: '<span class="info empty-message"><%= empty %></span>',
      dragLink: '<a class="manual-link" href="#"><i class="icon-screenshot"></i><span><%= manualMark %></span></a>',
      dragTab: '<li class="js_tab"><a href="#"><i class="icon-screenshot"></i></a></li>'
    },
    selectors: {
      tabs: '.js_tab',
      tabsCanvas: '.js_suggestion_tabs',
      suggestions: '.js_suggestions'
    },
    classes: {
      active: 'active',
      main: 'place-selection',
      error: 'error'
    },
    labels: {
      empty: 'Type a name and an address to see the locations to choose from here.',
      manualMark: 'Can\'t find the right location? place the marker manually on a map'
    },
    map: {
      type: 'osm',
      init: { url: '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow' },
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png'
  }, params);


  var elem, emptyElem, errorElem, tabs, DRAG = 2, MAP = 1, LIST = 0, displayed = LIST, selection = [], view, dragLink,

  _init = function() {

    _createElem();

  },

  set = function(newSelection, options) {

    _removeErrorMessage();

    if (!elem) _createElem();

    selection = newSelection;

    _toggleEmptyMessage();

    if (!view)
      show(displayed);
    else
      if (selection.length) view.set(newSelection, options);

    if (selection.length && !dragLink && els(elem, params.selectors.tabs).length < 3) _createDragLink();

    if (params.onHeightChange) params.onHeightChange();

  },

  show = function(viewIndex, viewParams) {

    var renderView = [handlePlaceSelectionList, handlePlaceSelectionMap, handlePlaceMapDrag];

    _setActiveTab(viewIndex);

    if (view) {
      view.remove();
    }

    displayed = viewIndex;

    _toggleEmptyMessage();

    if (!selection.length) return;

    view = renderView[viewIndex]({
      canvas: el(elem, params.selectors.suggestions),
      onSelect: function(name, item) {

        // if name is 'map', view should be changed to map, showing the selected marker

        if (name=='map')
          show(MAP, { highlight: item });
        else if (name=='select')
          params.onSelect(item);
        else if (name=='defaultselect')
          params.onDefaultSelect(item);

      },
      map: params.map,
      icon: params.icon,
      labels: params.labels
    });

    view.set(selection, viewParams);

  },

  _createElem = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.templates.main }).render(params.labels);

    elem.className = params.classes.main;

    _addTabsBehavior();

    show(displayed);

    params.canvas.appendChild(elem);

  },

  _createDragLink = function() {

    dragLink = document.createElement('div');
    dragLink.innerHTML = new EJS({text: params.templates.dragLink }).render(params.labels);
    dragLink = dragLink.childNodes[0];

    addEvent(dragLink, 'click', function(e) {

      preventDefault(e);

      _displayDragTab();

      dragLink.parentNode.removeChild(dragLink);

      show(DRAG);

    });

    elem.appendChild(dragLink);

  },

  _addTabsBehavior = function() {

    forEach(els(elem, params.selectors.tabs), function(tab) {

      _addTabBehavior(tab);

    });

  },

  _addTabBehavior = function(tab) {

    addEvent(tab, 'click', function(e) {
      preventDefault(e);
      show(getChildIndex(tab));
    });

  },

  _setActiveTab = function(index) {

    var tabs = els(elem, params.selectors.tabs);

    for (var i = tabs.length - 1; i >= 0; i--) {
      if (i==index)
        addClass(tabs[i], params.classes.active);
      else
        removeClass(tabs[i], params.classes.active);
    };

  },

  _removeElem = function() {

    if (view) {
      view.remove();
      delete view;
    }

    if (elem) {
      while (child = childObject(elem, 0)) elem.removeChild(child);
      elem.parentNode.removeChild(elem);
    };

    delete elem;

    selection = [];

  },

  _toggleEmptyMessage = function() {

    if (!selection.length)
      _showEmptyMessage();
    else
      _removeEmptyMessage();

  },

  _showEmptyMessage = function() {

    if (emptyElem) return;

    emptyElem = document.createElement('div');
    emptyElem.innerHTML = new EJS({text: params.templates.empty }).render(params.labels);

    el(elem, params.selectors.suggestions).appendChild(emptyElem);

  },

  _removeEmptyMessage = function() {

    if (emptyElem) el(elem, params.selectors.suggestions).removeChild(emptyElem);

    emptyElem = null;

  },

  _displayErrorMessage = function(message) {

    if (!errorElem) {
      errorElem = document.createElement('span');
      errorElem.className = params.classes.error;
      elem.appendChild(errorElem);
    }

    errorElem.innerHTML = message;

  },

  _removeErrorMessage = function() {
    if (errorElem) {
      errorElem.parentNode.removeChild(errorElem);
      errorElem = false;
    }
  },

  _displayDragTab = function() {

    var canvas = document.createElement('ul');
    canvas.innerHTML = params.templates.dragTab;

    var tab = el(canvas, 'li');

    el(elem, params.selectors.tabsCanvas).appendChild(tab);

    _addTabBehavior(tab);

  };

  _init();

  return {
    create: _createElem,
    remove: _removeElem,
    displayError: _displayErrorMessage,
    set: set
  }

}
