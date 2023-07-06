const qs = require('qs');

module.exports = function defineRelativePart(attr, hash = null) {
  const query = {};
  let path = '';

  if (attr.query) {
    Object.assign(qs.parse(attr.query));
  } else if (hash) {
    const [hashPath, hashQuery] = hash.split('?');

    Object.assign(query, hashQuery ? qs.parse(hashQuery) : {});
    path = hashPath;
  }

  if (attr['data-random-from-set'] && attr['data-count']) {
    Object.assign(query, {
      subsetRandom: attr['data-count'],
      limit: attr['data-random-from-set'],
    });
  } else if (attr['data-count']) {
    query.limit = attr['data-count'];
  }

  if (attr['data-lang']) {
    query.lang = attr['data-lang'];
  }

  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
};
