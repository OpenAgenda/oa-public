// src/utils/appendFormConfigurations.js
function appendFormFieldConfigurations(schema, { locationRes, tiles, fileStore }) {
  schema.fields.forEach((field) => {
    if (field.field === "location" && locationRes) {
      field.res = locationRes;
    }
    if (field.field === "location" && tiles) {
      field.tiles = tiles;
    }
    if (field.field === "image" && fileStore) {
      field.store = fileStore;
    }
  });
}

export {
  appendFormFieldConfigurations
};
//# sourceMappingURL=chunk-5PXKPOJR.js.map