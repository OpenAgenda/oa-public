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
  }
};

var initLocationEventsController = function(params) {
  
  return ({
    initialized: false,
    elem: '.js_location_events',
    htmlCanvas: '.js_list_canvas',
    htmlContent: '.js_list',
    titleBlockDom: '.js_list_header',
    titleDom: '.js_list_title',
    closeDom: '.js_list_close',
    init: function() {
      this.elem = $(this.elem);

      $(this.closeDom).click($.proxy(function(e){

        e.preventDefault();

        if (params.markerIcon && params.map) params.map.setMarkerIcons(params.markerIcon);

        this.close();

      }, this));

      return this;

    },
    loadHtml: function(html) {
      $(this.htmlContent, this.elem).html(html);
    },
    loadTitle: function(title) {
      $(this.titleDom, this.elem).html(title)
    },
    onFirstOpen: function(){

      // use iscroll for any browser except ie
      if (document.addEventListener) setTimeout($.proxy(function(){ $(this.htmlCanvas, this.elem).iScroll() }, this), 100);

    },
    onOpen: function() {

      if (typeof this.onOpenBegin) this.onOpenBegin();

      $(this.elem).height($('.js_map').height());

      $(this.htmlCanvas).height($(this.elem).height()-$(this.titleBlockDom, this.elem).height() - parseInt($(this.titleBlockDom, this.elem).css('padding-bottom'), 10) - parseInt($(this.titleBlockDom, this.elem).css('padding-top'), 10));

      // use iscroll for any browser except ie
      if (document.addEventListener) setTimeout($.proxy(function(){ $(this.htmlCanvas, this.elem).data('iScroll').refresh() }, this), 200);

    },
    open: controllerDefaultOpen,
    closeOnParentClick: controllerDefaultCloseOnParentClick,
    close: controllerDefaultClose 
    
  }).init();

};

var initWhatController = function(params) {

  ({
    initialized: false,
    validateDom: '.js_confirm',
    elem: '.js_what.js_overlay',
    triggerButton: '.js_what_input',
    targetInput: '.js_what_input',
    onChange: params.onChange,
    init: function(){

      var self = this;

      self.elem = $(self.elem);
      self.triggerButton = $(self.triggerButton);

      $('.js_what_input').clearField();

      $('.js_what_input').val(params.initData.replace(/\+/g, ' '));

      $('.js_what .js_what_tag').taggize({ input: '.js_what_input', blur: false});

      $(this.triggerButton).poppit({target: '.js_what', my: 'left top', at: 'left bottom', offset:'0 15px', onShow: function(){ self.open(); } });


      $(this.targetInput).blur(function(){
        self.onChange($(self.targetInput).val());
      });

      $(this.targetInput).keypress(function(e){
        if (e.charCode==13) self.onChange($(self.targetInput).val());
      });

      
    },
    onOpen: function(){
      
      /*$('.js_what_input').clearify({
        onClear: $.proxy(function(){ $('.taggized').removeClass('active'); }, this),
        clearClass: 'clear-cross'
      });*/

    },
    open: controllerOpen,
  }).init();
};


