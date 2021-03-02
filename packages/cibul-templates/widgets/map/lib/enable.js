'use strict';

const { map } = require("core-js/fn/array");

const getResetCluster = (state, navHistory, reqParams) => {
  if (!state.clusterInitialized) {
    return true;
  }

  const current = navHistory.get();

  if (current.uid !== reqParams.uid) {
    // if there is a change in opened event,
    // cluster must be reset only if markerCount changed
    if (state.cluster.markerCount < state.activeLocations.length) {
      return true;
    } else if (nonMapQueryChange(reqParams, current)) {
      return true;
    }

    if (current.neLat < reqParams.neLat) return true;
    if (current.neLng < reqParams.neLng) return true;
    if (current.swLat > reqParams.swLat) return true;
    if (current.swLng > reqParams.swLng) return true;

    return false;
  }
}

const nonMapQueryChange = (reqParams, current) => {
  for (const key of Object.keys({
    ...current,
    ...reqParams
  })) {
    if (['neLat', 'neLng', 'swLat', 'swLng', 'location'].contains(key)) {
      continue;
    }
    if (JSON.stringify(reqParams[key]) !== JSON.stringify(current[key])) {
      return true;
    }
  }
  return false;
}

const sleep = ms => new Promise(rs => setTimeout(rs, ms));

const applyZoomLimit = async (state, map) => {
  if (map.utils.getZoom(map) < state.zoomLimits.min) {
    map.utils.setZoom(map, state.zoomLimits.min);
  } else if (map.utils.getZoom(map) > state.zoomLimits.max) {
    map.utils.setZoom(map, state.zoomLimits.max);
  }
}

module.exports = async (state, map, navHistory, reqParams) => {
  state.enabled = false;

  const resetCluster = getResetCluster(state, navHistory, reqParams);

  if (navHistory.matchCurrent(reqParams)) {
    state.enabled = true;
    return;
  }

  if (navHistory.matchPrev(reqParams)) {
    map.utils.fitBounds(map, await navHistory.back());
  } else if (reqParams.neLat && navHistory.current()) {
    navHistory.add(reqParams, navHistory.current());
  } else if (reqParams.uid) {
    map.utils.fitBounds(map, await navHistory.)
  }

  applyZoomLimit(state, map);

  await sleep(500);

  state.enabled = true;
}


