"use strict";

var utils = require( '@openagenda/utils' ),

du = require( '../../../js/lib/domUtils' );

require( '../../../js/lib/verboseDate/verboseDate' );

module.exports = function(params) {

  params = utils.extend({
    canvas: false,
    onChange: false, // callback called when the internal date selection was changed
    templates: {
      main: '<ul></ul>',
      dateItem: '<li class="date"><span><%= date.verboseDate(lang) %></span><ul></ul></li>',
      timingItem: '<li class="timing"><span><%= begin %></span>&#8594;<span><%= end %></span><a href="#" class="js_remove">&#215;</a></li>'
    },
    selectors: {
      remove: '.js_remove'
    },
    lang: 'en'
  }, params);

  var elem, listElem, selection,

  create = function() {

    elem = document.createElement('div');

    elem.innerHTML = params.templates.main();

    listElem = du.el(elem, 'ul');

    if (selection) _renderSelection(selection);

    params.canvas.appendChild(elem);

    return this;

  },

  remove = function() {

  },

  set = function(newSelection, muteCallback) {

    selection = _convert(newSelection);

    if (elem) _renderSelection();

    // I also need to insert new dates to the structure

    if (params.onChange && !muteCallback) params.onChange(_revert(selection));

    return this;
  },

  add = function(newItems, muteCallback) {

    var selectionList = _revert(selection);

    du.forEach(newItems, function(newItem) {
      selectionList.push(newItem);
    });

    selection = _convert(selectionList);

    if (elem) _renderSelection();

    if (params.onChange && !muteCallback) params.onChange(_revert(selection));

    return this;

  },

  setOnChange = function(onChange) {

    params.onChange = onChange;

  },

  _convert = function(listSelection) {

    // in comes a list like this ({date: 'yyyy-mm-dd', begin: 'hh:mm', end: 'hh:mm', (uid: xxx)})
    // out goes an ordered list like this: ({'yyyy-mm-dd': [{begin: 'hh:mm', end: 'hh:mm', (uid: xxx)}, ... ]})

    var dates = [], unorderedSelection = {}, orderedSelection = {};

    du.forEach( listSelection, function( listItem ) {

      if ( dates.indexOf( listItem.date ) == -1 ) {

        dates.push(listItem.date);

      }

      if (typeof unorderedSelection[listItem.date] == 'undefined') unorderedSelection[listItem.date] = [];

      var timings = {begin: listItem.begin, end: listItem.end };

      if (listItem.id) timings.id = listItem.id;

      unorderedSelection[listItem.date].push(timings);

    });

    dates.sort();

    var oSelection = {};

    du.forEach(dates, function(date) {

      var dateItem = unorderedSelection[date],

      beginTimes = [], timings = {}, orderedTimings = [];

      du.forEach(dateItem, function(timing) {

        if ( beginTimes.indexOf( timing.begin ) == -1 ) {

          beginTimes.push(timing.begin);

        }

        if ( typeof timings[timing.begin] == 'undefined' ) {

          timings[timing.begin] = [];

        }

        timings[timing.begin].push(timing);

      });

      beginTimes.sort();

      du.forEach(beginTimes, function(beginTime) {
        du.forEach(timings[beginTime], function(timing) {

          orderedTimings.push(timing);

        });
      });

      if (typeof oSelection[date] == 'string') oSelection[date] = [];

      oSelection[date] = orderedTimings;

    });

    var orderedList = [];

    for ( var d in oSelection) {

      orderedList.push({
        date: d,
        timings: oSelection[ d ]
      });

    }

    return orderedList;

  },

  _revert = function(orderedList) {

    // in goes an ordered list like this: ({'yyyy-mm-dd': [{begin: 'hh:mm', end: 'hh:mm', (uid: xxx)}, ... ]})
    // out comes a list like this ({date: 'yyyy-mm-dd', begin: 'hh:mm', end: 'hh:mm', (uid: xxx)})

    var listSelection = [];

    du.forEach(orderedList, function(orderedListItem) {

      du.forEach(orderedListItem.timings, function(timingItem) {

        var listItem = { date: orderedListItem.date, begin: timingItem.begin, end: timingItem.end };

        if (timingItem.id) listItem.id = timingItem.id;

        listSelection.push(listItem);

      });

    });

    return listSelection;

  },

  _renderSelection = function() {

    _clear();

    for (var dateIndex in selection) {

      var dateElem = document.createElement('div');

      dateElem.innerHTML = params.templates.dateItem(utils.extend({lang: params.lang}, selection[dateIndex]));

      dateElem = dateElem.childNodes[0];

      for (var timingIndex in selection[dateIndex].timings) {

        var timing = selection[dateIndex].timings[timingIndex],

        timingElem = document.createElement('div');

        timingElem.innerHTML = params.templates.timingItem(timing);

        timingElem = timingElem.childNodes[0];

        (function(dateIndex, timingIndex) {

          du.addEvent(du.el(timingElem, params.selectors.remove), 'click', function(e) {

            du.preventDefault(e);

            _removeTiming(dateIndex, timingIndex);

          });

        })(dateIndex, timingIndex);

        du.el(dateElem, 'ul').appendChild(timingElem);

      }

      listElem.appendChild(dateElem);

    }

  },

  _removeTiming = function(dateIndex, timingIndex) {

    selection[dateIndex].timings.splice(timingIndex,1);

    if (!selection[dateIndex].timings.length) {

      selection.splice(dateIndex, 1);

    };

    _renderSelection();

    if (params.onChange) params.onChange(_revert(selection));

  },

  _clear = function() {

    var child;

    while (child = du.childObject(listElem, 0)) listElem.removeChild(child);

  };

  return {
    create: create,
    remove: remove,
    set: set,
    add: add,
    setOnChange: setOnChange
  }

}