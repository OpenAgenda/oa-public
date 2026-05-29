import { Transform } from 'node:stream';
import labels from '@openagenda/labels/agenda-locations/exportHeaders.js';
import flattenLabels from '@openagenda/labels/flatten.js';

const flatten = (obj, lang) => {
  if (typeof obj === 'string') {
    return obj;
  }
  return obj[lang] ?? obj[Object.keys(obj)[0]];
};

export default ({ lang, includeFields, tagGroups = [] }) => {
  const flatLabels = flattenLabels(labels, lang);

  // One column per location tag group (e.g. Ministry of Culture agendas).
  // The tag set is already flattened to `lang` by flattenLocationTagSet, so
  // group names and tag labels are plain strings here.
  const groupHeaders = tagGroups.map((group) => group.name);
  const tagIdToGroup = new Map();
  const tagIdToLabel = new Map();
  for (const group of tagGroups) {
    for (const tag of group.tags) {
      tagIdToGroup.set(String(tag.id), group.name);
      tagIdToLabel.set(String(tag.id), tag.label);
    }
  }

  return new Transform({
    objectMode: true,
    transform(location, encoding, cb) {
      if (location.extIds) {
        location.extIds = location.extIds
          .map((extId) => extId.value)
          .join(', ');
      }

      const mapped = includeFields.reduce((carry, field) => {
        carry[flatLabels[field] || field] = ['access', 'description'].includes(field) && location[field]
          ? flatten(location[field], lang)
          : location[field] ?? '';
        return carry;
      }, {});

      if (groupHeaders.length) {
        const byGroup = Object.fromEntries(
          groupHeaders.map((header) => [header, []]),
        );

        for (const tag of location.tags ?? []) {
          const group = tagIdToGroup.get(String(tag.id));
          if (group === undefined) {
            continue;
          }
          byGroup[group].push(
            tagIdToLabel.get(String(tag.id)) ?? flatten(tag.label, lang),
          );
        }

        // Always emit every group column (even empty) so the xlsx/csv column
        // set stays consistent across rows.
        for (const header of groupHeaders) {
          mapped[header] = byGroup[header].join(', ');
        }
      }

      cb(null, mapped);
    },
  });
};
