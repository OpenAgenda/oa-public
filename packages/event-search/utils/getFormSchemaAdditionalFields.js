export default (formSchema = null) => {
  if (!formSchema || !formSchema.fields) return [];
  return formSchema.fields.filter(
    (field) => ![undefined, null].includes(field.schemaId),
  );
};
