var addHeadFilterBehavior = function(params) {

  var disabled = false, currentFilters = {}, eh = sEventHandler.getInstance(), existingParamNames;

  params = extend({
    canvas: false,
    triggeredEvents: { filterClear: 'clear' },
    triggerEvents: { loading: 'loading', loadSuccess: 'success', loadFail: 'fail' },
    classes: {
      disabled: 'disabled',
      displayNone: 'display-none'
    },
    selectors: {
      remove: '.js_remove_filter'
    },
    locations: false,
    categories: [],
    tags: [], // [{slug: tag slug, label: tag label}]
    template: '<span class="pfilter"><span><%= label %></span><button class="js_remove_filter">&times;</button></span>',
    filterTypes: {
      location: { icon: 'icon-map-marker', params: ['location'] },
      category: { icon: 'icon-bookmark', params: ['category'] },
      date: { icon: 'icon-calendar', params: ['from', 'to'] },
      tags: { icon: 'icon-tags', params: ['tags'] },
      map: { icon: 'icon-map-marker', params: ['neLat', 'neLng', 'swLat', 'swLng'], label: 'mapFilter' },
      orgLabel: { icon: 'icon-sitemap', params: ['orgLabel', 'org'] },
      what: { icon: 'icon-sitemap', params: [ 'what' ] }
    },
    labels: {
      mapFilter: 'within map boundaries'
    }
  }, params);

  var run = function() {

    // define list of possible filter values from filter types array
    _buildFilterParamNames();

    eh.on(params.triggerEvents.loading, _disable);

    eh.on(params.triggerEvents.loadFail, _enable);

    eh.on(params.triggerEvents.loadSuccess, function(newParams){

      _enable();

      var newValues = _parseParams(newParams);

      for (var index in currentFilters)  _clearFilter(index);

      for (index in newValues) _addFilter(index, newValues[index]);

      Object.size(newValues)?_display():_hide();
  
    });

  },

  /**
   * pick out filter values and parse them into a usable format
   */

  _parseParams = function(reqParams) {

    var newValues = {};

    for (var rIndex in reqParams) if (contains(existingParamNames, rIndex)) for (var tIndex in params.filterTypes) {

      if (contains(params.filterTypes[tIndex].params, rIndex)) {

        if (!newValues[tIndex]) newValues[tIndex] = {};

        newValues[tIndex][rIndex] = reqParams[rIndex];

        break;
          
      }

    }

    return newValues;

  },

  _buildFilterParamNames = function() {

    existingParamNames = [];

    for (var fIndex in params.filterTypes) {
      forEach(params.filterTypes[fIndex].params, function(param) {
        if (!contains(existingParamNames, param)) existingParamNames.push(param);
      });
    }

  },

  _clearFilter = function(index) {

    currentFilters[index].elem.parentNode.removeChild(currentFilters[index].elem);

    delete currentFilters[index];

  },

  _addFilter = function(index, filterValues) {

    var elem = document.createElement('div'),
    
    label = filterValues[index];

    if (index=='date') {

      label = filterValues.to?filterValues.from + ' &rarr; ' + filterValues.to:filterValues.from;

    } else if (index=='map') {

      label = params.labels[params.filterTypes.map.label];

    } else if (index=='category') {

      forEach(params.categories, function(category) {
        if (category.s==filterValues.category) label = category.c;
      });

    } else if (index=='tags') {

      if ((typeof filterValues.tags == 'string') && (filterValues.tags.indexOf(',') !== -1)) {
        filterValues.tags = filterValues.tags.split(',');
      } else if (typeof filterValues.tags == 'string') {
        filterValues.tags = [filterValues.tags];
      }

      label = [];

      forEach(params.tags, function(tag) {
        if (contains(filterValues.tags, tag.s)) label.push(tag.t);
      });

      label = label.join(', ');

    } else if (index=='location') {

      if (params.locations[filterValues.location]) label = params.locations[filterValues.location].placename;

    }

    elem.innerHTML = new EJS({text: params.template }).render({icon: params.filterTypes[index].icon, label: label });

    addEvent(el(elem, params.selectors.remove), 'click', function(e) {

      preventDefault(e);

      if (disabled) return;

      _disable();

      var cleared = {};

      forEach(params.filterTypes[index].params, function(paramName) {
        cleared[paramName] = null;
      });

      eh.trigger(params.triggeredEvents.filterClear, cleared);

    });

    currentFilters[index] = {
      elem: elem.childNodes[0]
    };

    params.canvas.appendChild(elem.childNodes[0]);

  },

  _disable = function() {
    disabled = true;
    addClass(params.canvas, params.classes.disabled);
  },

  _enable = function() {
    disabled = false;
    removeClass(params.canvas, params.classes.disabled);
  },

  _display = function() {
    _enable();
    removeClass(params.canvas, params.classes.displayNone);
  },

  _hide = function() {
    _disable();
    addClass(params.canvas, params.classes.displayNone);
  };

  run();
  
};