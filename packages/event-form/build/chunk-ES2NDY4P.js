// src/utils/extractLanguages.js
function extractLanguages(formSchema = null, values = null, options = {}) {
  const { defaultLanguage = "en" } = options;
  const fields = formSchema ? formSchema.fields : null;
  const languagesField = (fields ?? []).find((f) => f.field === "languages");
  const multilingualFields = fields ? fields.filter((f) => !!f.languages).map((f) => f.field) : ["title", "description", "longDescription", "keywords", "conditions"];
  const languages = multilingualFields.reduce((carry, fieldName) => {
    const fieldValue = values == null ? void 0 : values[fieldName];
    if (!fieldValue || !(fieldValue instanceof Object) || Array.isArray(fieldValue)) {
      return carry;
    }
    return carry.concat(
      Object.keys(fieldValue).filter((l) => !carry.includes(l))
    );
  }, (languagesField == null ? void 0 : languagesField.required) ?? []);
  if (languages.length) {
    return languages;
  }
  if (languagesField == null ? void 0 : languagesField.default) {
    return [].concat(languagesField.default);
  }
  return [defaultLanguage];
}

export {
  extractLanguages
};
//# sourceMappingURL=chunk-ES2NDY4P.js.map