import _ from 'lodash';

export default function deeply(map) {
  return (obj, fn) =>
    map(
      _.mapValues(obj, (v) => (_.isPlainObject(v) ? deeply(map)(v, fn) : v)),
      fn,
    );
}
