"use strict";

const should = require( 'should' );

const generateTagSet = require( '../server/legacy/generateTagSet' );

describe( 'form-schemas -09_2- unit (server): generate legacy tag sets from schema', function() {

  it( 'updates pre-existing tag set', () => {

    const schema = {
      fields: [ {
        origin: 'tags',
        field: 'nantes',
        label: 'Nantes',
        fieldType: 'checkbox',
        schemaId: 1,
        options: [ {
          id: 1,
          value: 'un',
          label: 'Un'
        }, {
          id: 2,
          value: 'deux',
          label: 'Deux'
        } ]
      }, {
        origin: 'tags',
        field: 'paris',
        label: 'Paris',
        fieldType: 'checkbox',
        schemaId: 1,
        options: [ {
          id: 3,
          value: 'trois',
          label: 'Trois'
        }, {
          id: 4,
          value: 'quatre',
          label: 'Quatre'
        } ]
      } ]
    };

    const tagSet = {
      groups: [ {
        name: 'Paris',
        required: true,
        unique: false,
        tags: [ {
          label: 'Trois',
          slug: 'trois',
          id: 192018
        } ]
      }, {
        name: 'Paris',
        required: true,
        unique: false,
        tags: [ {
          label: 'Trois',
          slug: 'trois',
          id: 192018
        } ]
      } ]
    };

    generateTagSet( schema, tagSet ).tagSet.should.eql( {
      groups: [ {
        "name": "Nantes",
        "required": true,
        "unique": false,
        "tags": [ {
          "slug": "un",
          "label": "Un",
          "schemaOptionId": "1.1"
        }, {
          "slug": "deux",
          "label": "Deux",
          "schemaOptionId": "1.2"
        } ]
      }, {
        "name": "Paris",
        "required": true,
        "unique": false,
        "tags": [ {
          "label": "Trois",
          "slug": "trois",
          "id": 192018, // maintain those, its important
          "schemaOptionId": "1.3" // add those
        }, {
          "slug": "quatre",
          "label": "Quatre",
          "schemaOptionId": "1.4"
        } ]
      } ]
    } );

  } );


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
          schemaId: 1,
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
          schemaId: 1,
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

    generateTagSet( schema ).tagSet.should.eql( {
      "groups": [ {
        "name": "Niveau scolaire",
        "tags": [
          {
            "label": "Niveau scolaire: Ecole",
            "slug": "ecole",
            "schemaOptionId" : "1.1"
          },
          {
            "label": "Niveau scolaire: Collège",
            "slug": "college",
            "schemaOptionId" : "1.2"
          },
          {
            "label": "Niveau scolaire: Lycée",
            "slug": "lycee",
            "schemaOptionId" : "1.3"
          },
          {
            "label": "Niveau scolaire: Autre",
            "slug": "autre",
            "schemaOptionId" : "1.4"
          }
        ],
        "required": true,
        "unique": false
      }, {
        "name": "Style musical",
        "tags": [
          {
            "label": "Style musical : A cappella",
            "slug": "a-cappella",
            "schemaOptionId" : "1.5"
          },
          {
            "label": "Style musical : Afrique",
            "slug": "afrique",
            "schemaOptionId" : "1.6"
          },
          {
            "label": "Style musical : Baroque",
            "slug": "baroque",
            "schemaOptionId" : "1.7"
          }
        ],
        "required": false,
        "unique": true
      } ]
    } );

  } );

} );