var initWhenController = function(params) {

  function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
  };

  function dmYYmd(dateString) {
    return dateString.substr(6,4) + '/' + dateString.substr(3,2) + '/' + dateString.substr(0,2);
  }

  return ({
    initialized: false,
    validateDom: '.js_confirm',
    elem: '.js_when.js_overlay',
    triggerButton: '.js_when_input',
    inputField: '.js_when_input',
    onChange: params.onChange,
    onOpen: function(){

      var self = this,
        inputElem = getElementsByClassName(document, self.inputField.substr(1))[0],
        initBegin = inputElem.value.substr(0, 10),
        initEnd = inputElem.value.substr(13, 10);

      if (initBegin.length) initBegin = dmYYmd(initBegin);
      if (initEnd.length) initEnd = dmYYmd(initEnd);

      var selected = initBegin.length?{begin: new Date(initBegin), end: new Date(initEnd.length?initEnd:initBegin) }:false;

      if (typeof params.locale == 'undefined') params.locale = 'en';

      new CibulCalendar(getElementsByClassName(document, 'js_calendar')[0], {
        onSelect: function(selected) {

          var begin = padStr(selected.begin.getDate()) + '/' + padStr(selected.begin.getMonth()+1) + '/' + selected.begin.getFullYear(),
            end = padStr(selected.end.getDate()) + '/' + padStr(selected.end.getMonth()+1) + '/' + selected.end.getFullYear(),
            newRange = begin + (begin!=end?' - ' + end:'');
          
          if (inputElem.value != newRange) {
            inputElem.value = newRange;
            self.onChange($(self.inputField).val());
          }

        },
        lang: params.locale,
        weekDays: {
          en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          fr: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
          it: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"]
        },
        selected: selected
      });


    },
    init: function(){

      this.elem = $(this.elem);
      this.triggerButton = $(this.triggerButton);

      $('.js_when_input').clearField();

      $('.js_when_input').val(params.initData.replace(/\+/g, ' '));

      var self = this;

      $(this.triggerButton).poppit({target: '.js_when', my: 'left top', at: 'left bottom', offset:'0 15px', onShow: function(){ self.open(); } });

      $(this.inputField).blur(function(){
        self.onChange($(self.inputField).val());
      });

    },
    open: controllerOpen
  }).init();

};

var initWhereController = function(params) {

  return ({
    initialized: false,
    locked: false,
    eventAnchor: '.js_event_anchor',
    triggerButton: '.js_where_input',
    elem: '.js_where',
    open: controllerOpen,
    onChange: params.onChange,
    init: function(){

      var self = this;

      this.dom = this.elem;
      this.elem = $(this.elem);

      this.triggerButton = $(this.triggerButton);

      $('.js_where_input').clearField();

      // put init values in fields

      $('.js_where_input').val(params.initData.where);
      $('.js_latitude_field').val(params.initData.latitude);
      $('.js_longitude_field').val(params.initData.longitude);
      $('.js_radius_field').val(params.initData.radius);

      // initialize geocoder

      self.timeout = false;

      $('.js_where_input').geocoder({ eventAnchor: this.eventAnchor, listDom: '.js_where_list', position: {my: 'right top', at: 'right bottom', offset: '0 15px'}, onApplyPosition: function(){

        if (self.timeout) clearTimeout(self.timeout);

        self.timeout = setTimeout(function(){

          self.checkChange();

        }, 500);

      }});

      // bind indicator with lock event

      $(this.eventAnchor, this.elem).bind('lock', function(){
        $('.js_occupied', this.elem).removeClass('display-none');
        this.locked = true;
      }).bind('unlock', function(){
        $('.js_occupied', this.elem).addClass('display-none');  
        this.locked = false;
      });

      // nav Geo

      $('.js_nav_locate').navGeo({eventAnchor: this.eventAnchor, gif_path: (params.env=='template'?'':'/') + 'images/ajax-loader.gif', positionComplete: function(){
        self.checkChange();
      }});

      $(this.triggerButton).poppit({target: '.js_where', my: 'right top', at: 'right bottom', offset:'0 15px', onShow: function(){ self.open(); } });

      $('.js_where_input').keyup(function(e){
        if (e.keyCode==13) self.checkChange();
      });

      return this;

    },
    checkChange: function() {

      var self = this;

      if (!self.locked) {

        if ($('.js_where_input').val()) {

          self.onChange({
            latitude: $('.js_latitude_field', self.elem).val(),
            longitude: $('.js_longitude_field', self.elem).val(),
            radius: $('.js_radius_field', self.elem).val(),
            where: $('.js_where_input').val()
          });

        }

      }

    },
    onOpen: function(){
      

    }
  }).init();
};


var controllerDefaultOpen = function(){

  setTimeout($.proxy(function(){ // delay needed so that opening click is not interpreted as closing click
    
    this.elem.removeClass('display-none');

    this.controllerOpen = controllerOpen;

    this.controllerOpen();

    this.closeOnParentClick();

  }, this),10);
  
};


var controllerOpen = function(){

  if (typeof this.initialized != 'undefined') {

    if (!this.initialized) if (typeof this.onFirstOpen != 'undefined') this.onFirstOpen();

    this.initialized = true;

  };

  if (typeof this.onOpen != 'undefined') this.onOpen();

};

