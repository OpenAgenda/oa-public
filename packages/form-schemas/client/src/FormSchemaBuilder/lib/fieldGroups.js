import l from './labels.js';

function section({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'label',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.sectionLabel,
        info: l.sectionInfo,
      },
    ],
  };
}

function labels({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'label',
        fieldType: 'text',
        optional: false,
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldLabel,
      },
      {
        field: 'info',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldInfo,
        info: l.fieldInfoInfo,
      },
      {
        field: 'placeholder',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldPlaceholder,
        placeholder: l.fieldPlaceholderPlaceholder,
      },
      {
        field: 'sub',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldSub,
        sub: l.fieldSubSub,
      },
    ],
  };
}

function labelOnly({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'label',
        fieldType: 'text',
        optional: false,
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldLabel,
      },
    ],
  };
}

function info({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'info',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
      },
    ],
  };
}

function placeholderSub({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'placeholder',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldPlaceholder,
        placeholder: l.fieldPlaceholderPlaceholder,
      },
      {
        field: 'sub',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldSub,
        sub: l.fieldSubSub,
      },
    ],
  };
}

function help({ labelLanguages }) {
  return {
    fields: [
      {
        field: 'help',
        fieldType: 'text',
        languages: labelLanguages.length ? labelLanguages : null,
        label: l.fieldHelp,
        info: l.fieldHelpInfo,
      },
      {
        field: 'helpLink',
        fieldType: 'link',
        label: l.fieldHelpLink,
        placeholder: l.fieldHelpLinkPlaceholder,
      },
      {
        field: 'helpContent',
        fieldType: 'markdown',
        label: l.fieldHelpContent,
        info: l.fieldHelpContentInfo,
      },
    ],
  };
}

function options({ labelLanguages }) {
  return {
    fields: [
      {
        optional: false,
        field: 'options',
        fieldType: 'options',
        label: l.fieldOptions,
        labelLanguages: labelLanguages.length ? labelLanguages : null,
      },
    ],
  };
}

function minMax() {
  return {
    fields: [
      {
        field: 'min',
        fieldType: 'integer',
        default: 0,
        label: l.fieldFormMinTextLength,
      },
      {
        field: 'max',
        fieldType: 'integer',
        label: l.fieldFormMaxTextLength,
      },
    ],
  };
}

function optional() {
  return {
    fields: [
      {
        field: 'optional',
        fieldType: 'boolean',
        optional: true,
        default: true,
        label: l.fieldFormOptional,
      },
    ],
  };
}

function allowFalse() {
  return {
    fields: [
      {
        field: 'allowFalse',
        fieldType: 'boolean',
        optional: true,
        default: true,
        label: l.fieldFormAllowFalse,
      },
    ],
  };
}

export default {
  labels,
  labelOnly,
  info,
  placeholderSub,
  help,
  minMax,
  optional,
  options,
  section,
  allowFalse,
};
