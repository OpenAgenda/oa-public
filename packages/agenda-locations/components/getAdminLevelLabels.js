'use strict';

/* [{
  countryCode: 'FR',
  adminLevels: [{
      level: 1,
      label: 'adminLevel1_FR'
  }]
}, {
  countryCode: 'AF',
  adminLevels: [{
      level: 1 -> `adminLevel${country.adminLevels[i].level}_${countryCode}`
  }, {
      level: 4
  }]
}] */

const getAdminLabels = (obj, country, Adlevel) => {
  if (obj.find(e => e.countryCode === country)) {
    return obj.find(e => e.countryCode === country).label;
  }
  return `adminLevel${Adlevel}`;
};

const getUsefullAdminLevels = (obj, country) => obj.find(e => e.countryCode === country).adminLevels.map(e => e.level);