var controllerDefaultClose = function() {

  this.elem.unbind('click.closing');
  
  $('body').unbind('click.closing');
  
  this.elem.addClass('display-none');

  if (typeof this.triggerButton != 'undefined') this.triggerButton.removeClass('active');
};

var controllerDefaultCloseOnParentClick = function() {

  this.isClicked = false;

  this.elem.unbind('click.closing').bind('click.closing', $.proxy(function(){ this.isClicked = true; }, this));

  $('body').unbind('click.closing').bind('click.closing', $.proxy(function(){

    if (!this.isClicked) {

        if (!this.elem.hasClass('display-none')) {
          if (typeof this.onClose != 'undefined') this.onClose();

          this.close();
        }
        
    }

    this.isClicked = false;

  }, this));

};


var syncButton = function(searchClient, options) {
  
  this.init = function(searchClient){
    
    this.searchClient = searchClient;

    this.elem = $(this.options.buttonDom);

    if (this.searchClient.isSynced()) {
      
      this.setSynced();

    } else {
      
      this.setUnsynced();

    };

    this.searchClient.setUnsyncedCallback($.proxy(function(){

      this.setUnsynced();
      
    }, this));

    this.searchClient.setSyncedCallback($.proxy(function(){

      this.setSynced();
      
    }, this));

  };

  this.setSynced = function(){
    
    this.elem.unbind('click').click($.proxy(function(e){

      e.preventDefault();
      
    }, this));

    this.elem.removeClass(this.options.unSyncedClass);
    //this.elem.addClass(this.options.syncedClass);

    this.synced = true;

  };

  this.setUnsynced = function(){

    if (!this.options.autoSync) {
      
      this.elem.unbind('click').click($.proxy(function(e){

        e.preventDefault();

        searchClient.getData();

      }, this));

    } else {
      
      searchClient.getData();

    };
    
    

    this.elem.addClass(this.options.unSyncedClass);

  };

  this.options = $.extend({
    buttonDom: '.js_sync_button',
    unSyncedClass: 'required',
    //syncedClass: 'display-none'
    autoSync: false
  }, options);

  this.init(searchClient);
};





