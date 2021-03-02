'use strict';

module.exports = data => {
  if (data?.ebd?.mp !== 'manual') {
    return null;
  }
  if (typeof data?.ebd?.mc === 'string') {
    const [neLat, neLng, swLat, swLng] = data.ebd.mc.split('|');

    return {
      newLat,
      neLng,
      swLat,
      swLng
    };
  }
  if (!data?.ebd?.mc?.neLat) {
    return data?.ebd?.mc;
  }
}