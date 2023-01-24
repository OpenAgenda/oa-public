export default function cleanupSchemaForForm(schema) {
  schema.fields = schema.fields.filter(field => ![].concat(field.write).includes('internal'));
  return schema;
}
