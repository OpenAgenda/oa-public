"use strict";

const { flatten } = require( '../client/src/FormSchemaComponent/helpers' );

test( 'flattens labels of form schema field', () => {

  const flat = flatten( {
    "field" : "facilite",
    "label" : {
      "fr" : "Facilité d'utilisation",
      "en" : "Ease of use"
    },
    "fieldType" : "radio",
    "optional" : false,
    "options" : [ {
      "id" : 1,
      "value" : "facile",
      "label" : {
        "fr" : "Facile",
        "en" : "Easy"
      }
    }, {
      "id" : 2,
      "value" : "plutotfacile",
      "label" : {
        "fr" : "Plutôt facile",
        "en" : "Rather easy"
      }
    }, {
      "id" : 3,
      "value" : "plutotdifficile",
      "label" : {
        "fr" : "Plutôt difficile",
        "en" : "Rather difficult"
      }
    }, {
      "id" : 4,
      "value" : "difficile",
      "label" : {
        "fr" : "Difficile",
        "en" : "Difficult"
      }
    } ]
  }, 'fr' );

  expect( flat ).toEqual( {
    field: 'facilite',
    label: 'Facilité d\'utilisation',
    fieldType: 'radio',
    optional: false,
    options: [ { id: 1, value: 'facile', label: 'Facile' },
       { id: 2, value: 'plutotfacile', label: 'Plutôt facile' },
       { id: 3, value: 'plutotdifficile', label: 'Plutôt difficile' },
       { id: 4, value: 'difficile', label: 'Difficile' } ]
  } );

} );
