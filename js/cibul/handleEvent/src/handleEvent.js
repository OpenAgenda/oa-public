var handleEvent = function(controlData, options) {

  options = extend({
    targetBlankLinks: false,
    maps: 'google',
    elems: {
      map: getElementsByClassName(document, 'map')[0]
    },
    events: {
      heightChange: 'heightchange'
    },
    iconRoot: 'images/',
    culture: 'en',
    cultureLabels: {
      fr: 'français',
      en: 'english',
      it: 'italiano'
    },
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

  options.labels = extend({
    placeInfo: 'Showing %d places. Click on a marker for details.'
  }, options.labels?options.labels:{});

  //var m = maps.use('osm');
  var m = options.maps=='google'?maps.use('google'):maps.use('osm', {url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'})
   , getHeight = (typeof makeEventHeightGetter !== 'undefined')?makeEventHeightGetter(el('#event'), options.events.heightChange):false;

  handleEventPlaces(controlData, m, {
    triggeredEvents: { onLocationSelect: 'eventmapplaceselect', onLocationSelectCancel: 'eventmapplaceunselect'},
    triggerEvents: { selectLocation: 'eventdateplaceselect' },
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
      triggered: { selectLocation: 'eventdateplaceselect', layoutChange: options.events.heightChange },
      trigger: { selectCancel: 'eventmapplaceunselect', selectLocation: 'eventmapplaceselect' }
    },
    culture: options.culture,
    monthLabels: { 
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    },
    templates: {
      date: options.templates.date,
      month: options.templates.month
    }
  });

  handleLanguages({
    tabsElem: el('.js_event_language_list'),
    contentElems: els('.js_lang'),
    template: '<div><div class="js_lang_select language-select"><span>language</span><i class="icon-caret-down"></i></div><ul class="js_language_menu wsq language-menu"><% for (index in tabs) { %><li <% if (tabs[index].active) {%>class="active"<% } %>><%= tabs[index].label %></li><% } %></ul></div>',
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
    heightChange: options.events.heightChange
  });

  if (getElementsByClassName(document, 'poster').length) addEvent(getElementsByClassName(document, 'poster')[0].getElementsByTagName('img')[0], 'load', function(){
    sEventHandler.getInstance().trigger(options.events.heightChange);
  });

  return {
    getHeight: getHeight
  }

}