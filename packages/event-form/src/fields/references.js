"use strict";

const _ = require( 'lodash' );

module.exports = ( { res } ) => {

  return {
    field: 'references',
    label: {
      fr: 'Evénements liés',
      en: 'Related events'
    },
    fieldType: 'references',
    suggest: false,
    boost: null, // could be { title: 30, description: 20, location: 10 }. Defined through schema extension
    limit: 3, // limit suggestions load count
    related: [ 'title', 'description', 'location' ], // this is customizable through schema extension
    res
  }

}
