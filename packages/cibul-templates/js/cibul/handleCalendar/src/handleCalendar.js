/* handleCalendar v0.1.2 */

var extractDate = function(dates, item) {

  forEach(item.location.d, function(date) {

    if (typeof dates[date] == 'undefined') {
      dates[date] = {
        count: 0,
        locations: []
      };
    }

    dates[date].locations.push(item.locationSlug);
    dates[date].count++;

  });

};

var createDateSelect = function(elem, dates, eventHandler, params) {

  params = extend({
    triggerEvents: { disable: 'caldisable', refresh: 'calrefresh', enable: 'calenable', mobileOn: 'mobileon', mobileOff: 'mobileoff' },
    triggeredEvents: { dateSelect: 'periodselected' },
    disabledClass: 'disabled',
    displayNoneClass: 'display-none',
    lang: 'en',
    mobile: false,
    nav: { prev: '<i class="icon-chevron-left"></i>' , next: '<i class="icon-chevron-right"></i>'}
  }, params);

  var enabled = true,
    calendarDisplayed = false,
    calendar = false,
    filterElem = els(elem, '.filter-item'),
    calendarCanvas = el(elem, '.calendar-canvas'),
    mobile = params.mobile,
    init = function() {

      filterElem = filterElem.length?filterElem[0]:false;

      _showCalendar();

      if (filterElem) addEvent(el(filterElem, '.icon-remove'), 'click', function(){
        if (enabled) {
          eventHandler.trigger(params.triggeredEvents.dateSelect, { from: null, to: null });
        }
      });

      eventHandler.on(params.triggerEvents.disable, function(){
        _disable();
      });

      eventHandler.on(params.triggerEvents.enable, function(){
        _enable();
      });

      eventHandler.on(params.triggerEvents.refresh, function(data){

        _enable();

        if (typeof data.from == 'undefined') {
          if (calendar) calendar.setSelected(false);
          if (filterElem) _hideFilter();
        } else {

          if (typeof data.to == 'undefined') data.to = data.from;
          if (calendar) calendar.setSelected({begin: new Date(data.from.replace(/-/g, "/")), end: new Date(data.to.replace(/-/g, "/"))});

          if (filterElem) _showFilter(data.from, data.to);
        }

        if (calendar) calendar.enable();

      });

    },
    _showFilter = function(from, to) {

      el(filterElem, 'span').innerHTML = from==to?from:from + ' ' + to;

      removeClass(filterElem, params.displayNoneClass);

    },
    _hideFilter = function() {

      el(filterElem, 'span').innerHTML = '';

      addClass(filterElem, params.displayNoneClass);

    },
    _showCalendar = function() {

      if (!calendar) calendar = new CibulCalendar(calendarCanvas, {
        filter: function(date, classes) {
          
          if (typeof dates[date.getFullYear() + '-' + (date.getMonth()<9?'0':'') + (date.getMonth()+1) + '-' + (date.getDate()<10?'0':'') + date.getDate()] != 'undefined') {
            classes.push('hasdates');
          }

          return classes;

        },
        onSelect: function(selection) {

          eventHandler.trigger(params.triggeredEvents.dateSelect, {
            from: selection.begin.getFullYear() + '-' + (selection.begin.getMonth()<9?'0':'') + (selection.begin.getMonth()+1) + '-' + (selection.begin.getDate()<10?'0':'') + selection.begin.getDate(),
            to: selection.end.getFullYear() + '-' + (selection.end.getMonth()<9?'0':'') + (selection.end.getMonth()+1) + '-' + (selection.end.getDate()<10?'0':'') + selection.end.getDate()
          });

        },
        navDomContent: { prev: params.nav.prev, next: params.nav.next},
        lang: params.lang
      });

      removeClass(calendarCanvas, params.displayNoneClass);

      calendarDisplayed = true;

    },
    _disable = function() {

      if (filterElem) addClass(filterElem, params.disabledClass);
      if (calendar) calendar.disable();
      enabled = false;

    },
    _enable = function() {

      if (filterElem) removeClass(filterElem, params.disabledClass);
      if (calendar) calendar.enable();
      enabled = true;

    };

  init();

};