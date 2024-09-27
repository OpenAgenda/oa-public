'use strict';

const mapLib = require('../../../js/lib/osm.maps');
const tpl = require('./main.ejs');

const SYNC_SECTION_SELECTOR = '.js_map_sync';

const createMap = (mapUtils, elem, { center, zoom }) => new Promise(rs => {
  mapUtils.createMap(elem, {
    center,
    zoom,
    onReady: map => {
      rs(map);
    }
  })
});

module.exports = async (props, state, { labels }) => {
  const mapUtils = mapLib({
    url: props.tiles
  });

  const div = document.createElement('div');

  div.innerHTML = tpl({
    labels: labels[props.lang]
  });

  if (elem.querySelector(SYNC_SECTION_SELECTOR)) {
    div.removeChild(div.querySelector(SYNC_SECTION_SELECTOR));

    div.appendChild(elem.querySelector(SYNC_SECTION_SELECTOR));
  }

  elem.innerHTML = div.innerHTML;

  const map = await createMap(mapUtils, elem.querySelector('div'), {
    center: state.center,
    zoom: state.zoom
  });

  map.utils = mapUtils;
  map.utils.defineBoundsFromCorners = ({ neLat, neLng, swLat, swLng }) => {
    const b = mapUtils.createBounds([neLat, neLng]);
    mapUtils.extendBounds(b,[swLat, swLng]);
    return b;
  }
  map.utils.getMapCorners = map => {
    const bounds = mapUtils.getBounds(map);
    const [neLat, neLng] = mapUtils.getBoundsNorthEast(bounds);
    const [swLat, swLng] = mapUtils.getBoundsSouthWest(bounds);
    return {
      neLat, neLng, swLat, swLng
    };
  };

  return map;
}

