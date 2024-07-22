import OpenCage from '@openagenda/geocoder/Opencage/index.js';

export function init(config) {
  return OpenCage(config.opencage);
}
