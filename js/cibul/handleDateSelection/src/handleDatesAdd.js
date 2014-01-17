var handleDatesAdd = function(params) {

  params = extend({
    canvas: false,
    onAdd: false,
    templates: {
      main: '<p><%= addTitle %></p><div class="info"><%= addInfo %></div><div class="js_dates date-select"></div><div class="timing-select"><div class="js_timings input-fields"></div><button><%= addDate %></button><div class="error js_error"></div></div>'
    },
    selectors: {
      dates: '.js_dates',
      timings: '.js_timings',
      error: '.js_error',
      add: 'button'
    },
    labels: {
      timingInfo: 'hh:mm',
      timingGeneralError: 'timings have to be specified',
      timingError: 'time is not valid (example of valid time: 14:21)',
      dateError: 'no dates are selected',
      addTitle: 'Add dates',
      addDate: 'Add',
      addInfo: 'select a range of dates by drag and drop on the calendar, then type in the timings.',
      begin: 'start time',
      end: 'end time'
    },
    lang: 'en',
    classes: {
      main: 'add-dates embed-menu selectable',
      disabled: 'disabled'
    }
  }, params);

  var elem, timings, dates, addEnabled,

  widgets = {},

  create = function() {

    timings = { begin: false, end: false };

    dates = { begin: false, end: false };

    addEnabled = false;

    elem = document.createElement('div');
    elem.innerHTML = new EJS({text: params.templates.main }).render(params.labels);
    elem.className = params.classes.main;

    // setup time widgets

    widgets.timeBegin = new inputWidgets.text({
      name: 'begin',
      placeholder: params.labels.begin,
      label: params.labels.begin,
      canvas: el(elem, params.selectors.timings),
      info: params.labels.timingInfo,
      events: ['keyup', 'change'],
      onUpdate: function(begin) {
        timings.begin = begin;
        _enableButton(_validateSelection());
      },
      onValidChange: function(err) {

        if (err) timings.begin = false;
        _enableButton(_validateSelection());

      },
      validator: inputValidators.isTime(params.labels.timingError)
    });

    widgets.timeEnd = new inputWidgets.text({
      name: 'end',
      placeholder: params.labels.end,
      label: params.labels.end,
      canvas: el(elem, params.selectors.timings),
      info: params.labels.timingInfo,
      events: ['keyup', 'change'],
      onUpdate: function(end) {
        timings.end = end;
        _enableButton(_validateSelection());
      },
      onValidChange: function(err) {

        if (err) timings.end = false;
        _enableButton(_validateSelection());

      },
      validator: inputValidators.isTime(params.labels.timingError)
    });


    // calendar widget

    widgets.calendar = new CibulCalendar(el(elem, params.selectors.dates), {
      lang: params.lang,
      onSelect: function(selected) {

        dates = selected;
        el(elem, params.selectors.error).innerHTML = '';
        _enableButton(_validateSelection());


      }
    });

    _enableButton(false);

    params.canvas.appendChild(elem);

    addEvent(el(elem, params.selectors.add), 'click', function() {

      var validTimings = widgets.timeEnd.validate();

      validTimings = widgets.timeBegin.validate() && validTimings;

      // if there are no selected dates, 

      if (!dates.begin)
        el(elem, params.selectors.error).innerHTML = params.labels.dateError;
      else if (!validTimings)
        el(elem, params.selectors.error).innerHTML = params.labels.timingGeneralError;

      if (addEnabled) params.onAdd({
        dates: dates,
        timings: timings
      });

    });

    return this;

  },

  remove = function() {

    for (var wIndex in widgets) {
      delete widgets[wIndex];
    }

    if (elem) params.canvas.removeChild(elem);

  },

  _validateSelection = function() {

    var valid = true;

    forEach([dates, timings], function(set) {
      forEach(['begin', 'end'], function(item) {
        if (!set[item]) valid = false;
      });
    });

    return valid;

  },

  _enableButton = function(enable) {

    addEnabled = enable;

    if (enable)
      removeClass(el(elem, 'button'), params.classes.disabled);
    else
      addClass(el(elem, 'button'), params.classes.disabled);

    return enable;

  };

  return {
    create: create,
    remove: remove
  }

};