var gCircledMarker = function(options) {

  var self = this;

  this.init = function(options){

    this.options = $.extend(this.defaults, options);

    this.options.icon = new google.maps.MarkerImage((this.options.env=='template'?'':'/') +  'images/bluecircle40.png', null, null, new google.maps.Point(17,17));
    this.options.perimeterIcon = (this.options.env=='template'?'':'/') + 'images/bluecircle30.png';

    if (typeof this.options.map == 'undefined') return false; // can't have that

    if (typeof this.options.position == 'undefined') this.options.position = this.options.map.getCenter();

    if (typeof options.map.incZoom == 'undefined') this.options.map.incZoom = function(){

      var changed = false;

      google.maps.event.addListener(this, 'zoom_changed', function() {
        zoomChangeBoundsListener = google.maps.event.addListener(this, 'bounds_changed', function(event) {
          
          if ((this.getZoom() < 20) && !changed) {
            changed = true;
            this.setZoom(this.getZoom()+1);
          }
          
          google.maps.event.removeListener(zoomChangeBoundsListener);
        });
      });

    };

    this.marker = new google.maps.Marker(this.options);

    this.options.perimeterRadius = parseInt(this.options.perimeterRadius, 10);

    // create marker perimeter and make map follow it
    if (this.options.perimeterRadius) this.marker.makePerimeter({
      perimeterIcon: this.options.perimeterIcon,
      perimeterAnchor: this.options.perimeterAnchor,
      distance: this.options.perimeterRadius,
      strokeColor: this.options.perimeterStrokeColor,
      fillOpacity: this.options.perimeterFillOpacity,
      fillColor: this.options.perimeterFillColor,
      onPerimeterChange: $.proxy(this.onPerimeterChange, this),
      zoomMore: true
    });

    this.options.map.fitBounds(this.marker.circle.getBounds());

    //this.options.map.incZoom();

    self.includePerimeterMarkerInZoom();


    // make map always center on marker after drop
    google.maps.event.addListener(this.marker, 'dragend', this.onCenterDragEnd);


    if (this.options.onDragStart) {
      google.maps.event.addListener(this.marker.perimeterMarker, 'dragstart', this.options.onDragStart);
      google.maps.event.addListener(this.marker, 'dragstart', this.options.onDragStart);
    };

    if (this.options.onDragEnd) {
      google.maps.event.addListener(this.marker.perimeterMarker, 'dragend', this.options.onDragEnd);
      google.maps.event.addListener(this.marker, 'dragend', this.options.onDragEnd);
    };

  };

  this.defaults = {
    draggable: true,
    perimeterRadius: 3000,
    perimeterAnchor: [15,16],
    perimeterFillOpacity: 0,
    perimeterStrokeColor: '#11bed4',
    bindMapBounds: true,
    raiseOnDrag: false,
    onCenterDragEnd: false,
    onDragStart: false,
    onDragEnd: false,
    onPerimeterChange: false
  };

  this.onCenterDragEnd = function(){
    
    self.options.map.setCenter(self.marker.getPosition());

    if (self.options.onCenterDragEnd) self.options.onCenterDragEnd(self.marker.getPosition());

    setTimeout(function(){ self.includePerimeterMarkerInZoom() },100);
    
  };

  this.onPerimeterChange = function(radius) {

    // clean radius
    radius = Math.ceil(radius);
    
    // adjust map center and bounds to circle
    this.options.map.fitBounds(this.marker.circle.getBounds());
    
    this.options.map.incZoom();

    // if perimeter marker is still out of bounds of map, zoom out a notch

    setTimeout(function(){ self.includePerimeterMarkerInZoom() },100);

    if (this.options.onPerimeterChange) this.options.onPerimeterChange(radius);
  };

  this.includePerimeterMarkerInZoom = function(){

    if (!this.options.map.getBounds()) return;

    if (!this.options.map.getBounds().contains(this.marker.perimeterMarker.getPosition())) {

      var zoom = this.options.map.getZoom();

      if (zoom == 0) return;

      this.options.map.setZoom(zoom-1);

      self.includePerimeterMarkerInZoom();

    }
  };


  this.setOnPerimeterChange = function(callback) {
    
    this.options.onPerimeterChange = callback;

  };

  this.setOnDragend = function(callback) {
    
    this.options.onDragend = callback;

  };

  this.getMarker = function() {
    return this.marker;
  };

  this.updatePositionRadius = function(parameters) {

    this.marker.setPosition(new google.maps.LatLng(parameters.latitude, parameters.longitude));

    this.marker.syncDistance(Math.ceil(parameters.radius));

    this.toCenter();
  };

  this.toCenter = function(){
    
    this.options.map.fitBounds(this.marker.circle.getBounds());
    
    this.options.map.incZoom();

  };

  this.init(options);

};


