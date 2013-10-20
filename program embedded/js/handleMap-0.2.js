// handleMap-0.2.js
var extractLocation = function(locations, item){

  if (typeof locations[item.locationSlug] == 'undefined') locations[item.locationSlug] = {
    placename: item.location.p,
    address: item.location.a,
    categories: [],
    tags: [],
    dates: [],
    lat: item.location.lt,
    lng: item.location.lg
  };

  // add category
  if (typeof item.article.c !='undefined') if (item.article.c.length) if (!contains(locations[item.locationSlug].categories, item.article.c)) 
    locations[item.locationSlug].categories.push(item.article.c);

  // add tags
  if (typeof item.article.t != 'undefined') if (item.article.t.length) forEach(item.article.t, function(tag){
    if (!contains(locations[item.locationSlug].tags, tag))
      locations[item.locationSlug].tags.push(tag);
  });

  // add dates
  forEach(item.location.d, function(date) {
    if (!contains(locations[item.locationSlug].dates, date))
      locations[item.locationSlug].dates.push(date);
  });

};

var createMap = function(mapElt, locations) {

  var map = new google.maps.Map(mapElt, {
    center: new google.maps.LatLng(0,0),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
          { "weight": 1.3 },
          { "color": "#b5b5b5" }
        ]
      },{
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          { "visibility": "on" },
          { "color": "#ffffff" }
        ]
      },{
        "featureType": "road.arterial",
        "elementType": "labels.text",
        "stylers": [
          { "visibility": "on" },
          { "weight": 0.1 }
        ]
      },{
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          { "color": "#d8d8da" }
        ]
      },{
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
          { "color": "#ffffff" }
        ]
      },{
      }
    ]
  });

  return map;

};

