import _ from 'lodash';

function applyTransform(transformFunction, data, keys) {
  if (keys === 'timings') return transformFunction(data);
  return transformFunction(...[].concat(keys).map((k) => _.get(data, k)));
}

function flattenSourceValues(mapItem, src, options) {
  const { source, transform, languages, default: defaultItem = null } = mapItem;

  const { separator = ' | ', includeLanguages } = options;

  const lang = includeLanguages || languages;

  if (transform instanceof Function) {
    return applyTransform(transform, src, source);
  }

  if (transform) {
    return []
      .concat(_.get(src, source))
      .map((s) => _.get(transform, s, defaultItem || null))
      .filter((s) => s)
      .join(separator);
  }

  if (lang && languages && _.get(src, source)) {
    return lang.map((l) => _.get(src, `${source}.${l}`));
  }

  return _.get(src, source, defaultItem || null);
}

function flatten(map, src, options = {}) {
  return map.reduce((flattened, mapItem) => {
    const { target } = mapItem;

    const flattenedValue = flattenSourceValues(mapItem, src, options);

    if (_.isArray(target)) {
      Object.assign(
        flattened,
        target.reduce(
          (carry, targetField, index) =>
            flattenedValue && {
              ...carry,
              [targetField]: flattenedValue[index] || null,
            },
          {},
        ),
      );
    } else {
      flattened[target] = flattenedValue;
    }
    return flattened;
  }, {});
}

const Flattener = (map, options) => (src) => flatten(map, src, options);
Flattener.flatten = flatten;
Flattener.flattenSourceValues = flattenSourceValues;

export default Flattener;
export { flatten };
export { flattenSourceValues };
