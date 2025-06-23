import l from './labels.js';
function section(_ref) {
  let {
    labelLanguages
  } = _ref;
  return {
    fields: [{
      field: 'label',
      fieldType: 'text',
      languages: labelLanguages.length ? labelLanguages : null,
      label: l.sectionLabel,
      info: l.sectionInfo
    }]
  };
}
function labels(_ref2) {
  let {
    labelLanguages
  } = _ref2;
  return {
    fields: [{
      field: 'label',
      fieldType: 'text',
      optional: false,
      languages: labelLanguages.length ? labelLanguages : null,
      label: l.fieldLabel
    }, {
      field: 'info',
      fieldType: 'text',
      languages: labelLanguages.length ? labelLanguages : null,
      label: l.fieldInfo,
      info: l.fieldInfoInfo
    }, {
      field: 'placeholder',
      fieldType: 'text',
      languages: labelLanguages.length ? labelLanguages : null,
      label: l.fieldPlaceholder,
      placeholder: l.fieldPlaceholderPlaceholder
    }, {
      field: 'sub',
      fieldType: 'text',
      languages: labelLanguages.length ? labelLanguages : null,
      label: l.fieldSub,
      sub: l.fieldSubSub
    }]
  };
}
function options(_ref3) {
  let {
    labelLanguages
  } = _ref3;
  return {
    fields: [{
      optional: false,
      field: 'options',
      fieldType: 'options',
      label: l.fieldOptions,
      labelLanguages: labelLanguages.length ? labelLanguages : null
    }]
  };
}
function minMax() {
  return {
    fields: [{
      field: 'min',
      fieldType: 'integer',
      default: 0,
      label: l.fieldFormMinTextLength
    }, {
      field: 'max',
      fieldType: 'integer',
      label: l.fieldFormMaxTextLength
    }]
  };
}
function optional() {
  return {
    fields: [{
      field: 'optional',
      fieldType: 'boolean',
      optional: true,
      default: true,
      label: l.fieldFormOptional
    }]
  };
}
export default {
  labels,
  minMax,
  optional,
  options,
  section
};
//# sourceMappingURL=fieldGroups.js.map