var addMapBehavior = function(map, locations, eventHandler, params){

  params = extend({
    triggeredEvents: {markerSelect: 'newSelect'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail', resize: 'mapresize'},
    icons: { marker: 'images/markerIcon.png', smallMarker: 'images/smallMarkerIcon.png', markerGray: 'images/markerIconGray.png', smallMarkerGray: 'images/smallMarkerIconGray.png' }
  }, params);

  var enabled = true,
    bounds = false,

  init = function(){

    _addMarkers(locations);
    
    eventHandler.on(params.triggerEvents.loadSuccess, _updateHighlights);

    eventHandler.on(params.triggerEvents.loading, _disable);

    eventHandler.on(params.triggerEvents.resize, function(){

      google.maps.event.trigger(map, "resize");
      _fitBounds();
      
    });

    if (Object.size(locations)>1) for (slug in locations) {

      google.maps.event.addListener(locations[slug].marker, 'click', function(){
        if (enabled) eventHandler.trigger(params.triggeredEvents.markerSelect, { location: this.slug });
      });

    }

  },
  _updateHighlights = function(newParams) {

    if (newParams == undefined) newParams = {};
    
    if (newParams.category) {

      for (slug in locations) {

        locations[slug].marker.highlight = contains(locations[slug].categories, newParams.category);

      };

    } else if (newParams.from) {

      for (slug in locations) {

        locations[slug].marker.highlight = false;

        forEach (locations[slug].dates, function(date){
          
          if ((date >= newParams.from) && (date <= newParams.to)) {

            locations[slug].marker.highlight = true;

            return;

          }

        });

      }

    } else if (newParams.location) {

      for (slug in locations) {
        locations[slug].marker.highlight = false;
      };

      locations[newParams.location].marker.highlight = true;

    } else if (newParams.tag) {

    } else {

      for (slug in locations) {
        locations[slug].marker.highlight = true;
      };

    };

    _enable();

  },
  _highlightMarker = function(marker, highlight) {

    if (typeof highlight == 'undefined') highlight = true;

    marker.highlight = highlight;

  },
  _enable = function() {
    enabled = true;

    for (slug in locations) {
      if (locations[slug].marker.highlight) locations[slug].marker.setIcon(params.icons.marker);
      else locations[slug].marker.setIcon(params.icons.smallMarker);
    }

  },
  _disable = function() {
    enabled = false;

    for (slug in locations) {
      if (locations[slug].marker.highlight) locations[slug].marker.setIcon(params.icons.markerGray);
      else locations[slug].marker.setIcon(params.icons.smallMarkerGray);
    }
  },
  _addMarkers = function() {

    // create markers and associate them with locations
    for (slug in locations) {

      var position = new google.maps.LatLng(locations[slug].lat, locations[slug].lng);

      locations[slug].marker = new google.maps.Marker({
        position: position,
        title: locations[slug].placename,
        map: map,
        icon: params.icons.marker,
      });

      extend(locations[slug].marker, { slug: slug, highlight: true });

      if (!bounds) {
        bounds = new google.maps.LatLngBounds(position, position);
      } else {
        bounds.extend(position);
      }

    }

    // fit map to bounds

    _fitBounds();

  },
  _fitBounds = function() {

    if (bounds) {

      if (bounds.getNorthEast().distanceFrom(bounds.getSouthWest()) < 200) {
        map.setCenter(bounds.getCenter());
      } else {
        map.fitBounds(bounds);  
      }     

    }

  };

  if (typeof google.maps.LatLng.prototype.distanceFrom === 'undefined') {
    google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {

      if (newLatLng==undefined) return false;

      var dLat = (newLatLng.lat()-this.lat()) * Math.PI / 180;
      var dLon = (newLatLng.lng()-this.lng()) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.lat() * Math.PI / 180 ) * Math.cos(newLatLng.lat() * Math.PI / 180 )* Math.sin(dLon/2) * Math.sin(dLon/2);
      return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
  }


  init();

};

var addLocationListBehavior = function(locationListElem, locations, eventHandler, params) {

  params = extend({
    triggeredEvents: {locationSelect: 'newSelect'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail', resize: 'resize'},
    template: '<ul><% for (className in locationSlugSets) { %><% for (var i=0; i<locationSlugSets[className].length; i++) { var slug = locationSlugSets[className][i]; %><li class="<%= className %> filter-item" data-slug="<%= slug %>"><i class="icon-remove"></i><span class="placename"><%= locations[slug].placename %></span><span class="address"><%= locations[slug].address %></span></li><% } %><% } %></ul>',
    activeClass: 'active'
  }, params);

  var disabled = false, iscroll = false;

  var init = function() {

    var ejsTemplate = new EJS({ text: params.template });

    var render = ejsTemplate.render({locations: locations, locationSlugSets: splitLocations(locations)});

    locationListElem.innerHTML = render;

    // because not for ie8
    if (document.addEventListener) 
      iscroll = new iScroll('location-list-wrapper');
    else
      document.getElementById('location-list-wrapper').style.overflowY = 'scroll';

    if (Object.size(locations) > 1) forEach(locationListElem.getElementsByTagName('li'), function(listItem) {
      addEvent(listItem, 'click', function(e){
        if (disabled) return;
        eventHandler.trigger(params.triggeredEvents.locationSelect, {location: listItem.getAttribute('data-slug')});
      });

      addEvent(getElementsByClassName(listItem, 'icon-remove')[0], 'click', function(){
        if (disabled) return;
        eventHandler.trigger(params.triggeredEvents.locationSelect, {location: null});
      });
    });

    eventHandler.on(params.triggerEvents.loadSuccess, function(data){
      disabled = false;

      if (data.location) {
        forEach(locationListElem.getElementsByTagName('li'), function(listItem) { 

          if (listItem.getAttribute('data-slug')==data.location) {
            addClass(listItem, params.activeClass);
            if (iscroll) iscroll.scrollToElement(listItem);
          }

        });
      }

    });

    eventHandler.on(params.triggerEvents.resize, function() {
      if (iscroll) iscroll.refresh();
    });

    eventHandler.on(params.triggerEvents.loading, function(){
      disabled = true;

      forEach(locationListElem.getElementsByTagName('li'), function(listItem) { 
        removeClass(listItem, params.activeClass);
      });
      
    });

  };


  var splitLocations = function(locations) {

    var today = new Date(),
      section, d, split = {upcoming: [], passed: []};
    today.setHours(0,0,0,0);

    for (slug in locations) {

      section = 'passed';

      forEach(locations[slug].dates, function(date) {

        d = new Date(date);

        if (d>today) {
          section = 'upcoming';
          return;
        }

      });

      split[section].push(slug);

    };

    return split;

  };

  init();

};