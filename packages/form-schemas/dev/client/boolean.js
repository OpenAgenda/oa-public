import renderSchemaFromProps from './renderSchemaFromProps';

if (module.hot) module.hot.accept();

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
    }, {
      field: 'longlabelwithinfoandhelp',
      fieldType: 'boolean',
      label: 'This is an extremely long label that will take up more than one line in the form. The first line of the label should still appear on the line of the checkbox itself',
      info: 'An info text displayed under the label',
      help: 'Click here for more info',
      helpLink: 'https://openagenda.com'
    }]
  },
  onChange: ({ values }) => {
    console.log(values);
  }
});
