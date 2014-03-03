(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  var onLoad = function(element, register) {

    var cibulMapWidget = cibulWidget({
      name: 'map',
      map: false,
      lang: 'en',
      auto: false, // syncronize selection with map
      tiles: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
      labels: {
        fr: {
          mapSync: 'mettre à jour la liste quand je déplace la carte'
        },
        en: {
          mapSync: 'update list when I move the map'
        },
      },
      selectors: {
        sync: '.js_sync_checkbox'
      },
      selectedLocation: false,
      activeLocations: [],
      icons: {
        active: { icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png', anchor: [9, 25] },
        inactive: { icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIconGray.png', anchor: [9, 25] }
      },
      locations: {},
      templates: {
        main: '<div class="map-canvas"></div><div class="map-sync"><label><%= labels.mapSync %></label><input class="js_sync_checkbox" type="checkbox"/></div>',
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

      enable: function(reqParams) {

        this.selectedLocation = reqParams.location?this.locations[reqParams.location]:false;

      },

      clear: function() {

        this.activeLocations = [];

      },

      include: function(eItem) {

        for (var l in eItem.l)
          if (!contains(this.activeLocations, l)) this.activeLocations.push(l);

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


      /**
       * use map bounds as filter
       */
      
      selectBounds: function() {
        
        var bounds = this.m.getBounds(this.map),

        ne = this.m.getBoundsNorthEast(bounds),
        
        sw = this.m.getBoundsSouthWest(bounds);

        this._select({neLat: ne[0], neLng: ne[1], swLat: sw[0], swLng: sw[1], location: null});

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

            if (self.auto && !self.selectedLocation) self.selectBounds();

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
                slug: l,
                coords: [ctl.a[a].l[l].lt, ctl.a[a].l[l].lg],
                count: 0
              };

            }

            this.locations[l].count++;

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
      
        el('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css">');

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

      }
    
    });

    new cibulMapWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgmp', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs(['//cdn.leafletjs.com/leaflet-0.6.4/leaflet.js', '//cibul.net/js/embed/cibulWidgetLib.js'], run);

})();