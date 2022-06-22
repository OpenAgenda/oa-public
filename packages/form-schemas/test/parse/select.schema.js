'use strict';

module.exports = {
  nextOptionId: 5,
  custom: null,
  defaultLabelLanguage: null,
  fields: [{
    field: 'prif',
    label: {
      fr: 'PRIF',
      en: 'PRIF'
    },
    placeholder: null,
    info: null,
    sub: null,
    help: null,
    helpLink: null,
    helpContent: null,
    write: null,
    read: ['contributor', 'moderator', 'administrator'],
    optional: true,
    optionalWith: null,
    display: true,
    origin: 'custom',
    options: [
      {
        id: 1,
        value: '1-rosny',
        label: {
          fr: '1 - Rosny',
          en: '1 - Rosny'
        },
        info: null,
        display: true
      },
      {
        id: 2,
        value: '2-flicourt',
        label: {
          fr: '2 - Flicourt',
          en: '2 - Flicourt'
        },
        info: null,
        display: true
      },
      {
        id: 3,
        value: '3-moisson',
        label: {
          fr: '3 - Moisson',
          en: '3 - Moisson'
        },
        info: null,
        display: true
      },
      {
        id: 4,
        value: '4-roche-guyon',
        label: {
          fr: '4 - Roche-Guyon',
          en: '4 - Roche-Guyon'
        },
        info: null,
        display: true
      }
    ],
    fieldType: 'radio',
    enableWith: null,
    related: {
      enable: [],
      optional: []
    },
    default: null,
    constraints: undefined,
    selfHandled: [],
    enable: true
  }]
};
