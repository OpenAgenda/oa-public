'use strict';

const includeFields = [
  'uid',
  'slug',
  'name',
  'address',
  'city',
  'region',
  'department',
  'postalCode',
  'insee',
  'countryCode',
  'district',
  'latitude',
  'longitude',
  'updatedAt'
];

const getLocations = (services, uids, options) => services.agendaLocations
  .list({ uids }, { limit: uids.length }, {
    detailed: true,
    includeFields
  });

module.exports = {
  promise: getLocations,
  callback: (services, uids, options, cb) => getLocations(services, uids, options).then(cb.bind(null, null), cb)
};