var calendarWidget = {

  init: function(elem, options) {

    this.elem = $(elem);

    this.options = $.extend({}, $.extend($.extend({}, this.defaults), options));
    
    this.loadFromInput();

    if (this.options.dateRange) this.currentDateRange = this.options.dateRange;

    if (this.options.createCalendarOnInit) this.createCalendar();

  },
  defaults: {
    dateRange: false,
    displayWeek: false,
    datepickerClass: 'datepicker',
    hiddenWeekClass: 'noweek',
    targetInputDom: '.js_when_input',
    dateIntervalSeparator: ' - ',
    outputDateFormat: 'd/m/Y',
    createCalendarOnInit: true,
    locale: 'en'
  },
  createCalendar: function(){

    if (this.elem.data('datepicker')) this.elem.data('datepicker', null);
    
    this.elem.html('');

    this.elem.DatePicker({
      date: this.currentDateRange,
      flat: true,
      mode: 'range',
      onChange: $.proxy(this.onChange, this),
      onRender: $.proxy(this.onRender, this),
      format: this.options.outputDateFormat,
      current: this.currentDateRange?this.currentDateRange[0]:undefined,
      locale: dateFormats[this.options.locale]
    });

    if (!this.options.displayWeek) $('.' + this.options.datepickerClass, this.elem).addClass(this.options.hiddenWeekClass);
    
  },

  onRender: function(date){

    var formated = $.fn.formatDate(date);

    var today = new Date();
    today = $.fn.formatDate(today);

    return {
      className: (today==formated)?'today':''
    }

  },

  onChange: function(formatted) {

    this.currentDateRange = formatted;
    
    this.writeToInput();

  },

  writeToInput: function() {

    if (this.currentDateRange) {

      if (this.currentDateRange[0] == this.currentDateRange[1]) {

        $(this.options.targetInputDom).val(this.currentDateRange[0]);

      } else {
        
        $(this.options.targetInputDom).val(this.currentDateRange[0] + this.options.dateIntervalSeparator + this.currentDateRange[1]);

      }
    }
    else {
      $(this.options.targetInputDom).val('');
    }

    $(this.options.targetInputDom).blur();

  },

  loadFromInput: function() {

    this.currentDateRange = false;

    var inputDates = $(this.options.targetInputDom).val();

    if (inputDates.length == 10) this.currentDateRange = [inputDates, inputDates];

    if (inputDates.length == 20 + this.options.dateIntervalSeparator.length ) this.currentDateRange = [inputDates.substr(0, 10), inputDates.substr(10+this.options.dateIntervalSeparator.length)];

    // test if dates are valid
    if (this.currentDateRange) {
      
      var testedDates = this.currentDateRange.slice();

      if (this.options.outputDateFormat == 'd/m/Y') testedDates = [this.dmYToYmd(testedDates[0]), this.dmYToYmd(testedDates[1])];

      if ((new Date(testedDates[0])=='Invalid Date') || (new Date(testedDates[1])=='Invalid Date')) this.currentDateRange = false;
    }
  },

  dmYToYmd: function(dmyDate) {

    if (dmyDate.length != 10) return false;

    var separator = dmyDate.substr(2,1);

    var ymdDate = dmyDate.substr(6,4) + separator + dmyDate.substr(3,2) + separator + dmyDate.substr(0,2);

    if (new Date(ymdDate) == 'Invalid Date') return false;

    return ymdDate;
  },

};


(function($){
  $.fn.extend({
    calendarWidget: function(options){

      if(!this.length) return this;

      return this.each(function(){
        var myCalendar = Object.create(calendarWidget);
        myCalendar.init(this, options);
        $(this).data('calendarWidget', myCalendar);
      });

    }
  })
})(jQuery);


