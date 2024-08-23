export default (entry, options = {}) => {
  const { removed } = options;
  if ( removed === false) delete entry.removedAt;
  return entry;
}