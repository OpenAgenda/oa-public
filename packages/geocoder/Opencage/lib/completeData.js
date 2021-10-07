'use strict';

const checkEveryLevel = (location, level) => {
  let updated = { ...location };
  const adminLevelName = Object.keys(level).find(key => key.match(/adminLevel/));
  if (!adminLevelName) return updated;
  level[adminLevelName].forEach(lvl => {
    if (lvl.$set && location[adminLevelName] === lvl.name) {
      const setAdminLevel = Object.keys(lvl.$set).find(key => key.match(/adminLevel/));
      updated = { ...updated, [setAdminLevel]: lvl.$set[setAdminLevel] };
    }
    if (lvl.name === location[adminLevelName]) {
      updated = checkEveryLevel(updated, lvl);
    }
  });
  return updated;
};

const completeData = (location, geoTree) => {
  let updated = { ...location };
  geoTree.forEach(country => {
    if (country.name === location.countryCode.toUpperCase()) {
      updated = checkEveryLevel(location, country);
    }
  });
  return updated;
};

module.exports = completeData;
