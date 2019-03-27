"use strict";

module.exports = {
  schema: {
    fields : [ {
      field : "first",
      fieldType : "text",
      optional : false,
      label : "Field one",
      info: 'There is a field below this one named "two"'
    }, {
      field: 'second',
      fieldType : 'text',
      display: false,
      label: 'This will not be displayed',
      default: 'Default text'
    }, {
      field: 'third',
      fieldType: 'text',
      label: 'Field three'
    }, {
      field: 'four',
      fieldType: 'text',
      label: 'Field four',
      display: false,
      languages: [ 'it', 'fr' ]
    } ]
  },
  lang: 'fr'
}
