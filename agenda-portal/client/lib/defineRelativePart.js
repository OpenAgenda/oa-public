const _ = require('lodash');
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

  if (attr.randomFromSet && attr.count) {
    Object.assign(query, {
      subsetRandom: attr.count,
      limit: attr.randomFromSet,
    });
  } else if (attr.count) {
    query.limit = attr.count;
  }

  if (attr.lang) {
    query.lang = attr.lang;
  }

  if (attr.pre) {
    query.pre = attr.pre;
  }

  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
};

module.exports.removePreFromRelativePart = function removePreFromRelativePart(
  relativePart,
) {
  const [path, query] = relativePart.split('?');

  if (!query) {
    return path;
  }

  return [path, qs.stringify(_.omit(qs.parse(query ?? ''), ['pre']))].join('?');
};
