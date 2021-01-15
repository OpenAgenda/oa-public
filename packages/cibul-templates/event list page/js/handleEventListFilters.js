var handleEventListFilters = function(params) {

  params = extend({
    canvas: false, // where the filters fit
    template: '<label><i class="fa fa-filter"></i></label><span class="js_filter_fields"></span><button><i class="fa fa-refresh"></i></button>',
    className: 'list-filters cform',
    selectors: {
      fields: '.js_filter_fields',
      button: 'button'
    },
    labels: { 
      filters: 'filters',
      titleFilter: 'title',
      locationFilter: 'place name'
    },
    events: {
      load: 'load',
      loadSuccess: 'lhSuccess'
    }
  }, params);

  var elem, titleWidget, placeWidget, eh = sEventHandler.getInstance(),

  run = function() {

    _createElements();

    addEvent(el(elem, params.selectors.button), 'click', function(e) {
      
      preventDefault(e);

      _send();

    });

    eh.on(params.events.loadSuccess, function(data) {
      titleWidget.set(data.title?data.title:'');
      placeWidget.set(data.placename?data.placename:'');
    });

  },

  _createElements = function() {

    elem = document.createElement('div');

    elem.className = params.className;

    elem.innerHTML = new EJS({text: params.template}).render(params.labels);

    titleWidget = new inputWidgets.text({
      placeholder: params.labels.titleFilter,
      name: 'title',
      canvas: el(elem, params.selectors.fields),
      events: ['change', 'keyup']
    });

    placeWidget = new inputWidgets.text({
      placeholder: params.labels.locationFilter,
      name: 'placename',
      canvas: el(elem, params.selectors.fields),
      events: ['change', 'keyup'],
    });

    addEvent(elem, 'keyup', function(e) {
      if (e.keyCode==13) _send();
    });

    params.canvas.appendChild(elem);

  },

  _send = function() {

    if (!titleWidget || !placeWidget) return;

    eh.trigger(params.events.load, {title: titleWidget.get(), placename: placeWidget.get()});

  };

  run();

};