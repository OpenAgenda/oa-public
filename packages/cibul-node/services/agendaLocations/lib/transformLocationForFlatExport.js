'use strict';

const { Transform } = require('stream');

const labels = require('@openagenda/labels/agenda-locations/exportHeaders');
const flatten = require('@openagenda/labels/flatten');

module.exports = ({ lang }) => {
  const flatLabels = flatten(labels, lang);

  return new Transform({
    objectMode: true,
    transform(location, encoding, cb) {
      cb(null, Object.keys(location).reduce((mapped, field) => {
        mapped[flatLabels[field] || field] = location[field];
        return mapped;
      }, {}));
    }
  });
}
