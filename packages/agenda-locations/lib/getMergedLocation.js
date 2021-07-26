'use strict';

module.exports = async (endpoints, identifiers, fetchedLocation, options) => {
  const mergedIn = fetchedLocation?.mergedIn || await endpoints.get(identifiers, { includeFields: ['mergedIn'], deleted: true }).then(res => res?.mergedIn);
  if (mergedIn) {
    return endpoints.get(mergedIn, options);
  }
/*   if(thrownon...) */
  return fetchedLocation;
};
