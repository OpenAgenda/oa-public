var handleEventDates = function(controlData, options) {
  
  var dates,
  months,
  monthCount,
  eh = sEventHandler.getInstance(),
  options = extend({
    monthActiveClass: 'active',
    culture: 'en',
    events: { triggered: {}, trigger: {}}
  }, options);
    
    options.events = {
      triggered: extend({ selectLocation: 'eventdateplaceselect', layoutChange: 'layoutchange' }, options.events.triggered),
      trigger: extend({ selectCancel: 'eventmapplaceunselect', selectLocation: 'eventexternalplaceselect' }, options.events.trigger)
    };

  var run = function() {

    dates = _extractDates(controlData);

    if (dates.length == 0) return _removeDateSection();

    var locationCount = _countLocations(controlData),
      
    applyDateBehavior = function(dateElem, date) {

      addEvent(dateElem, 'click', function(e){

        preventDefault(e);

        selectLocation(date.locationId);

        eh.trigger(options.events.triggered.selectLocation, date.locationId);

        eh.trigger(options.events.triggered.layoutChange);

      });

    },

    applyMonthBehavior = function(monthElem, month) {

      addEvent(monthElem, 'click', function(e) {

        preventDefault(e);

        _displayMonthLayout(dates, locationCount, applyDateBehavior, applyMonthBehavior, month.id);

        eh.trigger(options.events.triggered.layoutChange);

      });

    },

    display = function() {

      if (!options.dateElem) return;
      
      if (monthCount>1)
        _displayMonthLayout(dates, locationCount, applyDateBehavior, applyMonthBehavior);
      else {
        _displayDates(dates, locationCount, applyDateBehavior);
        if (options.monthElem.parentNode) options.monthElem.parentNode.removeChild(options.monthElem);
      }
        
      eh.trigger(options.events.triggered.layoutChange);
    },

    selectLocation = function(locationId) {

      _highlightByLocation(dates, locationId);

      _showFilterLink();

      display();

    };

    eh.on(options.events.trigger.selectCancel, function(){

      _hideFilterLink();

      _highlightByLocation(dates, false);

      display();

    });

    eh.on(options.events.trigger.selectLocation, function(location) {

      selectLocation(location.id);

    });

    addEvent(options.filterElem, 'click', function(e){

      preventDefault(e);

      eh.trigger(options.events.trigger.selectCancel);

    });

    
    display();

  },
  _removeDateSection = function() {
    if (options.dateElem) options.dateElem.parentNode.parentNode.removeChild(options.dateElem.parentNode);
  },
  _extractDates = function(controlData) {

    var sortKeys = []
      , aDates = {} // associative array of dates, keys being: locId-date
      , dates = []
      , months = [];

    for (locationId in controlData.l)
      forEach(controlData.l[locationId].o, function(o) {
        
        var key = o.d + locationId;

        if (!contains(months, o.d.substr(0,7))) months.push(o.d.substr(0,7));
        
        if (!aDates[key]) {
          
          sortKeys.push(key);
          
          aDates[key] = { locationId: locationId, placename: controlData.l[locationId].p, date: o.d, timings: [], highlighted: true };

        }

        aDates[key].timings.push([o.s,o.e].join(','));

      });

    sortKeys.sort();

    monthCount = months.length;

    forEach(sortKeys, function(key){

      aDates[key].timings.sort();

      var timings = [];

      forEach(aDates[key].timings, function(timing) {
        timings.push({start: timing.substring(0, timing.indexOf(',')), finish: timing.substring(timing.indexOf(',') + 1)});
      });

      aDates[key].timings = timings;

      dates.push(aDates[key]);

    });

    return dates;

  },
  _countLocations = function(controlData) {
    return Object.size(controlData.l);
  },
  _displayDates = function(dates, locationCount, behaviorCallback) {

    options.dateElem.innerHTML = '';

    var ejs = new EJS({ text: options.templates.date });

    if (locationCount < 2) behaviorCallback = undefined;

    forEach(dates, function(date) {
      _renderItem(extend({culture: options.culture, locationCount: locationCount}, date), ejs, options.dateElem, behaviorCallback);
    });

  },
  _displayMonths = function(monthBehavior) {

    options.monthElem.innerHTML = '';

    var ejs = new EJS({ text: options.templates.month })
      , activeMonthIndex = 0;

    for (var i=0; i<months.length; i++) {
      _renderItem(months[i], ejs, options.monthElem, monthBehavior);
      if (months[i].active) activeMonthIndex = i;
    }

    new lineNav(options.monthElem, {offset: activeMonthIndex, nav: {previous: '<i class="icon-chevron-left"></i>', next: '<i class="icon-chevron-right"></i>'}});

  },
  _updateMonthElem = function(increment, monthData) {

    // because there is the nav widget, there are extra layers
    var canvas = options.monthElem.childNodes[1].childNodes[0];

    if (monthData.active) {
      addClass(canvas.childNodes[increment], options.monthActiveClass);
    } else {
      removeClass(canvas.childNodes[increment], options.monthActiveClass);
    }

  },
  _renderItem = function(item, ejs, parentElem, itemBehavior) {
    
    var canvas = document.createElement('div');
    canvas.innerHTML = ejs.render(item);

    if (itemBehavior) itemBehavior(canvas.childNodes[0], item);

    parentElem.appendChild(canvas.childNodes[0]);

  },
  _displayMonthLayout = function(dates, locationCount, dateBehavior, monthBehavior, selected) {

    var activeMonthId = selected,
    
    activeMonthDates = [];

    if (!months) _generateMonths();

    // pick active month for date filtering

    for (var i=0; i<months.length; i++) {

      if (selected)
        months[i].active = (months[i].id == selected);
      else
        if (months[i].active) activeMonthId = months[i].id;

      // if months are displayed, update layout
      if ((options.monthElem && options.monthElem.innerHTML.length)) _updateMonthElem(i, months[i]);

    }
  
    // filter dates

    forEach(dates, function(date) {

      if (_getMonthId(date.date) == activeMonthId) activeMonthDates.push(date);

    });

    // display months
    if (options.monthElem && !options.monthElem.innerHTML.length) _displayMonths(monthBehavior);

    // display dates
    _displayDates(activeMonthDates, locationCount, dateBehavior);


  },
  _generateMonths = function() {

    var monthIds = [],
    monthCounts = {},
    today = new Date(),
    currentMonthId = _getMonthId(today),
    chosenMonthId = currentMonthId;


    // extract list of months

    forEach(dates, function(date) {

      var id = _getMonthId(date.date);

      if (!contains(monthIds, id)) {
        monthIds.push(id);
        monthCounts[id] = 0;
      }

      monthCounts[id]++;

    });

    monthIds.sort();

    // determine default active month

    if (!contains(monthIds, currentMonthId)) chosenMonthId = monthIds[0];


    // build months object

    months = [];

    forEach(monthIds, function(monthId) {

      var year = parseInt(monthId.substr(0, 4), 10);

      months.push({
        id: monthId,
        label: options.monthLabels[options.culture][parseInt(monthId.substr(4, 2), 10) - 1] + (year != today.getFullYear()?' ' + year: ''),
        active: monthId==chosenMonthId,
        passed: monthId<currentMonthId,
        count: monthCounts[monthId]
      });

    });

    return months;
  }
  , _getMonthId = function(date) {
    if (typeof date == 'object')
      return date.getFullYear() + _fZ(date.getMonth() + 1);
    else
      return date.substr(0, 4) + date.substr(5,2);
  }
  , _fZ = function(n) {
    return (n>9?'':'0') + n;
  }
  , _highlightByLocation = function(dates, locationId) {

    forEach(dates, function(date){
      date.highlighted = locationId!==false?(date.locationId==locationId?true:false):true;
    });

  }
  , _hideFilterLink = function() {

    addClass(options.filterElem.parentNode, 'display-none');

  }
  , _showFilterLink = function() {

    removeClass(options.filterElem.parentNode, 'display-none');

  };

  run();

};

