'use strict';

const labels = require('@openagenda/labels/agenda-locations/exportHeaders');
const flatten = require('@openagenda/labels/flatten');

module.exports = ({ lang }) => {
  const flatLabels = flatten(labels, lang);
  return location => Object.keys(location).reduce((mapped, field) => {
    mapped[flatLabels[field] || field] = location[field];
    return mapped;
  }, {});
}
