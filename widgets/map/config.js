module.exports = {
  //                  0        1       2      3       4        5       6     7      8      9     10    11    12  13  14  15 16 17 18
  zoomToDistance: [ 500000, 500000, 500000, 300000, 150000, 100000, 80000, 40000, 20000, 10000, 3000, 1000, 300, 50, 25, 10, 5, 3, 2 ],
  lang: 'en',
  langAttribute: 'data-lang',
  auto: false, // syncronize selection with map
  popup: false,
  tiles: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
  onBoundsChangeCallback: false,
  zooming: false,
  labels: {
    fr: {
      mapSync: 'rechercher quand je déplace la carte',
      events: 'événements'
    },
    en: {
      mapSync: 'search when I move the map',
      events: 'events'
    },
    es: {
      mapSync: 'busca cuando el mapa cambia',
      events: 'eventos'
    },
    de: {
      mapSync: 'suchen, wenn ich die Karte verschiebe',
      events: 'veranstaltungen'
    },
    ar: {
      mapSync: 'إبحت عندما أزيح الخيطة',
      events: 'أحداث'
    }
  },
  selectors: {
    sync: '.js_sync_checkbox'
  },
  selectedLocation: false,
  selectedBounds: false,
  activeLocations: [],
  icons: {
    active: { 
      icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png', 
      anchor: [9, 25], 
      size: [18,25] 
    },
    inactive: { 
      icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIconGray.png',
      anchor: [9, 25], 
      size: [18,25] 
    }
  },
  leafletCss: "//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.css",
  leafletCssIE: "//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.ie.css",
  locations: {}
}