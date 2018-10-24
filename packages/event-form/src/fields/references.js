"use strict";

module.exports = ( { res } ) => {

  return {
    field: 'references',
    label: {
      fr: 'Evénements liés',
      en: 'Related events'
    },
    fieldType: 'references',
    suggest: false,
    related: [ 'title', 'description', 'location' ],
    res: res || '/references'
  }

}
