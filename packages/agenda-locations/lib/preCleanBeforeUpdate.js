import { produce } from 'immer';

export default produce((draft, options = {}) => {
  const { geocodeResult, isPatch } = options;

  if (geocodeResult?.latitude && isPatch) {
    Object.assign(draft, {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
    });
  } else if (geocodeResult) {
    Object.assign(draft, geocodeResult);
  }
});
