'use strict';

const includeFields = [
  'uid', 'setUid', 'slug', 'name', 'address',
  'countryCode', 'adminLevel1', 'adminLevel2',
  'adminLevel3', 'city', 'adminLevel5',
  'district', 'postalCode', 'insee', 'latitude', 'longitude',
  'region', 'department', 'timezone',
  'updatedAt', 'createdAt', 'image', 'description', 'tags',
  'website', 'email', 'phone', 'links', 'access',
  'state', 'imageCredits', 'extId',
  'duplicateCandidates', 'disqualifiedDuplicates',
  'mergedIn', 'agendaUid'
];

const getLocations = (services, uids) => {
  if (!uids) return [];

  return services.agendaLocations
    .list({ uids }, { limit: uids.length }, {
      detailed: true,
      includeFields,
      deleted: null
    });
};

module.exports = {
  promise: getLocations,
  callback: (services, uids, options, cb) => getLocations(services, uids, options).then(cb.bind(null, null), cb)
};
