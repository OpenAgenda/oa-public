var handleDateSelection = function(params) {

  params = extend({
    canvas: false, // required
    onChange: false,
    onHeightChange: false,
    templates: {
      main: '<div class="js_add_dates js_add_dates_link js_clear_dates_link"></div><div class="js_date_list"></div>',
      addLink: '<i class="icon-plus"></i><span><%= addLabel %></span>',
      clearLink: '<span>&#215; </span><span><%= clearLabel %></span>',
    },
    selectors: {
      addDatesCanvas: '.js_add_dates',
      addDatesLinkCanvas: '.js_add_dates_link',
      clearDatesLinkCanvas: '.js_clear_dates_link',
      dateListCanvas: '.js_date_list'
    },
    labels: {
      addLabel: 'add dates',
      clearLabel: 'clear dates'
    },
    dates: [], // initial list of dates
    classes: {
      link: 'action',
      remove: 'remove-action'
    },
    lang: 'en'
  }, params);

  var dateAdd, datesList, addLink, clearLink, elem, dateFormDisplay = false,

  _run = function() {

    _createElem();

    if (params.dates.length) _displayClear();

    dateAdd = handleDatesAdd({
      labels: params.labels,
      canvas: el(elem, params.selectors.addDatesCanvas),
      onValidChange: _updatePreselection,
      onAdd: _addDates,
      lang: params.lang
    });

    datesList = handleDatesList({
      canvas: el(elem, params.selectors.dateListCanvas),
      lang: params.lang
    }).set(params.dates);

    datesList.setOnChange(function(newDates) {
      params.onChange(newDates);
      if (newDates.length) _displayClear();
    });

    datesList.create();

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

  _updatePreselection = function(newDates) {

    if (datesList.length) return;

    params.onChange(_parseNewDates(newDates));

  },

  /**
   * parses new dates selection, adds it to date selection, hides add menu
   */
  
  _addDates = function(newDates) {

    datesList.add(_parseNewDates(newDates));

    hideAdd();

  },


  /**
   * parses new dates selection to be included in current dates list
   */
  
  _parseNewDates = function(newDates) {

    var newDateList = [],

    dateCursor = newDates.dates.begin,

    milliSecondDay = 24*60*60*1000;

    while (dateCursor <= newDates.dates.end) {

      newDateList.push({
        date: dateCursor.getFullYear() + '-' + _fZ(dateCursor.getMonth() + 1) + '-' + _fZ(dateCursor.getDate()),
        begin: newDates.timings.begin,
        end: newDates.timings.end
      });

      dateCursor = new Date(dateCursor.getTime() + milliSecondDay);

    }

    return newDateList;

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

    addEvent(addLink, 'click', function(e) {

      preventDefault(e);

      showAdd();

    });

    el(elem, params.selectors.addDatesLinkCanvas).appendChild(addLink);

    if (params.onHeightChange) params.onHeightChange();

  },

  _displayClear = function() {

    if (isDef(clearLink)) return;

    clearLink = document.createElement('a');

    clearLink.setAttribute('href', '#');

    clearLink.className = params.classes.link + ' ' + params.classes.remove;

    clearLink.innerHTML = new EJS({ text: params.templates.clearLink }).render(params.labels);

    addEvent(clearLink, 'click', function(e) {
      
      preventDefault(e);

      datesList.set([]);

      showAdd();

      _removeClear();

    });

    el(elem, params.selectors.clearDatesLinkCanvas).appendChild( clearLink );

    if (params.onHeightChange) params.onHeightChange();

  },

  _removeClear = function() {

    if (!isDef(clearLink)) return;

    el(elem, params.selectors.clearDatesLinkCanvas).removeChild( clearLink );

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