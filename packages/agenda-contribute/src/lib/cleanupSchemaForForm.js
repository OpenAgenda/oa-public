import injectAgendaUIDAndSlug from './injectAgendaUID';

export default function cleanupSchemaForForm(schema, { agenda, apiRoot }) {
  schema.fields = schema.fields.filter(field => ![].concat(field.write).includes('internal'));

  const referencesField = schema.fields.find(f => f.field === 'references');

  if (referencesField) {
    referencesField.res = injectAgendaUIDAndSlug(referencesField.res, apiRoot, agenda);
  }

  return schema;
}
