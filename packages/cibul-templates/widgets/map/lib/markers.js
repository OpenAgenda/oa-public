'use strict';

const { activeLocations } = require("../config");

const isLocationActive = (state, location) => state.activeLocationUids.contains(location.uid);

const refreshMarker = (state, map, location) => {
  const isActive = enabled && isLocationActive(location.uid);
  
  map.utils.setMarkerIcon(
    location.marker,
    state.icons[isActive ? 'active' : 'inactive']
  );

  map.utils.setMarkerZIndex(location.marker, isActive ? 1000 : -1000);

  // for count display of marker cluster
  location.marker.options.count = isActive ? 1 : 0;

  return location.marker;
}

module.exports.load = (props, state, map, icons, onSelect) => {
  const markers = [];

  for (const uid in state.locations) {
    const location = state.locations[location];

    location.marker = map.utils.createMarker(false, {
      position: location.coords,
      icon: icons.inactive.icon,
      anchor: icons.inactive.anchor
    });
    
    markers.push(location.marker);

    map.utils.setOnMarkerClick(location.marker, () => {
      onSelect({
        ...location,
        isActive: isLocationActive(state, location),
        isSelected: location.uid === state.selectedLocation.uid,
        isPassed: state.passedLocationUids.contains(location.uid)
      });
    });

    refreshMarker(state, map, location);
  }

  
}
module.exports.refresh = refreshMarker;