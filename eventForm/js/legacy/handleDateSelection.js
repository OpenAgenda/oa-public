"use strict";

var utils = require( 'utils' ),

du = require( '../../../js/lib/domUtils' ),

EJS = require( '../../../js/lib/clientEjs/ejs' ),

handleDatesAdd = require( './handleDatesAdd' ),

handleDatesList = require( './handleDatesList' );

module.exports = function(params) {

  params = utils.extend({
    canvas: false, // required
    onChange: false,
    onHeightChange: false,
    templates: {
      main: '<div class="js_date_list date-list"></div><div class="date-actions js_add_dates js_add_dates_link js_clear_dates_link"></div>',
      addLink: '<button class="blue button date-action small"><i class="fa fa-plus"></i><span><%= addLabel %></span></button>',
      clearLink: '<button class="red button date-action small"><span>&#215; </span><span><%= clearLabel %></span></button>',
    },
    selectors: {
      addDatesCanvas: '.js_add_dates',
      addDatesLinkCanvas: '.js_add_dates_link',
      clearDatesLinkCanvas: '.js_clear_dates_link',
      dateListCanvas: '.js_date_list'
    },
    labels: {
      addLabel: 'add dates',
      clearLabel: 'clear all dates'
    },
    timings: [], // initial list of timings
    classes: {
      link: 'action',
      remove: 'remove-action'
    },
    lang: 'en'
  }, params);

  var dateAdd, timingsList, addLink, clearLink, elem, dateFormDisplay = false,

  _run = function() {

    _createElem();

    if ( params.timings.length ) _displayClear();

    dateAdd = handleDatesAdd({
      labels: params.labels,
      canvas: du.el(elem, params.selectors.addDatesCanvas),
      onValidChange: _updatePreselection,
      onAdd: _addDates,
      lang: params.lang
    });

    timingsList = handleDatesList({
      canvas: du.el(elem, params.selectors.dateListCanvas),
      lang: params.lang
    }).set(params.timings);

    timingsList.setOnChange(function(newDates) {

      params.onChange(newDates);
      if (newDates.length) _displayClear();

    });

    timingsList.create();

  },

  showAdd = function() {

    if ( dateFormDisplay ) {

      return;

    }

    _hideAddLink();

    dateAdd.create();

    dateFormDisplay = true;

    if (params.onHeightChange) params.onHeightChange();

  },

  hideAdd = function() {

    dateAdd.remove();

    dateFormDisplay = false;

    _showAddLink();

    if (params.onHeightChange) params.onHeightChange();

  },

  /**
   * when there are no confirmed selections, preselected dates are sent back
   */

  _updatePreselection = function( newTimings ) {

    if (timingsList.length) return;

    params.onChange(_parseNewTimings( newTimings ));

  },

  /**
   * parses new dates selection, adds it to date selection, hides add menu
   */
  
  _addDates = function( newTimings ) {

    timingsList.add(_parseNewTimings( newTimings ));

    hideAdd();

  },


  /**
   * parses new dates selection to be included in current dates list
   */
  
  _parseNewTimings = function(newDates) {

    var newTimings = [],

    dateCursor = newDates.dates.begin,

    milliSecondDay = 24*60*60*1000;

    while (dateCursor <= newDates.dates.end) {

      newTimings.push({
        date: dateCursor.getFullYear() + '-' + _fZ(dateCursor.getMonth() + 1) + '-' + _fZ(dateCursor.getDate()),
        begin: newDates.timings.begin,
        end: newDates.timings.end
      });

      dateCursor = new Date(dateCursor.getTime() + milliSecondDay);

    }

    return newTimings;

  },


  _fZ = function(n) {
    return (n>9?'':'0') + n;
  },

  _createElem = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.templates.main }).render();

    params.canvas.appendChild(elem);


    // add dates link

    addLink = document.createElement('a');

    addLink.setAttribute('href', '#');

    addLink.className = params.classes.link;

    addLink.innerHTML = new EJS({text: params.templates.addLink }).render(params.labels);

    du.addEvent(addLink, 'click', function(e) {

      du.preventDefault( e );

      showAdd();

    });

    du.el(elem, params.selectors.addDatesLinkCanvas).appendChild(addLink);

    if (params.onHeightChange) params.onHeightChange();

  },

  _displayClear = function() {

    if ( typeof clearLink !== 'undefined' ) return;

    clearLink = document.createElement('a');

    clearLink.setAttribute('href', '#');

    clearLink.className = params.classes.link + ' ' + params.classes.remove;

    clearLink.innerHTML = new EJS({ text: params.templates.clearLink }).render(params.labels);

    du.addEvent(clearLink, 'click', function(e) {
      
      du.preventDefault( e );

      timingsList.set([]);

      showAdd();

      _removeClear();

    });

    du.el(elem, params.selectors.clearDatesLinkCanvas).appendChild( clearLink );

    if (params.onHeightChange) params.onHeightChange();

  },

  _removeClear = function() {

    if ( typeof clearLink !== 'undefined' ) return;

    du.el(elem, params.selectors.clearDatesLinkCanvas).removeChild( clearLink );

    if (params.onHeightChange) params.onHeightChange();

    clearLink = undefined;

  },

  _hideAddLink = function() {

    addLink.style.display = 'none';

  },

  _showAddLink = function() {

    addLink.style.display = 'inline-block';

  };

  _run();

  return {
    showAdd: showAdd
  }

};