var LocationHandler = function(options){

  var self = this;

  this.options = extend({
    gMap: false, // object carrying methods markersOnClick, addMarker and clearMarkers
    language: 'en',
    jsonp: false,
    env: false,
    resEvent: false
  }, options);

  if (!this.options.env) console.log('LocationHandler - env option not set');
  if (!this.options.resEvent) console.log('LocationHandler - resEvent not set');

  this.options.markerIcon = (this.options.env=='template'?'':'/') + 'images/squareMarker.png';
  this.options.selectedMarkerIcon = (this.options.env=='template'?'':'/') + 'images/squareMarkerSel.png';
  
  this.init = function(options) {

    this.qClient = new queryClient(this.options.resEvent, {jsonp: this.options.jsonp});

    if (!this.options.gMap) console.log('gMap is required. Exiting.');
    if (!this.options.listController) console.log('listController is required. Exiting.');

    if (!(this.options.gMap && this.options.listController )) return false;

    this.events = {};

    this.htmlizer = new htmlizer(this.options.templates);
    

  };

  this.load = function(locations){

    this.options.gMap.clearMarkers();

    for (index in locations) {

      this.options.gMap.addMarker({
        lat: locations[index].lat,
        lng: locations[index].lng,
        id: locations[index].slug,
        title: locations[index].placename,
        eventIds: locations[index].eventIds,
        icon: this.options.markerIcon
      });
      
    };

    this.options.gMap.markersOnClick(function(marker){
      
      self.displayMarkerEvents(marker);

    });

    this.options.listController.onClose = function(){

      self.options.gMap.setMarkerIcons(self.options.markerIcon);

    };

    this.options.listController.onOpenBegin = function(){
      self.currentMarker.setIcon(self.options.selectedMarkerIcon);
    };

  };

  this.displayMarkerEvents = function(marker) {

    this.currentMarker = marker;

    // center on marker
    //this.currentMarker.getMap().setCenter(this.currentMarker.getPosition());

    // load missing events

    var missingEvents = new Array();

    for (index in this.currentMarker.eventIds) {
      
      if (typeof this.events[this.currentMarker.eventIds[index]] == 'undefined') missingEvents.push(this.currentMarker.eventIds[index]);

    };


    if (missingEvents.length) {

      this.qClient.setParameter('uid', missingEvents);

      this.qClient.getData($.proxy(this.loadAndShowEvents, this));
    }
    else {
      
      this.loadAndShowEvents();

    }

  };

  // load events on event list and show them
  this.loadAndShowEvents = function(data){

    if (typeof data != 'undefined') {

      if (data.success) {

        data = data['data'];
        
        for (index in data) {

          this.events[data[index].uid] = data[index];

        }

      }

    }

    var apiEvents = new Array();

    for (index in this.currentMarker.eventIds) {

      // tweak for url (to remove for prod):

      if (this.options.env!='prod') {
        this.events[this.currentMarker.eventIds[index]].image = this.events[this.currentMarker.eventIds[index]].image.replace(/\/\/cibultest/g, 'http://cibul');
        this.events[this.currentMarker.eventIds[index]].url = this.events[this.currentMarker.eventIds[index]].url.replace(/\/frontend_dev.php/g, 'http://cibul.net');
      }

      this.events[this.currentMarker.eventIds[index]].url = this.events[this.currentMarker.eventIds[index]].url.replace(/^\/event/g, 'http://cibul.net/event');
      
      apiEvents.push(this.events[this.currentMarker.eventIds[index]]);

    }

    this.htmlizer.processList(this.makeTemplateFormat(apiEvents));

    // tweak for dev
    var html = this.htmlizer.getHtml();

    //html = html.replace(/<a/g,'<a target="_blank" ');

    this.options.listController.loadTitle(this.currentMarker.title);

    this.options.listController.loadHtml(html);

    this.options.listController.open();

  };

  // convert api format to template format
  this.makeTemplateFormat = function(apiEvents) {
    
    var templateEvents = new Array();

    for (index in apiEvents) {

      var apiEvent = apiEvents[index];

      if (typeof apiEvent.spacetime == 'undefined') {
        
        var dates = apiEvent.dates;

      }
      else {

        var dates = apiEvent.spacetime[this.currentMarker.id].dates;

      }
      
      var tEvent = {
        values: {
          url: apiEvent.url,
          title: apiEvent.title,
          description: apiEvent.description,
          image: apiEvent.image,
          share_url: apiEvent.share_url,
          spacetime: this.makeDateRange(dates)
        },
        optionals: { book_url: false, pricing: false },
        lists: { locations: false, sharing: false, going: false }
      };

      templateEvents.push(tEvent);

    };

    return templateEvents;
  };

  // make date range string from array of dates
  this.makeDateRange = function(dates) {
    var minDate = false; var maxDate = false;

    for (index in dates) {
      
      if (!minDate || dates[index].date<minDate) minDate = dates[index].date;

      if (!maxDate || dates[index].date>maxDate) maxDate = dates[index].date;

    }

    if (minDate == maxDate) return this.makeVerboseDate(minDate) + ' @ ' + dates[0].time_start.substr(0, 5);


    return this.makeVerboseDate(minDate) + (this.options.language=='fr'?' au ':' to ') + this.makeVerboseDate(maxDate);
  };

  // make language specific date string with weekday and month
  this.makeVerboseDate = function(dateString) {

    var d = new Date(dateString.replace(/-/g, '/'));

    return dateFormats[this.options.language].daysShort[d.getDay()] + ' ' + d.getDate() + ' ' + dateFormats[this.options.language].monthsShort[d.getMonth()] + ', ' + dateString.substr(0,4);
  };

  this.init(options);

}