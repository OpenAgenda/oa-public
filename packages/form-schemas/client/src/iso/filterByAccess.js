module.exports = function filterByAccess(formSchema, access) {
  if (!formSchema) {
    return formSchema;
  }

  formSchema.fields = formSchema.fields
    .filter(f => !(f.read ?? []).length || f.read.includes(access));

  return formSchema;
};
