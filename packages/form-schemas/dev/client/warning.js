import renderSchemaFromProps from './renderSchemaFromProps';

renderSchemaFromProps({
  lang: 'fr',
  unloadWarning: true,
  schema: {
    fields: [{
      field: 'bewarned',
      fieldType: 'text',
      label: 'Soyez avertis'
    }]
  }
});
