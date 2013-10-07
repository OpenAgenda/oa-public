var addHeadFilterBehavior = function(elem, eventHandler, params) {

  var disabled = false,
  
  , labelElem = el('.js_label')

  , currentFilters = {};

  params = extend({
    canvas: false,
    triggeredEvents: {filterClear: 'clear'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail'},
    classes: {
      disabled: 'disabled',
      displayNone: 'display-none'
    },
    selectors: {
      remove: '.js_remove_filter'
    }
    locations: false,
    template: '<span class="pfilter"><i class="<%= iconClass %>"></i><span><%= label %></span><i class="icon-remove js_remove_filter"></i></span>',
    filterTypes: {
      location: { icon: 'icon-map-marker', params: ['location'] },
      category: { icon: 'icon-bookmark', params: ['category'] },
      date: { icon: 'icon-calendar', params: ['from', 'to'] },
      tags: { icon: 'icon-tags', params: ['tags'] }
    }
  }, params);

  eventHandler.on(params.triggerEvents.loading, function(){

    _disable();

  });

  eventHandler.on(params.triggerEvents.loadFail, function(){

    _enable();

  });

  eventHandler.on(params.triggerEvents.loadSuccess, function(newParams){

    var newValues = __parseParams(newParams):

    // clear filter items which no longer apply

    for (index in currentFilters)
      if (!newValues[index]) _clearFilter(index);

    for (index in newValues)
      if (!currentFilters[index]) _addFilter(index, newValues[index]);

  });

  

  var _parseParams = function(reqParams) {

    var newValues = {};

    forEach(['location', 'category', 'from', 'to', 'tag'], function(paramName) {

      for (var index in params.filterTypes) {
        if (contains(params.filterTypes[index].params, paramName)) {
          if (!newValues[index]) newValues[index] = {};
          newValues[index][paramName] = reqParams[paramName];
          break;
        }
      }
        
    });

    return newValues;

  },

  _clearFilter = function(index) {

    currentFilters[index].elem.parentNode.removeChild(currentFilters[index].elem);

    delete currentFilters[index];

  },

  _addFilter = function(index, filterValues) {

    var elem = document.createElement('div');

    if (index=='date') {
      var label = filterValues.to?filterValues.from + ' -> ' + filterValues.to:filterValues.from;
    } else {
      var label = filterValues[index];
    }

    elem.innerHTML = new EJS({text: params.template }).render({icon: params.filterTypes[index].icon, label: label });

    addEvent(el(elem, params.selectors.remove), 'click', function(e) {

      preventDefault(e);

      if (disabled) return;

      var cleared = {};

      forEach(params.filterTypes[index].params, function(paramName) {
        cleared[paramName] = null;
      });

      eventHandle.trigger(params.triggerEvents.filterClear, cleared);

    });

    currentFilters[index] = {
      elem: elem
    };

    params.canvas.appendChild(elem);

  },

  _disable = function() {
    disabled = true;
    addClass(elem, params.disabledClassName);
  },
  _enable = function() {
    disabled = false;
    removeClass(elem, params.disabledClassName);
  },
  _display = function() {
    _enable();
    removeClass(elem, params.displayNoneClassName);
  },
  _hide = function() {
    _disable();
    addClass(elem, params.displayNoneClassName);
  };
  
};