import { Transform } from 'node:stream';
import labels from '@openagenda/labels/agenda-locations/exportHeaders.js';
import flattenLabels from '@openagenda/labels/flatten.js';

const flatten = (obj, lang) => {
  if (typeof obj === 'string') {
    return obj;
  }
  return obj[lang] ?? obj[Object.keys(obj)[0]];
};

export default ({ lang }) => {
  const flatLabels = flattenLabels(labels, lang);

  return new Transform({
    objectMode: true,
    transform(location, encoding, cb) {
      cb(
        null,
        Object.keys(location).reduce((mapped, field) => {
          mapped[flatLabels[field] || field] = ['access', 'description'].includes(field) && location[field]
            ? flatten(location[field], lang)
            : location[field];
          return mapped;
        }, {}),
      );
    },
  });
};
