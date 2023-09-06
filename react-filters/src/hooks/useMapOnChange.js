import { useCallback } from 'react';

export default function useMapOnChange({ filter, input, loadGeoData, ref, userControlled }) {
  return useCallback(
    value => {
      if (!userControlled) {
        if (value) {
          const { current: mapElem } = ref;
          loadGeoData(filter, value.bounds, value.zoom)
            .then(data => mapElem.setData(data?.reverse() ?? []))
            .catch(err => {
              console.log('Failed to geo data', err);
            });
        }

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
    [filter, input, loadGeoData, ref, userControlled],
  );
}
