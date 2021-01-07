var handleEvent = function(controlData, options) {

  options = extend({
    targetBlankLinks: false,
    maps: 'google',
    elems: {
      map: el('.map')
    },
    iconRoot: 'images/',
    culture: 'en',
    cultureLabels: {
      fr: 'français',
      en: 'english',
      it: 'italiano'
    },
    tiles: false
  },options);

  options.templates = extend({
    placeDetail: [
      '<div class="address"><%= address %></div>',
      '<% if (typeof pricingInfo != \'undefined\' || ticketLink != \'undefined\') { %>',
      '<div class="ticket">',
        '<% if (typeof pricingInfo != \'undefined\') { %>',
        '<% for (lang in pricingInfo) { var lpInfo = pricingInfo[lang]; } %>',
        '<span class="pricing"><span>> </span><%= lpInfo %></span>',
        '<% } %>',
        '<% if (typeof ticketLink != \'undefined\') { %>',
        '<div class="book"><a class="url"', options.targetBlankLinks?' target="_blank"':'' ,' href="<%= ticketLink %>">', options.labels.reservation,'</a></div>',
        '<% } %>',
      '</div>',
      '<% } %>'
    ].join('')
  }, options.templates?options.templates:{});

  options.events = extend({
    heightChange: 'heightchange',
    onDateLocationSelection: 'eventdateplaceselect',
    onDateLocationSelectionCancel: 'eventmapplaceunselect'
  }, options.events);

  options.labels = extend({
    placeInfo: 'Showing %d places. Click on a marker for details.'
  }, options.labels?options.labels:{});

  //var m = maps.use('osm');
  var m = options.maps=='google'?maps.use('google'):maps.use('osm', {url: options.tiles?options.tiles:'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'}),

  getHeight = (typeof makeEventHeightGetter !== 'undefined')?makeEventHeightGetter(el('#event'), options.events.heightChange):false;

  handleEventPlaces(controlData, m, {
    triggeredEvents: { onLocationSelect: 'eventmapplaceselect', onLocationSelectCancel: options.events.onDateLocationSelectionCancel },
    triggerEvents: { selectLocation: options.events.onDateLocationSelection },
    locationElem: el('.js_place_detail'),
    showAllElem: el('.js_show_all_places'),
    generalInfoText: options.labels.placeInfo,
    locationTitleElem: el('.js_placename'),
    mapElem: options.elems.map,
    iconRoot: options.iconRoot,
    template: options.templates.placeDetail
  });

  handleEventDates(controlData, {
    monthElem: el('.js_months'),
    dateElem: el('.js_dates'),
    filterElem: el('.js_date_filter_cancel'),
    events: {
      triggered: { selectLocation: options.events.onDateLocationSelection, layoutChange: options.events.heightChange },
      trigger: { selectCancel: 'eventmapplaceunselect', selectLocation: 'eventmapplaceselect' }
    },
    culture: options.culture,
    monthLabels: {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      ar: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Januar']
    },
    templates: {
      date: options.templates.date,
      month: options.templates.month
    }
  });

  handleLanguages({
    tabsElem: el('.js_event_language_list'),
    contentElems: els('.js_lang'),
    defaultLang: options.culture,
    template: '<div><div class="js_lang_select language-select"><span><i class="fa fa-flag url"></i></span><i class="fa fa-caret-down url"></i></div><ul class="js_language_menu wsq language-menu"><% for (index in tabs) { %><li <% if (tabs[index].active) {%>class="active"<% } %>><%= tabs[index].label %></li><% } %></ul></div>',
    labels: options.cultureLabels,
    onClick: function() {
      sEventHandler.getInstance().trigger(options.events.heightChange);
    }
  });

  handleOEmbed({
    elements: {
      link: els('.js_links'),
      embed: els('.js_embeds'),
    },
    oembedUrl: options.oembedUrl,
    heightChange: options.events.heightChange,
    targetBlankLinks: options.targetBlankLinks
  });

  if (getElementsByClassName(document, 'poster').length) addEvent(getElementsByClassName(document, 'poster')[0].getElementsByTagName('img')[0], 'load', function(){
    sEventHandler.getInstance().trigger(options.events.heightChange);
  });

  return {
    getHeight: getHeight
  }

}