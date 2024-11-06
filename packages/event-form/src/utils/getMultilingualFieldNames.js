export default (schema) =>
  schema.fields.filter((f) => f.languages).map((f) => f.field);
