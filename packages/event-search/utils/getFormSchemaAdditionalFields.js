'use strict';

module.exports = (formSchema = null) => {
  if (!formSchema) return [];
  return formSchema.fields.filter(field => field.schemaId !== undefined);
}
