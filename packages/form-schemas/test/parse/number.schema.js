'use strict';

module.exports = {
  nextOptionId: 1,
  custom: null,
  defaultLabelLanguage: null,
  fields: [{
    field: 'pi',
    optional: true,
    optionalWith: null,
    display: true,
    fieldType: 'number',
    read: [
      'contributor',
      'moderator',
      'administrator'
    ],
    write: null,
    min: null,
    max: null,
    label: {
      fr: 'Quelle est la valeur de PI',
      en: 'What is the value of PI'
    },
    info: null,
    placeholder: null,
    sub: null,
    help: null,
    helpLink: null,
    helpContent: null,
    origin: 'custom',
    enableWith: null,
    related: { enable: [], optional: [] },
    default: null,
    constraints: undefined,
    selfHandled: [],
    enable: true
  }]
};
