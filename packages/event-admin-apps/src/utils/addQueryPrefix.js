export default function addQueryPrefix(query, prefix = 'q.') {
  const result = {};

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      result[`${prefix}${key}`] = query[key];
    }
  }

  return result;
}
