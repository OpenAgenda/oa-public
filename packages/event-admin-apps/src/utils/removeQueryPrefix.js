export default function removeQueryPrefix(query, prefix = 'q.') {
  const result = {};
  const rest = {};

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      if (key.startsWith(prefix)) {
        result[key.slice(prefix.length)] = query[key];
      } else {
        rest[key] = query[key];
      }
    }
  }

  return { query: result, rest };
}
