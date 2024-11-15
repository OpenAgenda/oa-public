export default ({ target, source }) => ({
  source,
  target,
  transform: (image) => (image ? image.base + image.filename : null),
});
