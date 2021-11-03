export default function cleanupSchemaForForm(schema, { locale }) {
  schema.fields = schema.fields.filter(field => ![].concat(field.write).includes('internal'));
  schema.fields.forEach(field => {
    if (field.languages) {
      field.languages = [locale];
    }
  });
  return schema;
}
