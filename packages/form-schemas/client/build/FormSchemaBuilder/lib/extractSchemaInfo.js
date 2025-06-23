import _findIndex from "lodash/findIndex.js";
export default (function (field) {
  let extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const matchingExtensionIndex = _findIndex(extensions.map(e => e.schema), e => e.id === field.schemaId);
  if (matchingExtensionIndex === -1) return null;
  return extensions[matchingExtensionIndex].info;
});
//# sourceMappingURL=extractSchemaInfo.js.map