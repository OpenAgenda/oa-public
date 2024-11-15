export default (set, defaultIndex) => {
  if (typeof set === 'string') {
    return defaultIndex;
  }
  return set.index;
};
