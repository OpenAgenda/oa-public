"use strict";

const should = require( 'should' );

const generateTagSet = require( '../server/legacy/generateTagSet' );

describe( 'form-schemas -09_2- unit (server): generate legacy tag sets from schema', function() {

  it( 'takes a form schema and returns a matching tag set', () => {

    const schema = {
      nextOptionId: 8,
      "defaultLabelLanguage": null,
      fields: [
        {
          field: 'niveau-scolaire',
          label: {
            fr: 'Niveau scolaire'
          },
          info: null,
          sub : null,
          help: null,
          helpLink: null,
          write: 'contributor',
          read: null,
          optional: false,
          display: true,
          min: null,
          max: null,
          options: [ {
            id: 1,
            value: 'ecole',
            label: {
              fr: 'Niveau scolaire: Ecole'
            }
          },
          {
            id: 2,
            value: 'college',
            label: {
              fr: 'Niveau scolaire: Collège'
            }
          },
          {
            "id": 3,
            "value": "lycee",
            "label": {
              "fr": "Niveau scolaire: Lycée"
            }
          },
          {
            "id": 4,
            "value": "autre",
            "label": {
              "fr": "Niveau scolaire: Autre"
            }
          } ],
          fieldType: "checkbox",
          "placeholder" : null,
          "origin" : "tags",
          enableWith : null,
          related: [],
          default: null
        },
        {
          field: "style-musical",
          label: {
            "fr": "Style musical"
          },
          info: null,
          placeholder : null,
          sub : null,
          help: null,
          helpLink: null,
          write: 'contributor',
          read: null,
          "optional": true,
          display: true,
          "options": [
            {
              "id": 5,
              "value": "a-cappella",
              "label": {
                "fr": "Style musical : A cappella"
              }
            },
            {
              "id": 6,
              "value": "afrique",
              "label": {
                "fr": "Style musical : Afrique"
              }
            },
            {
              "id": 7,
              "value": "baroque",
              "label": {
                "fr": "Style musical : Baroque"
              }
            }
          ],
          "fieldType": "radio",
          "origin" : "tags",
          enableWith : null,
          related: [],
          default: null
        }
      ],
      custom: null
    };

    generateTagSet( schema ).should.eql( {
      "groups": [ {
        "name": "Niveau scolaire",
        "tags": [
          {
            "label": "Niveau scolaire: Ecole",
            "slug": "ecole"
          },
          {
            "label": "Niveau scolaire: Collège",
            "slug": "college"
          },
          {
            "label": "Niveau scolaire: Lycée",
            "slug": "lycee"
          },
          {
            "label": "Niveau scolaire: Autre",
            "slug": "autre"
          }
        ],
        "required": true,
        "unique": false
      }, {
        "name": "Style musical",
        "tags": [
          {
            "label": "Style musical : A cappella",
            "slug": "a-cappella"
          },
          {
            "label": "Style musical : Afrique",
            "slug": "afrique"
          },
          {
            "label": "Style musical : Baroque",
            "slug": "baroque"
          }
        ],
        "required": false,
        "unique": true
      } ]
    } );

  } );

} );


