// Escape LIKE wildcards so a user-typed % or _ matches literally instead of
// acting as a wildcard (MySQL LIKE uses \ as its default escape character).
export default function escapeLike(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}
