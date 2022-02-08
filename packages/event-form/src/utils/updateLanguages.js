export default function updateLanguages(schema, languages) {
  schema.fields.forEach(field => {
    if (field.languages) {
      field.languages = languages;
    }
  })
}
