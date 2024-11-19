import _ from 'lodash';
import qs from 'qs';

export default function defineRelativePart(attr, hash = null) {
  const query = {};
  let path = '';

  if (attr.query) {
    Object.assign(query, qs.parse(attr.query));
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

  // path can only be root or /events. Other pages are not handled
  const cleanPath = /^($|\/events|\/p\/)/.test(path) ? path : '';

  return (
    cleanPath + (Object.keys(query).length ? `?${qs.stringify(query)}` : '')
  );
}

export function removePreFromRelativePart(relativePart) {
  const [path, query] = relativePart.split('?');

  if (!query) {
    return path;
  }

  return [path, qs.stringify(_.omit(qs.parse(query ?? ''), ['pre']))].join('?');
}

export function appendPreToNav(nav, pre) {
  const [path, queryString] = nav.split('?');
  const query = qs.parse(queryString);
  const preQuery = pre?.length ? qs.parse(pre) : {};

  if (Object.keys(preQuery).length) {
    query.pre = preQuery;
  }

  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
}