(function() {

  var dateFormats = {
    'en': {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      weekMin: 'wk'
    },
    'fr': {
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      daysMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
      months: ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
      monthsShort: ["Jan", "Fev", "Mar", "Avr", "May", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
      weekMin: 'sm'
    },
    'it': {
      days: ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"],
      daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
      daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
      months: ["gennaio", "febbraio", "Marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      monthsShort: ["gen", "feb", "Mar", "apr", "mag", "giu", "lug", "ago", "sep", "ott", "nov", "dic"],
      weekMin: 'set'
    },
    'es': {
      days: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"],
      daysShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sáb"],
      daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"],
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      monthsShort: ["JEne", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      weekMin: 'sm'
    },
  };

  if (typeof Date.prototype.verboseDate == 'undefined') Date.prototype.verboseDate = function(language) {

    if (!dateFormats[language]) language = 'en';

    return dateFormats[language].daysShort[this.getDay()] + ' ' + this.getDate() + ' ' + dateFormats[language].monthsShort[this.getMonth()] + ', ' + this.getFullYear();

  };

  if (typeof String.prototype.verboseDate == 'undefined') String.prototype.verboseDate = function(language) {

    var date = new Date(this.replace(/-/g, '/'));

    if (date.toString() == 'Invalid Date') return false;

    return date.verboseDate(language);

  };

})();