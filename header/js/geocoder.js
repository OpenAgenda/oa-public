if (typeof Object.create === 'undefined') {
    Object.create = function (o) { 
        function F() {} 
        F.prototype = o; 
        return new F(); 
    };
}


if (typeof google.maps.LatLng.prototype.distanceFrom === 'undefined') {
  google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {

    if (newLatLng==undefined) return false;

    var dLat = (newLatLng.lat()-this.lat()) * Math.PI / 180;
    var dLon = (newLatLng.lng()-this.lng()) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.lat() * Math.PI / 180 ) * Math.cos(newLatLng.lat() * Math.PI / 180 )* Math.sin(dLon/2) * Math.sin(dLon/2);
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}



var geocoder = {

  init: function(options, elem) {

    this.eh = sEventHandler.getInstance();

    this.options = extend({}, this.defaults, options);

    this.elem = $(elem);
    
    this.geocoder = new google.maps.Geocoder();
    this.geocoding = false;

    this.flagId = 0;

    this.initAutocomplete();

    // if values are set in latitude/longitude pair, they should be reverse geocoded
    // reverse geocoding is 

    if ($(this.options.latDom).val().length && 
        $(this.options.lngDom).val().length && 
        !isNaN($(this.options.latDom).val()) && 
        !isNaN($(this.options.lngDom).val())) {
          if (this.options.initField) if (!this.elem.val().length) this.processPosition();
    } else {
      this.loadPosition();
      this.clearPosition();
    }

    this.eventify();

  },
  defaults: {
    latDom: '.js_latitude_field',                // dom identifier for latitude field
    lngDom: '.js_longitude_field',               // dom identifier for longitude field
    radiusDom: '.js_radius_field',               // dom id for radius field
    listDom: '.js_list_canvas',                  // dom identifier of element to which list of suggestions should be appended
    cityDom: false,                              // dom identifier of element for city name
    countryDom: false,                           // dom identifier of element for country name
    delay: 400,                                  // delay to wait before new request is sent to geocoder
    minLength: 3,                                // threshold over which requests can be sent
    minRadius: 5000,                             // minimum radius
    sensitivity: 1000000,                        // decimal at which values are rounded up
    positionChangeEvent: 'poschange',            // name of the event triggered when position field values have been changed
    geocodeBeginEvent: 'lock',                   // name of the event triggered when a geocode request is launched
    geocodeCompleteEvent: 'unlock',              // name of the event triggered when a geocode response has been received
    eventAnchor: '.js_search_form',              // name of the dom element to which events are bound
    initField: true,                             // at initialization, init address field if lat lon fields are set
    responseCallback: false,                     // method called on geocoder response
    onApplyPosition: false,                      // method called when position is applied to search fields
    onListClose: false,                          // method called when list closes
    showList: true,                              // show suggestion list upon reception of geocode results
    position: { my: "left top", at: "left bottom", collision: "none" }
  },

  // initialize jquery autocomplete
  initAutocomplete: function(){

    var proxy = this;

    $(this.elem).autocomplete({
      delay: proxy.options.delay,
      minLength: proxy.options.minLength,
      appendTo: proxy.options.listDom,
      position: proxy.options.position,
      source: function(request, response){ 

        proxy.geocoder.geocode({address: request.term}, function(results, status){
          proxy.handleGeocoderResponse(results, status, response);
        });

      },
      search: function(event, ui) { 

        this.geocoding = true;

        if (!this.geocodePrepared) $(proxy.options.eventAnchor).trigger(proxy.options.geocodeBeginEvent);
        
      },
      select: function(event, ui) { proxy.select(ui.item); },
      change: function(event, ui) { proxy.select(ui.item); },
      close: function(event, ui) { if (proxy.options.onListClose) proxy.options.onListClose(); }
    });

  },
  clearGeocodePrepare: function(flagId) {

    if (this.flagId==flagId) {
      if (!this.geocoding && this.geocodePrepared) {

        // if length of address string is smaller than minLength, clear position
        if (this.elem.val().length < this.options.minLength) {
          this.clearPosition();
          $(this.options.eventAnchor).trigger(this.options.geocodeCompleteEvent); 
        }
        else {
          // is equal or larger than minlength, trigger search          
          $(this.elem).autocomplete( "search" , this.elem.val() );
        }
      }
      this.geocodePrepared = false;
    }
  },
  // fetches and handles data sent by geocoder
  handleGeocoderResponse: function(results, status, response) {

    if (!results) results = {};
    else results = $.map(results, function(item) {
      return {
        label:  item.formatted_address,
        value: item.formatted_address,
        latitude: item.geometry.location.lat(),
        longitude: item.geometry.location.lng(),
        components: item.address_components,
        viewport: item.geometry.viewport
      }
    });

    // if only one result, don't show list
    if (results.length == 1) response({});
    
    // if more than one result show list 
    if ((results.length > 1) && this.options.showList) response(results);

    // select first by default if result is multiple
    if (results.length > 0) this.select(results[0]);

    // if no results, clear fields
    if (results.length == 0) this.clearPosition();

    if (this.options.responseCallback) this.options.responseCallback();

    // send event indicating geocode response has been received and processed
    $(this.options.eventAnchor).trigger(this.options.geocodeCompleteEvent);
    this.geocoding = false;
    this.geocodePrepared = false;
  },
  // processes the selection of a result
  select: function(result) {

    if (result != null) {

      var newRadius = Math.max(this.round(result.viewport.getCenter().distanceFrom(result.viewport.getNorthEast())), 5000);
      var newLatitude = this.round(result.latitude);
      var newLongitude = this.round(result.longitude);
      var newCity;
      var newCountry;

      if (this.options.cityDom) newCity = this.extractCity(result);
      if (this.options.countryDom) newCountry = this.extractCountry(result);

      if ((this.latitude != newLatitude) || (this.longitude != newLongitude) || (this.radius != newRadius)) {
        
        this.setPositionValues(newLatitude, newLongitude, newRadius, newCity, newCountry);

        this.applyPosition();
      }
    }
  },
  // write new position values
  setPositionValues: function(latitude, longitude, radius, city, country) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
    this.city = city;
    this.country = country;
  },
  // initializes processing to do on address key up event
  eventify: function() {
    this.elem.bind('keyup paste', $.proxy(this.geocodePrepare, this));
    $(this.options.eventAnchor).bind(this.options.positionChangeEvent, $.proxy(this.processPosition, this));
  },
  // update position fields with object values
  applyPosition: function() {

    $(this.options.latDom).val(this.latitude);
    $(this.options.lngDom).val(this.longitude);
    $(this.options.radiusDom).val(this.radius);

    if (this.options.cityDom) $(this.options.cityDom).val(this.city);
    if (this.options.countryDom) $(this.options.countryDom).val(this.country);

    $(this.options.eventAnchor).trigger(this.options.positionChangeEvent);

    if (this.options.onApplyPosition) this.options.onApplyPosition();
  },
  // loads position values from fields to object values
  loadPosition: function() {
    var city;
    var country;

    if (this.options.cityDom) city = $(this.options.cityDom).val();
    if (this.options.countryDom) country = $(this.options.countryDom).val();

    this.setPositionValues(this.round($(this.options.latDom).val()),
                           this.round($(this.options.lngDom).val()), 
                           this.round($(this.options.radiusDom).val(),
                           city, country));
  },
  isPositionDifferent: function(includeRadius) {

    if (includeRadius == undefined) includeRadius = true;

    if ((this.round($(this.options.latDom).val()) != this.latitude)
       || (this.round($(this.options.lngDom).val()) != this.longitude)
       || ((this.round($(this.options.radiusDom).val()) != this.radius) && includeRadius)) {
      return true;
    }

    return false;
  },
  clearPosition: function() {

    if ((this.latitude != null) || (this.longitude != null) || (this.radius != null)) {
      this.latitude = null;
      this.longitude = null;
      this.radius = null;  
      this.city = null;
      this.country = null;
      //this.applyPosition();
    }
  },
  // announce geocode is under way - called when a key is pressed
  geocodePrepare: function(e) {

    if ($.inArray(e.keyCode, [40,38,39,37,13]) != -1) return;

    if (!this.geocodePrepared) $(this.options.eventAnchor).trigger(this.options.geocodeBeginEvent);
    
    this.geocodePrepared = true;

    this.flagId = this.flagId+1;

    setTimeout($.proxy(function(){ this.clearGeocodePrepare(this.flagId)}, this), this.options.delay+100);
  },
  round: function(value) {
    return Math.round(value*this.options.sensitivity)/this.options.sensitivity;
  },
  // reverse geocode address from position
  processPosition: function() {

    // if position values aren't different from loaded values, never mind
    if (!this.isPositionDifferent(false)) return;

    this.loadPosition();

    if (!this.latitude && !this.longitude) return;

    var latLng = new google.maps.LatLng(this.latitude, this.longitude);

    // launch reverse geocode
    this.geocoder.geocode({'latLng': latLng}, $.proxy(function(results, status) {
    
      if (status != google.maps.GeocoderStatus.OK) return;

      if (!results[0]) return;

      var result = results[0];

      this.elem.val(result.formatted_address).blur();

      if (this.options.cityDom) $(this.options.cityDom).val(this.extractCity(result));
      if (this.options.countryDom) $(this.options.countryDom).val(this.extractCountry(result));

    }, this));
  },
  extractCity: function(result) {
    for(i in result.components){
      if (result.components[i].types[0]=='locality') return result.components[i].short_name;  
    }

    return null;
  },
  extractCountry: function(result) {
    for(i in result.components){
      if (result.components[i].types[0]=='country') return result.components[i].short_name;  
    }

    return false;
  }
  
};

(function($){
  $.fn.extend({
    geocoder: function(options){

      if(!this.length) return this;

      return this.each(function(){
        var myGeocoder = Object.create(geocoder);
        myGeocoder.init(options, this);
        $(this).data('geocoder', myGeocoder);
      })
    }
  })
})(jQuery);