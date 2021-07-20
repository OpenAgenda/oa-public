export default function extractAttrs(el, prefix = 'data-oa-filter-') {
  const attrs = {};

  for (const attr of el.attributes) {
    if (attr.name.startsWith(prefix)) {
      const name = attr.name.slice(prefix.length);

      attrs[name] = attr.value;
    }
  }

  return attrs;
}
