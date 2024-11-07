import { useCallback, useContext } from 'react';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext.js';

export default function useMapOnChange({
  input,
  loadGeoData,
  ref,
  userControlled,
}) {
  const {
    filtersOptions: { manualSubmit },
  } = useContext(FiltersAndWidgetsContext);

  return useCallback(
    (value) => {
      if (value && (!userControlled || manualSubmit)) {
        const { current: mapElem } = ref;
        loadGeoData(value.bounds, value.zoom)
          .then((data) => mapElem.setData(data?.reverse() ?? []))
          .catch((err) => {
            console.log('Failed to geo data', err);
          });
      }

      if (!userControlled) {
        return input.onChange(undefined);
      }

      const northEast = value.bounds.getNorthEast().wrap();
      const southWest = value.bounds.getSouthWest().wrap();

      input.onChange({
        northEast: {
          lat: northEast.lat,
          lng: northEast.lng,
        },
        southWest: {
          lat: southWest.lat,
          lng: southWest.lng,
        },
      });
    },
    [input, loadGeoData, ref, userControlled],
  );
}
