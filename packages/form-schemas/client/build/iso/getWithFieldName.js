export default withParams => {
  if (!withParams) return;
  return typeof withParams === 'string' ? withParams : withParams.field;
};
//# sourceMappingURL=getWithFieldName.js.map