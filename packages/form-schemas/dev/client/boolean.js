import renderSchemaFromProps from './renderSchemaFromProps';

renderSchemaFromProps({
  res: {
    post: '',
    redirect: '/'
  },
  lang: 'fr',
  schema: {
    fields: [{
      field: 'ayesorno',
      fieldType: 'boolean',
      label: 'Well ok',
      optional: false
    }]
  },
  onChange: ({ values }) => {
    console.log(values);
  }
});
