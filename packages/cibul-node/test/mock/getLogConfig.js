export default (prefix, key) => ({
  debug: {
    prefix: `${prefix}:${key}:`,
  },
  token: null,
});
