import renderSchemaFromProps from './renderSchemaFromProps';

renderSchemaFromProps({
  res: { post: '', redirect: '/' },
  lang: 'fr',
  schema: {
    fields: [{
      field: 'adatefield',
      fieldType: 'date',
      label: 'Pick a date'
    }, {
      field: 'adisableddatefield',
      fieldType: 'date',
      label: {
        fr: 'Une date désactivée',
        en: 'A disabled date'
      },
      enableWith: 'adatefield'
    }]
  }
});
