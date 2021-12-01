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
    }, {
      field: 'afieldwithavalue',
      fieldType: 'date',
      label: 'Une date avec une valeur'
    }]
  },
  values: {
    afieldwithavalue: '2021-11-04T23:00:00.000Z'
  }
});
