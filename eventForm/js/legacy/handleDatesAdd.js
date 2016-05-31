"use strict";

var utils = require( 'utils' ),

du = require( '../../../js/lib/domUtils' ),

inputWidgets = require( '../../../js/lib/inputWidgets/inputWidgets' ),

inputValidators = require( '../../../js/lib/inputWidgets/inputValidators' ),

cLib = require( '../../../js/vendors/CibulCalendar/src/CibulCalendar' );

module.exports = function(params) {

  params = utils.extend({
    canvas: false,
    onAdd: false,
    onValidChange: false,
    templates: {
      main: [
        '<p><%= addTitle %></p>',
        '<div class="info"><%= addInfo %></div>',
        '<div class="js_dates date-select"></div>',
        '<div class="timing-select cform">',
          '<div class="timing-inputs">',
            '<div class="js_timings"></div>',
            '<button class="blue button"><%= addDate %></button>',
            '<div class="error js_error"></div>',
          '</div>',
        '</div>' ].join('')
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
    elem.innerHTML = params.templates.main( params.labels );
    elem.className = params.classes.main;

    // setup time widgets

    widgets.timeBegin = new inputWidgets.text({
      name: 'begin',
      placeholder: params.labels.begin,
      label: params.labels.begin + ' (*)',
      canvas: du.el(elem, params.selectors.timings),
      info: params.labels.timingInfo,
      events: ['keyup', 'change'],
      onUpdate: function(begin) {
        timings.begin = begin;
        
        _evaluateSelection();

      },
      onValidChange: function(err) {

        if (err) timings.begin = false;
        
        _evaluateSelection();

      },
      validator: inputValidators.isTime(params.labels.timingError)
    });

    widgets.timeEnd = new inputWidgets.text({
      name: 'end',
      placeholder: params.labels.end,
      label: params.labels.end + ' (*)',
      canvas: du.el(elem, params.selectors.timings),
      info: params.labels.timingInfo,
      events: ['keyup', 'change'],
      onUpdate: function(end) {
        
        timings.end = end;

        _evaluateSelection();

      },
      onValidChange: function(err) {

        if (err) timings.end = false;

        _evaluateSelection();

      },
      validator: inputValidators.isTime(params.labels.timingError)
    });


    // calendar widget

    widgets.calendar = new cLib.CibulCalendar(du.el(elem, params.selectors.dates), {
      lang: params.lang,
      onSelect: function(selected) {

        dates = selected;
        du.el(elem, params.selectors.error).innerHTML = '';
        
        _evaluateSelection();
        
      }
    });

    _enableButton(false);

    params.canvas.appendChild(elem);

    du.addEvent(du.el(elem, params.selectors.add), 'click', function() {

      var validTimings = widgets.timeEnd.validate();

      validTimings = widgets.timeBegin.validate() && validTimings;
      
      // display errors

      if (!dates.begin)
        du.el(elem, params.selectors.error).innerHTML = params.labels.dateError;
      else if (!validTimings)
        du.el(elem, params.selectors.error).innerHTML = params.labels.timingGeneralError;


      // if button is enable, callback

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

  _evaluateSelection = function() {

    var valid = _validateSelection();

    _enableButton(valid);

    if (valid && params.onValidChange) params.onValidChange({
      dates: dates,
      timings: timings
    });

  },

  _validateSelection = function() {

    var valid = true;

    du.forEach([dates, timings], function( set ) {

      du.forEach(['begin', 'end'], function( item ) {

        if (!set[item]) valid = false;

      });

    });

    return valid;

  },

  _enableButton = function(enable) {

    addEnabled = enable;

    if (enable)
      du.removeClass(du.el(elem, 'button'), params.classes.disabled);
    else
      du.addClass(du.el(elem, 'button'), params.classes.disabled);

    return enable;

  };

  return {
    create: create,
    remove: remove
  }

};