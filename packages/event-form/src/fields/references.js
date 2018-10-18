"use strict";

module.exports = ( { res } ) => {

  return {
    field: 'references',
    label: {
      fr: 'Evénements liés',
      en: 'Related events'
    },
    fieldType: 'references',
    suggest: true,
    related: [ 'title', 'description' ],
    res: res || '/references'
  }

}
