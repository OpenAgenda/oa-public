const labelKeys = ['label', 'info', 'placeholder'];

function amendWithFieldLanguages(field, existingLanguages = []) {
  let updatedLanguages = labelKeys.reduce(
    (languages, key) => languages.concat(
      (field[key] && (field[key] instanceof Object) ? Object.keys(field[key]) : [])
        .filter(l => !languages.includes(l))
        .filter(l => !!(field[key][l] ?? '').length)
    ),
    existingLanguages
  );

  (field?.options ?? []).forEach(option => {
    updatedLanguages = amendWithFieldLanguages(option, updatedLanguages);
  });

  return updatedLanguages;
}

export default function extractSchemaLabelLanguages(schema) {
  return (schema?.fields ?? []).reduce(
    (languages, field) => amendWithFieldLanguages(field, languages),
    []
  );
}
