'use strict';

const log = require('debug')('initialState');

module.exports = attr => {
  const state = {
    uid: null,
    enablesCount: 0,
    lang: 'en',
    center: [48.8705187, 2.3821144],
    zoom: 15,
    tiles: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    embedMode: false,
    explicitInitialPosition: false,
    focusOnEventUid: null,
    applyDefaultStyle: false,
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
    }
  };

  state.uid = attr.cbctl[0];

  if (attr.cbctl[0].split('/').length === 2) {
    state.embedMode = true;
  }
  if (attr.cbctl.length === 2) {
    state.lang = attr.cbctl[1];
  }
  if (attr.lang) {
    state.lang = attr.lang;
  }
  if (attr.coords) {
    state.center = [
      parseFloat(attr.coords[0]),
      parseFloat(attr.coords[1])
    ];
    state.explicitInitialPosition = true;
  }
  if (attr.coords && attr.coords.length === 3) {
    state.zoom = parseFloat(attr.coords[2]);
  }
  if (attr.latitude && attr.longitude) {
    state.center = [parseFloat(attr.latitude), parseFloat(attr.longitude)];
    state.explicitInitialPosition = true;
  }
  if (attr.zoom) {
    state.zoom = parseFloat(attr.zoom);
  }
  if (attr.tiles) {
    state.tiles = attr.tiles;
  }
  if (!attr.style || attr.style === 'default') {
    state.applyDefaultStyle = true;
  }
  if (attr.eventUid) {
    state.focusOnEventUid = parseInt(attr.eventUid);
  }

  return state;
}