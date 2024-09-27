import { Transform } from 'node:stream';
import labels from '@openagenda/labels/agenda-locations/exportHeaders.js';
import flatten from '@openagenda/labels/flatten.js';

export default ({ lang }) => {
  const flatLabels = flatten(labels, lang);

  return new Transform({
    objectMode: true,
    transform(location, encoding, cb) {
      cb(
        null,
        Object.keys(location).reduce((mapped, field) => {
          mapped[flatLabels[field] || field] = location[field];
          return mapped;
        }, {}),
      );
    },
  });
};
