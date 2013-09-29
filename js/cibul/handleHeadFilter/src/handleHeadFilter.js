var addHeadFilterBehavior = function(elem, eventHandler, params) {

  var disabled = false,
    labelElem = getElementsByClassName(elem, 'js_label')[0];

  params = extend({
    triggeredEvents: {filterClear: 'clear'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail'},
    disabledClassName: 'disabled',
    displayNoneClassName: 'display-none',
    locations: false
  }, params);

  eventHandler.on(params.triggerEvents.loading, function(){

    _disable();

  });

  eventHandler.on(params.triggerEvents.loadFail, function(){

    _enable();

  });

  eventHandler.on(params.triggerEvents.loadSuccess, function(newParams){

    // which filter is on?

    var show = true;

    if (newParams.location) {

      var name = params.locations?params.locations[newParams.location].placename:newParams.location;

      // need the location name, not the location slug

      labelElem.innerHTML = ['<i class="icon-map-marker"></i><span>', name , '</span>'].join('');

    } else if (newParams.category) {

      labelElem.innerHTML = ['<i class="icon-bookmark"></i><span>', newParams.category , '</span>'].join('');

    } else if (newParams.from) {

      var label = newParams.from + (newParams.to?' - ' + newParams.to:'');

      labelElem.innerHTML = ['<i class="icon-calendar"></i><span>', label , '</span>'].join('');

    } else if (newParams.tag) {

      labelElem.innerHTML = ['<i class="icon-tags"></i><span>', newParams.tag , '</span>'].join('');

    } else {

      show = false;

    };

    if (show) {
      _display();
    } else {
      _hide();
    }

  });

  // cross click behavior

  addEvent(getElementsByClassName(elem, 'js_remove')[0], 'click', function(){

    if (disabled) return;

    eventHandler.trigger(params.triggeredEvents.filterClear, {
      from: null,
      to: null,
      location: null,
      category: null,
      tag: null
    });

  });

  var _disable = function() {
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