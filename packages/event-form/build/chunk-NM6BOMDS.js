// src/utils/updateLanguages.js
function updateLanguages(schema, languages) {
  schema.fields.forEach((field) => {
    if (field.languages) {
      field.languages = languages;
    }
  });
}

export {
  updateLanguages
};
//# sourceMappingURL=chunk-NM6BOMDS.js.map