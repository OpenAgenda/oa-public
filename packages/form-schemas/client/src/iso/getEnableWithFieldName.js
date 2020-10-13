module.exports = enableWith => {
  if (!enableWith) return;
  return typeof enableWith === 'string' ? enableWith : enableWith.field;
}
