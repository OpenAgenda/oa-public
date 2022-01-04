'use strict';

module.exports = location => ({
  locationName: location.name,
  locationUid: location.uid,
  address: location.address,
  postalCode: location.postalCode,
  city: location.city,
  district: location.district,
  department: location.department,
  region: location.region,
  latitude: location.latitude,
  longitude: location.longitude
});
