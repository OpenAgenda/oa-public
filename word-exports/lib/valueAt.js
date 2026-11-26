// The value at a dotted path (`location.city`, a sub-schema's `parent.child`),
// or undefined when any step is missing.
export default function valueAt(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}
