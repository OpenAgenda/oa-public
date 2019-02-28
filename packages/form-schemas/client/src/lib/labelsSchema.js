import labels from './builderLabels';

export default ( { labelLanguages } ) => ( {
  fields: [ {
    field: 'label',
    fieldType: 'text',
    optional: false,
    languages: labelLanguages,
    label: labels.fieldLabel
  }, {
    field: 'info',
    fieldType: 'text',
    languages: labelLanguages,
    label: labels.fieldInfo,
    info: labels.fieldInfoInfo
  }, {
    field: 'placeholder',
    fieldType: 'text',
    languages: labelLanguages,
    label: labels.fieldPlaceholder,
    placeholder: labels.fieldPlaceholderPlaceholder
  }, {
    field: 'sub',
    fieldType: 'text',
    languages: labelLanguages,
    label: labels.fieldSub,
    sub: labels.fieldSubSub
  } ]
} );
