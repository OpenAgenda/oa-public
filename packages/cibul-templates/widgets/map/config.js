'use strict';

const labels = require('@openagenda/labels/agendas/map');

module.exports = {
  //                  0        1       2      3       4        5       6     7      8      9     10    11    12  13  14  15 16 17 18
  zoomToDistance: [ 500000, 500000, 500000, 300000, 150000, 100000, 80000, 40000, 20000, 10000, 3000, 1000, 300, 50, 25, 10, 5, 3, 2 ],
  lang: 'en',
  langAttribute: 'data-lang',
  coordAttribute: 'data-coords',
  tilesAttribute: 'data-tiles',
  auto: false, // syncronize selection with map
  popup: false,
  minZoom: 2,
  maxZoom: 16,
  clusterThreshold: 10,
  onBoundsChangeCallback: false,
  zooming: false,
  labels: Object.keys(labels.mapSync).reduce((byLang, lang) => ({
    ...byLang,
    [lang]: Object.keys(labels).reduce((byLabel, label) => ({
      ...byLabel,
      [label]: labels[label][lang]
    }), {})
  }), {}),
  selectors: {
    sync: '.js_sync_checkbox'
  },
  selectedLocation: false,
  selectedBounds: false,
  activeLocations: [],
  leafletCss: "//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.css",
  leafletCssIE: "//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.ie.css",
  locations: {}
}
