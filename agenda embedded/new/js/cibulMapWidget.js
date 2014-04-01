(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulMapWidget = cibulWidget({
      name: 'map',
      map: false,
      //                 0        1       2      3       4        5       6     7      8      9     10    11    12  13  14  15 16 17 18
      zoomToDistance: [500000, 500000, 500000, 300000, 150000, 100000, 80000, 40000, 20000, 10000, 3000, 1000, 300, 50, 25, 10, 5, 3, 2],
      lang: 'en',
      auto: false, // syncronize selection with map
      popup: false,
      tiles: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
      labels: {
        fr: {
          mapSync: 'rechercher quand je déplace la carte',
          events: 'événements'
        },
        en: {
          mapSync: 'search when I move the map',
          events: 'events'
        }
      },
      selectors: {
        sync: '.js_sync_checkbox'
      },
      selectedLocation: false,
      selectedBounds: false,
      activeLocations: [],
      icons: {
        active: { icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png', anchor: [9, 25], size: [18,25] },
        inactive: { icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIconGray.png', anchor: [9, 25], size: [18,25] }
      },
      locations: {},
      templates: {
        main: '<div class="map-canvas"></div><div class="map-sync"><label><%= labels.mapSync %></label><input class="js_sync_checkbox" type="checkbox"/></div>',
        popup: '<div class="map-location"><% if (typeof count !== \'undefined\') { %><span class="count"><span><%= count %></span><label> <%= count==1?labels.events.replace(\'s\', \'\'):labels.events %></label></span><% } %><% if (typeof image !== \'undefined\') { %><img src="<%= image %>"/><% } %><span><p><%= placename %></p><span><%= address %></span></span></div>'
      },


      /**
       * where it all begins. pick out config, create map, put markers, bind sync checkbox and chew bubblegum.
       */
      
      init: function(ctl, config) {

        var self = this;

        this.initTiles(ctl);

        this.initMapSettings(config);

        this.initLocations(ctl);

        this.initIcons(ctl);

        this._create({labels: this.labels[this.lang]});

        this.createMap(function(map) {

          self.map = map;

          self.setMapToDefaultBounds();

          self.initMarkers();

        });

        this.bindSync();

      },

      /**
       * called by the controller to signal the map can be used.
       * the widget ensures that bounds, pop ups are displayed in concordance
       * with current request parameters (bounds or location)
       */

      enable: function(reqParams) {

        this.updateBounds(reqParams);

        if (!reqParams.location) this.selectedLocation = false;

        if (!reqParams.neLat && this.selectedBounds) {

          this.selectedBounds = false;

          if (!this.selectedLocation && !reqParams.uid) this.setMapToDefaultBounds();

        }

        if (reqParams.neLat && !this.selectedBounds) {

          this.selectedBounds = { neLat: reqParams.neLat, neLng: reqParams.neLng, swLat: reqParams.swLat, swLng: reqParams.swLng };

        }

        if (reqParams.uid || this.selectedLocation) this.deactivateSync();

        if (reqParams.location) {

          this.selectedLocation = this.locations[reqParams.location];

          this.popup = this.m.createPopup(this.map, new EJS({ text: this.templates.popup }).render(extend({labels: this.labels[this.lang]}, this.selectedLocation)), { marker: this.selectedLocation.marker });

        }

      },

      clear: function() {

        this.activeLocations = [];

        if (this.popup) this.m.removePopup(this.popup);

        for (var l in this.locations) {
          this.locations[l].count = 0;
        }

      },

      include: function(eItem) {

        for (var l in eItem.l) {

          if (!contains(this.activeLocations, l)) {
            this.activeLocations.push(l);
          }

          this.locations[l].count += 1;
        }

      },
      
      
      refresh: function() {
        
        if (this.selectedLocation) {
          
          this.activeLocations = [this.selectedLocation.slug];

          this.m.setCenter(this.map, this.selectedLocation.coords);

        }

        for (var l in this.locations) {
          this.refreshMarker(this.locations[l]);
        }

      },


      getBoundParams: function(bounds) {

        if (typeof bounds == 'undefined') bounds = this.m.getBounds(this.map);

        var ne = this.m.getBoundsNorthEast(bounds),

        sw = this.m.getBoundsSouthWest(bounds);

        return { neLat: ne[0], neLng: ne[1], swLat: sw[0], swLng: sw[1] };

      },


      /**
       * use map bounds as filter
       */
      
      selectBounds: function(bounds) {

        this.selectedBounds = this.getBoundParams(bounds);

        this._select(extend({location: null}, this.selectedBounds));

      },


      /**
       * update map bounds
       */
      
      updateBounds: function(corners) {

        if (!corners.neLat) return;

        if (this.getBoundParams().neLat == corners.neLat) return;

        var self = this,

        auto = self.auto,

        bounds = this.m.createBounds([corners.neLat, corners.neLng]);

        this.m.extendBounds(bounds, [corners.swLat, corners.swLng]);

        this.auto = false;

        this.m.fitBounds(this.map, bounds);

        // takes a while for map to adjust
        
        setTimeout(function() {

          self.auto = auto;

        }, 500);

      },


      /**
       * default bounds encapsulate all the locations
       */
      
      setMapToDefaultBounds: function() {

        if (!Object.size(this.locations)) return;

        if (typeof this.defaultBounds !== 'undefined') {

          this.m.fitBounds(this.map, this.defaultBounds);

          return;

        }

        for (var l in this.locations) break; // Errrhh..

        this.defaultBounds = this.m.createBounds(this.locations[l].coords);

        for (l in this.locations) {

          this.m.extendBounds(this.defaultBounds, this.locations[l].coords);

        }

        this.m.fitBounds(this.map, this.defaultBounds);

      },
      

      /**
       * well guess. Also, calls select bounds if no location is picked and auto mode is on
       */
      
      createMap: function(onReady) {

        var self = this;

        var center = [48.8705187,2.3821144];

        if (Object.size(this.locations)) {
          
          for (var s in this.locations) break;

          center = this.locations[s].coords;

        }

        this.m.createMap(el(this.element, 'div'), { center: center, onReady: function(map) {

          onReady(map);

          self.m.setOnBoundsChangeEnd(map, function() {

            if (self.enabled && self.auto && !self.selectedLocation) self.selectBounds();

          });

        }});

      },


      initIcons: function(ctl) {

        if (!ctl.ebd || !ctl.ebd.mi) return;

        if (ctl.ebd.mi.a) {

          this.icons.active.icon = ctl.ebd.mi.a;
          this.icons.active.anchor = [ctl.ebd.ms.a[0]/2, ctl.ebd.ms.a[1]];
          this.icons.active.size = [ctl.ebd.ms.a[0], ctl.ebd.ms.a[1]];

        }

        if (ctl.ebd.mi.i) {

          this.icons.inactive.icon = ctl.ebd.mi.i;
          this.icons.inactive.anchor = [ctl.ebd.ms.i[0]/2, ctl.ebd.ms.i[1]];
          this.icons.inactive.size = [ctl.ebd.ms.i[0], ctl.ebd.ms.i[1]];

        }

      },

      initTiles: function(ctl) {

        if (!ctl.ebd || !ctl.ebd.mt) return;

        this.tiles = ctl.ebd.mt;

      },


      /**
       * create widget location index
       */
      
      initLocations: function(ctl) {

        for (var a in ctl.a)
          for (var l in ctl.a[a].l) {

            if (typeof this.locations[l] == 'undefined') {

              this.locations[l] = {
                placename: ctl.a[a].l[l].p,
                city: ctl.a[a].l[l].ct,
                address: ctl.a[a].l[l].a,
                slug: l,
                coords: [ctl.a[a].l[l].lt, ctl.a[a].l[l].lg]
              };

            }

          }

      },


      /**
       * put the markers on the map
       */
      
      initMarkers: function() {

        for (var l in this.locations) {

          var location = this.locations[l];

          location.marker = this.m.createMarker(this.map, {
            position: location.coords,
            icon: this.icons.inactive.icon,
            anchor: this.icons.inactive.anchor
          });

          this.setOnMarkerClick(location);

          this.refreshMarker(location);
        }

      },
      setOnMarkerClick: function(location) {

        var self = this;

        this.m.setOnMarkerClick(location.marker, function() {

          // if there are neighbors, redefine bounds

          var neighborhoodBounds = self.getNeighborBounds(location);

          if (neighborhoodBounds) return self.selectBounds(neighborhoodBounds);

          // there are no neighbords. select location as new filter

          if (!self.selectedLocation && !contains(self.activeLocations, location.slug)) return;

          self.selectedBounds = false;

          self.deactivateSync();

          self._select({location: location.slug, neLat: null, neLng: null, swLat: null, swLng: null});

        });
      },


      /**
       * update marker icon to match location state
       */
      
      refreshMarker: function(location) {

        var active = (this.enabled && contains(this.activeLocations, location.slug));

        this.m.setMarkerIcon(location.marker, this.icons[active?'active':'inactive']);

        this.m.setMarkerZIndex(location.marker, active?1000:-1000);

      },


      /**
       * extract widget config info: lang, map type, tiles
       */
      
      initMapSettings: function(config) {

        if (config.length > 1) this.lang = config[1];

        if (config[2]=='google') {

          this._log('using google maps');

          this.m = maps.use('google');

          return;

        }

        this._log('using osm maps with tiles ' + this.tiles);
      
        if (typeof document.createStyleSheet == "undefined") {
          el('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" type="text/css" href="//cdn.leafletjs.com/leaflet-0.6.4/leaflet.css">');
        } else {

          document.createStyleSheet("//cdn.leafletjs.com/leaflet-0.6.4/leaflet.css");
          document.createStyleSheet('"//cdn.leafletjs.com/leaflet-0.6.4/leaflet.ie.css"');

        }


        this.m = maps.use('osm', {url: this.tiles});

      },


      /**
       * bind sync checkbox with auto parameter
       */
      
      bindSync: function() {

        var self = this;

        addEvent(el(this.element, self.selectors.sync), 'change', function(e) {

          self.auto = !self.auto;

          if (!self.selectedLocation) if (self.auto) {

            self.selectBounds();

          } else {

            self._select({neLat: null, neLng: null, swLat: null, swLng: null, location: null});

          }

        });

      },

      deactivateSync: function() {

        this.auto = false;

        el(this.element, this.selectors.sync).checked = false;

      },


      /**
       * get bounds showing location and its neighbors defined as per the zoomToLocation threshold
       * 
       * @param  object location   - the subject location
       * @return boolean/bounds    - false if no neighbors, bounds if there are
       */
      
      getNeighborBounds: function(location) {

        var bounds = false,

        distanceThreshold = this.zoomToDistance[this.m.getZoom(this.map)];

        for (var l in this.locations) {

          // is this is a neighbor?
          if ((l!==location.slug) && this.distance(this.locations[l].coords[0], this.locations[l].coords[1], location.coords[0], location.coords[1]) < distanceThreshold) {

            if (!bounds) bounds = this.m.createBounds(location.coords);

            this.m.extendBounds(bounds, this.locations[l].coords);
          }

        }

        return bounds;
        
      },


      /**
       * calculate distance between two points
       */
      distance: function(lat1, lon1, lat2, lon2) {
  
        var radlat1 = Math.PI * lat1/180,
        
        radlat2 = Math.PI * lat2/180,
        
        radlon1 = Math.PI * lon1/180,
        
        radlon2 = Math.PI * lon2/180,
        
        radtheta = Math.PI * (lon1-lon2)/180;
        
        return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));
      },
    
    });

    new cibulMapWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgmp', onLoad);
  },

  scripts = ['//cdn.leafletjs.com/leaflet-0.6.4/leaflet.js'];

  if (typeof cibulControllers == 'undefined') scripts.push('//cibul.net/js/embed/cibulWidgetLib.js');
  
  loadJs(scripts, run);

})();